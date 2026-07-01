"use client";

/**
 * Dashcam PoC page (/dashcam).
 *
 * Turns the device into a road-damage dashcam:
 *  1. Streams the rear camera to a <video> element.
 *  2. Captures a frame every 2 seconds via a hidden <canvas>.
 *  3. Posts each frame to /api/ml/predict (Next.js proxy → ML service).
 *  4. Applies confidence-based routing:
 *       ≥ 0.80  → AUTO_LOG  — incident created immediately
 *       ≥ 0.65  → ESCALATE  — user must tap "Confirm" in the event log
 *       < 0.65  → DISCARD   — logged silently, no incident created
 *  5. Incident creation uses Authorization: Bearer <device-token> (not a JWT).
 *     The token is entered once and stored in localStorage.
 *
 * Auth: No login required. A device token (generated via POST /devices/token/generate
 * while logged in normally) is entered once and persisted in localStorage.
 *
 * HTTPS: camera and geolocation require a secure context. Use `npm run dev:https`.
 */

import { useRef, useState, useEffect, useCallback } from "react";

const DISCARD_THRESHOLD = 0.65;
const AUTO_LOG_THRESHOLD = 0.80;
const CAPTURE_INTERVAL_MS = 2000;
const DEVICE_TOKEN_KEY = "dashcam_device_token";

type RoutingDecision = "AUTO_LOG" | "ESCALATE" | "DISCARD";
type EventStatus = "saving" | "pending_confirm" | "logged" | "duplicate" | "discarded" | "error";

interface DashcamEvent {
    id: string;
    timestamp: Date;
    label: string;
    confidence: number;
    decision: RoutingDecision;
    status: EventStatus;
    errorMessage?: string;
    /** Stored for deferred ESCALATE confirmation — not displayed. */
    imageBase64?: string;
    gps?: { latitude: number; longitude: number };
}

interface PredictResponse {
    detected: boolean;
    detection: {
        label: string | null;
        confidence: number | null;
        bbox: number[] | null;
        raw_label: string | null;
    };
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
    const [deviceToken, setDeviceToken] = useState<string | null>(null);
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

    // ── Load token from localStorage on mount ──────────────────────────────
    useEffect(() => {
        const saved = localStorage.getItem(DEVICE_TOKEN_KEY);
        setDeviceToken(saved);
        tokenRef.current = saved;
    }, []);

    // Keep refs in sync with state
    useEffect(() => { gpsRef.current = gps; }, [gps]);
    useEffect(() => { tokenRef.current = deviceToken; }, [deviceToken]);

    // ── GPS watcher (starts once token is known) ───────────────────────────
    useEffect(() => {
        if (deviceToken === null) return;
        if (!("geolocation" in navigator)) {
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
     */
    const createIncident = useCallback(async (
        eventId: string,
        label: string,
        confidence: number,
        imageBase64: string,
        coords: { latitude: number; longitude: number }
    ) => {
        const token = tokenRef.current;
        if (!token) return;

        try {
            const res = await fetch("/api/incidents/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    incidentType: label,
                    description: `Dashcam: ${label} detected at ${Math.round(confidence * 100)}% confidence.`,
                    source: "DASHCAM",
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    imageBase64,
                    forceCreate: false,
                }),
            });

            if (res.status === 401) {
                updateEvent(eventId, {
                    status: "error",
                    errorMessage: "Invalid device token — clear and re-enter it.",
                });
                return;
            }
            if (!res.ok) {
                updateEvent(eventId, { status: "error", errorMessage: `Server error (${res.status})` });
                return;
            }

            const body = await res.json();
            // Backend returns duplicate:true with HTTP 200 when a nearby incident exists
            updateEvent(eventId, { status: body.data?.duplicate ? "duplicate" : "logged" });
        } catch {
            updateEvent(eventId, { status: "error", errorMessage: "Network error — incident not saved." });
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

        // Send frame to ML service via the /api/ml/predict Route Handler
        let prediction: PredictResponse;
        try {
            const form = new FormData();
            form.append("image", blob, "frame.jpg");
            const mlRes = await fetch("/api/ml/predict", { method: "POST", body: form });
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
            addEvent({ id: eventId, timestamp: new Date(), label, confidence, decision, status: "discarded" });
            return;
        }

        if (!coords) {
            // Can't create an incident without GPS coordinates
            addEvent({
                id: eventId,
                timestamp: new Date(),
                label,
                confidence,
                decision,
                status: "error",
                errorMessage: "No GPS fix — incident not saved.",
            });
            return;
        }

        if (decision === "AUTO_LOG") {
            addEvent({ id: eventId, timestamp: new Date(), label, confidence, decision, status: "saving" });
            await createIncident(eventId, label, confidence, base64, coords);
        } else {
            // ESCALATE — hold in log with imageBase64 and gps for deferred confirmation
            addEvent({
                id: eventId,
                timestamp: new Date(),
                label,
                confidence,
                decision,
                status: "pending_confirm",
                imageBase64: base64,
                gps: coords,
            });
        }
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
                    ? "Camera requires HTTPS. Start the dev server with `npm run dev:https`."
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
                        <h1 className="text-lg font-bold text-blue-600">Reporthole Dashcam</h1>
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
                        className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        onClick={handleTokenSubmit}
                        disabled={!tokenInput.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                    >
                        Start Dashcam
                    </button>
                </div>
            </main>
        );
    }

    // ── Main dashcam screen ────────────────────────────────────────────────

    return (
        <main className="min-h-screen bg-gray-950 text-white flex flex-col">

            {/* Live camera feed */}
            <div className="relative w-full aspect-video bg-black">
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

                {/* Camera error banner */}
                {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
                        <p className="text-red-400 text-sm text-center">{cameraError}</p>
                    </div>
                )}
            </div>

            {/* Controls bar */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-900">
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
                            isActive ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
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

            {/* Event log */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
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
                                event.gps!
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
    /** Called when the user confirms an ESCALATE detection. */
    onConfirm: () => void;
    /** Optimistically marks the event as saving before onConfirm resolves. */
    onMarkSaving: () => void;
}

/**
 * Renders a single entry in the dashcam detection event log.
 *
 * ESCALATE entries show a "Confirm incident" button. Clicking it marks the
 * entry as saving optimistically, then triggers incident creation. All other
 * decisions display their status inline.
 */
function EventLogEntry({ event, onConfirm, onMarkSaving }: EventLogEntryProps) {
    const decisionColour: Record<RoutingDecision, string> = {
        AUTO_LOG: "text-green-400",
        ESCALATE: "text-yellow-400",
        DISCARD: "text-gray-500",
    };

    const statusText: Record<EventStatus, string> = {
        saving: "Saving…",
        pending_confirm: "Awaiting confirmation",
        logged: "Logged",
        duplicate: "Duplicate — already on record",
        discarded: "Discarded",
        error: event.errorMessage ?? "Error",
    };

    const isConfirmable =
        event.decision === "ESCALATE" &&
        event.status === "pending_confirm" &&
        !!event.imageBase64 &&
        !!event.gps;

    return (
        <div className="bg-gray-900 rounded-lg px-3 py-2.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{event.label.replace(/_/g, " ")}</span>
                <span className="text-xs text-gray-500 font-mono">
                    {event.timestamp.toLocaleTimeString("en-ZA", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    })}
                </span>
            </div>
            <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="text-gray-400">
                    {Math.round(event.confidence * 100)}% confidence
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
                    Confirm incident
                </button>
            )}
        </div>
    );
}
