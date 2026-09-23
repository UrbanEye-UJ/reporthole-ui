"use client";

/**
 * Dashcam PoC page (/dashcam).
 *
 * Turns the device into a road-damage dashcam:
 *  1. Streams the rear camera to a <video> element.
 *  2. Captures a frame every 2 seconds via a hidden <canvas>.
 *  3. Posts each frame to /api/inference/predict (Spring Boot ONNX endpoint).
 *  4. Applies confidence-based routing:
 *       ≥ 0.75  → AUTO_LOG  — incident created immediately, auto-verified
 *       ≥ 0.65  → ESCALATE  — incident created immediately too, but left for an admin to
 *                             review (same AI-approval threshold that gates any AI report) —
 *                             deliberately no driver interaction: tapping a screen mid-drive
 *                             isn't something this app should ever ask for.
 *       < 0.65  → DISCARD   — logged silently, no incident created
 *  5. Incident creation uses Authorization: Bearer <device-token> (not a JWT).
 *     The token is entered once and stored in localStorage.
 *
 * Auth: No login required. A device token (generated via POST /devices/token/generate
 * while logged in normally) is entered once and persisted in localStorage.
 *
 * HTTPS: camera and geolocation require a secure context. `npm run dev` always runs over HTTPS.
 */

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useGenerateToken } from "@/app/api/generated/devices/devices";
import { enqueue, remove, listQueued, isNetworkError, type QueuedMutation } from "@/lib/offlineQueue";
import { dispatchQueueChanged } from "@/lib/hooks/useOfflineSync";

const DISCARD_THRESHOLD = 0.65;
const AUTO_LOG_THRESHOLD = 0.75;
const CAPTURE_INTERVAL_MS = 2000;
const DEVICE_TOKEN_KEY = "dashcam_device_token";

type RoutingDecision = "AUTO_LOG" | "ESCALATE" | "DISCARD";
type EventStatus = "saving" | "pending_confirm" | "logged" | "duplicate" | "discarded" | "error";

interface DashcamEvent {
    id: string;
    timestamp: Date;
    label: string;
    confidence: number;
    /** General object detector (stock YOLO/COCO model) — informational only, never affects routing. */
    stockLabel?: string;
    stockConfidence?: number;
    decision: RoutingDecision;
    status: EventStatus;
    errorMessage?: string;
    /** Stored for a deferred retry-send if this was queued offline — not displayed. */
    imageBase64?: string;
    gps?: { latitude: number; longitude: number };
    /**
     * The detector's own bounding box, normalised [0,1] centre-based (YOLO format) — forwarded to
     * incident creation so the backend can auto-generate a training label. Undefined if the model
     * output didn't include one (never happens for a real detection, but the JSON fields are
     * individually nullable).
     */
    bbox?: { xCenter: number; yCenter: number; width: number; height: number };
}

interface PredictResponse {
    detected: boolean;
    detection: {
        label: string | null;
        confidence: number | null;
        bboxXCenter: number | null;
        bboxYCenter: number | null;
        bboxWidth: number | null;
        bboxHeight: number | null;
    };
    stockDetection?: {
        label: string | null;
        confidence: number | null;
        rawLabel: string | null;
    } | null;
}

/** Reads a Blob as a plain base64 string (no data-URI prefix). */
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(blob);
    });
}

export default function DashcamPage() {
    // ── Token state ────────────────────────────────────────────────────────
    // Initialized to null on both server and client — reading localStorage in the initializer
    // made the server-rendered token-entry screen and the client's first render (which would
    // immediately see a stored token, if any) disagree on which screen to show, a much bigger
    // hydration mismatch than a text label since it swaps the whole subtree. Set for real in an
    // effect instead, after hydration has already matched on the token-entry screen.
    const [deviceToken, setDeviceToken] = useState<string | null>(null);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDeviceToken(localStorage.getItem(DEVICE_TOKEN_KEY));
    }, []);
    const [tokenInput, setTokenInput] = useState("");

    // ── Camera state ───────────────────────────────────────────────────────
    const [isActive, setIsActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // ── GPS state ──────────────────────────────────────────────────────────
    const [gps, setGps] = useState<{ latitude: number; longitude: number } | null>(null);
    const [gpsError, setGpsError] = useState<string | null>(null);

    // ── Detection feedback ─────────────────────────────────────────────────
    const [lastDetection, setLastDetection] = useState<{ label: string; confidence: number } | null>(null);
    const [events, setEvents] = useState<DashcamEvent[]>([]);

    // ── Refs (survive setInterval without re-creating it) ──────────────────
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const activeRef = useRef(false);
    /** Mirrors gps state so the interval callback always reads the latest value. */
    const gpsRef = useRef<{ latitude: number; longitude: number } | null>(null);
    /** Mirrors deviceToken state so the interval callback always reads the latest value. */
    const tokenRef = useRef<string | null>(null);

    // Keep refs in sync with state
    useEffect(() => { gpsRef.current = gps; }, [gps]);
    useEffect(() => { tokenRef.current = deviceToken; }, [deviceToken]);

    // ── GPS watcher (starts once token is known) ───────────────────────────
    useEffect(() => {
        if (deviceToken === null) return;
        if (!("geolocation" in navigator)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setGpsError("Geolocation not available on this device.");
            return;
        }
        const id = navigator.geolocation.watchPosition(
            (pos) => {
                setGps({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                setGpsError(null);
            },
            (err) => setGpsError(`GPS unavailable: ${err.message}`),
            { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(id);
    }, [deviceToken]);

    // ── Restore queued detections from a previous session ──────────────────
    // If the page was closed/reloaded while a detection was queued offline, it wouldn't
    // otherwise appear in this fresh `events` state — pull it back in so it's still visible
    // and confirmable rather than silently sitting in IndexedDB.
    useEffect(() => {
        listQueued().then((items) => {
            const restored: DashcamEvent[] = items
                .filter((i): i is QueuedMutation & { kind: "dashcam-report" } => i.kind === "dashcam-report")
                .map((i) => {
                    const body = i.body as {
                        incidentType: string;
                        latitude: number;
                        longitude: number;
                        imageBase64: string;
                    };
                    return {
                        id: i.id,
                        timestamp: new Date(i.createdAt),
                        label: body.incidentType,
                        confidence: 0,
                        decision: i.dashcamDecision ?? "ESCALATE",
                        status: "pending_confirm",
                        imageBase64: body.imageBase64,
                        gps: { latitude: body.latitude, longitude: body.longitude },
                    };
                });
            if (restored.length === 0) return;
            setEvents((prev) => {
                const existingIds = new Set(prev.map((e) => e.id));
                const toAdd = restored.filter((e) => !existingIds.has(e.id));
                return toAdd.length ? [...toAdd, ...prev] : prev;
            });
        });
    }, []);

    // ── Event log helpers ──────────────────────────────────────────────────

    const addEvent = useCallback((event: DashcamEvent) => {
        setEvents((prev) => [event, ...prev].slice(0, 50));
    }, []);

    const updateEvent = useCallback((id: string, patch: Partial<DashcamEvent>) => {
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    }, []);

    // ── Incident creation ──────────────────────────────────────────────────

    /**
     * Posts a captured frame to the backend as a DASHCAM incident.
     * Uses Authorization: Bearer <device-token> — not the shared axios
     * instance, which would inject a JWT from the cookie (or redirect to
     * /login on 401 if no cookie is present).
     *
     * `decision` is the event's own routing tier (AUTO_LOG or ESCALATE) — both submit immediately
     * with no driver interaction; the only difference is what happens to the incident once it
     * exists server-side (AUTO_LOG auto-verifies, ESCALATE lands in the admin's AI review queue,
     * via the same AI-approval-threshold logic every AI-generated incident goes through). Carried
     * through to the offline queue purely so a network failure here queues correctly — see
     * `useOfflineSync.ts`.
     */
    const createIncident = useCallback(async (
        eventId: string,
        label: string,
        confidence: number,
        imageBase64: string,
        coords: { latitude: number; longitude: number },
        decision: "AUTO_LOG" | "ESCALATE",
        bbox?: { xCenter: number; yCenter: number; width: number; height: number }
    ) => {
        const token = tokenRef.current;
        if (!token) return;

        const payload = {
            incidentType: label,
            description: `Dashcam: ${label} detected at ${Math.round(confidence * 100)}% confidence.`,
            source: "DASHCAM",
            latitude: coords.latitude,
            longitude: coords.longitude,
            imageBase64,
            forceCreate: false,
            occurredAt: new Date().toISOString(),
            confidence,
            bboxXCenter: bbox?.xCenter,
            bboxYCenter: bbox?.yCenter,
            bboxWidth: bbox?.width,
            bboxHeight: bbox?.height,
        };

        try {
            const res = await fetch("/api/incidents/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.status === 401) {
                updateEvent(eventId, {
                    status: "error",
                    errorMessage: "Invalid device token — clear and re-enter it.",
                });
                await remove(eventId);
                return;
            }
            if (!res.ok) {
                updateEvent(eventId, { status: "error", errorMessage: `Server error (${res.status})` });
                await remove(eventId);
                return;
            }

            const body = await res.json();
            // Backend returns duplicate:true with HTTP 200 when a nearby incident exists
            updateEvent(eventId, { status: body.data?.duplicate ? "duplicate" : "logged" });
            await remove(eventId);
        } catch (err) {
            if (isNetworkError(err)) {
                await enqueue({
                    id: eventId,
                    kind: "dashcam-report",
                    url: "/incidents/create",
                    method: "POST",
                    body: payload,
                    authMode: "device-token",
                    deviceToken: token,
                    dashcamDecision: decision,
                });
                dispatchQueueChanged((await listQueued()).length);
                updateEvent(eventId, {
                    status: "pending_confirm",
                    imageBase64,
                    gps: coords,
                    errorMessage: undefined,
                });
            } else {
                updateEvent(eventId, { status: "error", errorMessage: "Network error — incident not saved." });
            }
        }
    }, [updateEvent]);

    // ── Frame capture & analysis ───────────────────────────────────────────

    const captureAndAnalyse = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;

        // Draw the current video frame onto the hidden canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")!.drawImage(video, 0, 0);

        // Capture as JPEG blob (for ML multipart upload)
        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.85)
        );
        if (!blob) return;

        // Read as base64 for backend incident creation
        const base64 = await blobToBase64(blob);

        // Send frame to BE inference endpoint via Caddy (/api/inference/predict)
        let prediction: PredictResponse;
        try {
            const form = new FormData();
            form.append("image", blob, "frame.jpg");
            const mlRes = await fetch("/api/inference/predict", { method: "POST", body: form });
            if (!mlRes.ok) return;
            prediction = await mlRes.json();
        } catch {
            return; // ML service unreachable — skip this frame silently
        }

        // Nothing detected or below minimum confidence
        if (
            !prediction.detected ||
            prediction.detection.label === null ||
            prediction.detection.confidence === null
        ) {
            return;
        }

        const label = prediction.detection.label;
        const confidence = prediction.detection.confidence;
        const coords = gpsRef.current;
        const stockLabel = prediction.stockDetection?.label ?? undefined;
        const stockConfidence = prediction.stockDetection?.confidence ?? undefined;
        const { bboxXCenter, bboxYCenter, bboxWidth, bboxHeight } = prediction.detection;
        const bbox = bboxXCenter != null && bboxYCenter != null && bboxWidth != null && bboxHeight != null
            ? { xCenter: bboxXCenter, yCenter: bboxYCenter, width: bboxWidth, height: bboxHeight }
            : undefined;

        setLastDetection({ label, confidence });

        // Apply routing thresholds
        let decision: RoutingDecision;
        if (confidence >= AUTO_LOG_THRESHOLD) {
            decision = "AUTO_LOG";
        } else if (confidence >= DISCARD_THRESHOLD) {
            decision = "ESCALATE";
        } else {
            decision = "DISCARD";
        }

        const eventId = crypto.randomUUID();

        if (decision === "DISCARD") {
            addEvent({ id: eventId, timestamp: new Date(), label, confidence, stockLabel, stockConfidence, decision, status: "discarded" });
            return;
        }

        if (!coords) {
            // Can't create an incident without GPS coordinates
            addEvent({
                id: eventId,
                timestamp: new Date(),
                label,
                confidence,
                stockLabel,
                stockConfidence,
                decision,
                status: "error",
                errorMessage: "No GPS fix — incident not saved.",
            });
            return;
        }

        // Both tiers submit immediately, no driver interaction — AUTO_LOG auto-verifies
        // server-side, ESCALATE lands in the admin's AI review queue. imageBase64/gps are kept on
        // the event even though this path doesn't normally need deferred confirmation — if
        // createIncident below queues this (offline), it becomes a pending_confirm item and needs
        // these to let it be retried later.
        addEvent({
            id: eventId,
            timestamp: new Date(),
            label,
            confidence,
            stockLabel,
            stockConfidence,
            decision,
            status: "saving",
            imageBase64: base64,
            gps: coords,
            bbox,
        });
        await createIncident(eventId, label, confidence, base64, coords, decision, bbox);
    }, [addEvent, createIncident]);

    // ── Camera start / stop ────────────────────────────────────────────────

    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            activeRef.current = true;
            setIsActive(true);
            intervalRef.current = setInterval(() => {
                if (activeRef.current) captureAndAnalyse();
            }, CAPTURE_INTERVAL_MS);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Camera access denied.";
            // getUserMedia fails with a generic NotAllowedError on non-HTTPS origins
            setCameraError(
                msg.toLowerCase().includes("not allowed") || msg.toLowerCase().includes("secure")
                    ? "Camera requires HTTPS. Start the dev server with `npm run dev`."
                    : `Camera error: ${msg}`
            );
        }
    }, [captureAndAnalyse]);

    const stopCamera = useCallback(() => {
        activeRef.current = false;
        setIsActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
    }, []);

    // Stop camera on unmount
    useEffect(() => () => { stopCamera(); }, [stopCamera]);

    // ── Token generation ───────────────────────────────────────────────────

    const isLoggedIn = typeof document !== "undefined" && !!document.cookie.match(/reporthole_token=[^;]+/);

    const { mutate: generateToken, isPending: isGenerating } = useGenerateToken({
        mutation: {
            onSuccess: (res) => {
                const token = res.data?.deviceToken;
                if (token) setTokenInput(token);
            },
        },
    });

    // ── Token actions ──────────────────────────────────────────────────────

    const handleTokenSubmit = () => {
        const trimmed = tokenInput.trim();
        if (!trimmed) return;
        localStorage.setItem(DEVICE_TOKEN_KEY, trimmed);
        setDeviceToken(trimmed);
        tokenRef.current = trimmed;
        setTokenInput("");
    };

    const handleClearToken = () => {
        stopCamera();
        localStorage.removeItem(DEVICE_TOKEN_KEY);
        setDeviceToken(null);
        tokenRef.current = null;
        setEvents([]);
        setLastDetection(null);
    };

    // ── Token entry screen ─────────────────────────────────────────────────

    if (deviceToken === null) {
        return (
            <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-sm flex flex-col gap-4">
                    <div>
                        <Link
                            href="/profile"
                            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Back to profile
                        </Link>
                        <h1 className="text-lg font-bold text-gray-900">Reporthole Dashcam</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Enter your device token to begin. Generate one from your account while logged in.
                        </p>
                    </div>
                    <input
                        type="text"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleTokenSubmit()}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    {isLoggedIn && (
                        <button
                            type="button"
                            onClick={() => generateToken()}
                            disabled={isGenerating}
                            className="w-full border border-gray-300 hover:bg-gray-50 disabled:opacity-40 text-gray-900 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                        >
                            {isGenerating ? "Generating…" : "Generate token for this device"}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleTokenSubmit}
                        disabled={!tokenInput.trim()}
                        className="bg-gray-900 hover:bg-gray-800 active:bg-gray-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                    >
                        Start Dashcam
                    </button>
                </div>
            </main>
        );
    }

    // ── Main dashcam screen ────────────────────────────────────────────────

    return (
        <main className="h-[100dvh] bg-gray-950 text-white flex flex-col overflow-hidden">

            {/* Live camera feed — ~65% of the screen */}
            <div className="relative w-full bg-black shrink-0 h-[65dvh]">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />
                {/* Frame capture target — never displayed */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Last detection overlay */}
                {lastDetection && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-mono">
                        <span className="text-green-400">{lastDetection.label.replace(/_/g, " ")}</span>
                        <span className="text-gray-400 ml-2">
                            {Math.round(lastDetection.confidence * 100)}%
                        </span>
                    </div>
                )}

                {/* Back to profile */}
                <Link
                    href="/profile"
                    aria-label="Back to profile"
                    className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg p-2 text-white hover:bg-black/80 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </Link>

                {/* Camera error banner */}
                {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
                        <p className="text-red-400 text-sm text-center">{cameraError}</p>
                    </div>
                )}
            </div>

            {/* Controls bar — compact strip between the camera and the log, not counted in either's share */}
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-900 shrink-0">
                <div className="text-xs font-mono truncate">
                    {gpsError ? (
                        <span className="text-yellow-400">{gpsError}</span>
                    ) : gps ? (
                        <span className="text-gray-400">
                            {gps.latitude.toFixed(5)}, {gps.longitude.toFixed(5)}
                        </span>
                    ) : (
                        <span className="text-gray-600">Waiting for GPS…</span>
                    )}
                </div>
                <div className="flex shrink-0 gap-2">
                    <button
                        type="button"
                        onClick={isActive ? stopCamera : startCamera}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            isActive
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-white hover:bg-gray-100 text-gray-900"
                        }`}
                    >
                        {isActive ? "Stop" : "Start"}
                    </button>
                    <button
                        type="button"
                        onClick={handleClearToken}
                        className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 transition-colors"
                    >
                        Clear token
                    </button>
                </div>
            </div>

            {/* Prediction log — ~35% of the screen, scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-2">
                {events.length === 0 && (
                    <p className="text-gray-600 text-sm text-center py-8">
                        {isActive ? "Scanning…" : "Press Start to begin scanning."}
                    </p>
                )}
                {events.map((event) => (
                    <EventLogEntry
                        key={event.id}
                        event={event}
                        onConfirm={() =>
                            createIncident(
                                event.id,
                                event.label,
                                event.confidence,
                                event.imageBase64!,
                                event.gps!,
                                event.decision as "AUTO_LOG" | "ESCALATE",
                                event.bbox
                            )
                        }
                        onMarkSaving={() => updateEvent(event.id, { status: "saving" })}
                    />
                ))}
            </div>
        </main>
    );
}

// ── EventLogEntry component ────────────────────────────────────────────────

interface EventLogEntryProps {
    event: DashcamEvent;
    /** Called when the user retries a queued (offline) dashcam item. */
    onConfirm: () => void;
    /** Optimistically marks the event as saving before onConfirm resolves. */
    onMarkSaving: () => void;
}

/**
 * Renders a single entry in the dashcam detection event log.
 *
 * AUTO_LOG and ESCALATE both submit with no driver interaction. An entry only shows a "Confirm
 * incident" (really: retry-send) button if that submission failed for lack of connection —
 * tapping it retries the same send, it isn't a review/approval step.
 */
function EventLogEntry({ event, onConfirm, onMarkSaving }: EventLogEntryProps) {
    const decisionColour: Record<RoutingDecision, string> = {
        AUTO_LOG: "text-green-400",
        ESCALATE: "text-yellow-400",
        DISCARD: "text-gray-500",
    };

    const statusText: Record<EventStatus, string> = {
        saving: "Saving…",
        // Only ever reached by being queued offline — neither tier needs a review tap anymore.
        pending_confirm: "No connection — tap to send",
        logged: "Logged",
        duplicate: "Duplicate — already on record",
        discarded: "Discarded",
        error: event.errorMessage ?? "Error",
    };

    const isConfirmable =
        (event.decision === "ESCALATE" || event.decision === "AUTO_LOG") &&
        event.status === "pending_confirm" &&
        !!event.imageBase64 &&
        !!event.gps;

    // Whichever model scored higher is shown as the dominant line — purely a display choice,
    // routing below is always driven by the road-damage model's own confidence regardless of
    // which one is bigger here.
    const hasStock = !!event.stockLabel && typeof event.stockConfidence === "number";
    const stockIsHigher = hasStock && (event.stockConfidence as number) > event.confidence;
    const primary = stockIsHigher
        ? { source: "General detector", label: event.stockLabel!, confidence: event.stockConfidence! }
        : { source: "Road damage", label: event.label, confidence: event.confidence };
    const secondary = hasStock
        ? (stockIsHigher
            ? { source: "Road damage", label: event.label, confidence: event.confidence }
            : { source: "General detector", label: event.stockLabel!, confidence: event.stockConfidence! })
        : null;

    return (
        <div className="bg-gray-900 rounded-lg px-3 py-2.5 flex flex-col gap-1">
            {/* Primary: whichever model scored higher — the dominant visual element of the log */}
            <div className="flex items-center justify-between gap-2">
                <span className="text-base font-bold text-white">
                    {primary.label.replace(/_/g, " ")}
                    <span className="text-[11px] font-normal text-gray-500 ml-1.5">({primary.source})</span>
                </span>
                <span className="text-lg font-bold text-gray-100 tabular-nums">
                    {Math.round(primary.confidence * 100)}%
                </span>
            </div>

            {/* Secondary: the other model's score, if present */}
            {secondary && (
                <span className="text-[11px] text-gray-500">
                    {secondary.source}: {secondary.label.replace(/_/g, " ")} ({Math.round(secondary.confidence * 100)}%)
                </span>
            )}

            {/* Tertiary: timestamp, decision, status */}
            <div className="flex items-center gap-3 text-[11px] flex-wrap mt-0.5">
                <span className="text-gray-500 font-mono">
                    {event.timestamp.toLocaleTimeString("en-ZA", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    })}
                </span>
                <span className={decisionColour[event.decision]}>
                    {event.decision.replace("_", " ")}
                </span>
                <span className={event.status === "error" ? "text-red-400" : "text-gray-500"}>
                    {statusText[event.status]}
                </span>
            </div>
            {isConfirmable && (
                <button
                    type="button"
                    onClick={() => { onMarkSaving(); onConfirm(); }}
                    className="mt-1 self-start bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                >
                    Retry send
                </button>
            )}
        </div>
    );
}
