"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
    useCreateIncident,
    useConfirmDuplicate,
} from "@/app/api/generated/incidents/incidents";
import {
    DetectionDTO,
    IncidentRequestDTO,
    IncidentRequestDTOIncidentType,
    IncidentResponseDTO,
    PredictResponseDTO,
} from "@/app/api/generated/openAPIDefinition.schemas";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), { ssr: false });

const ISSUE_TYPES = Object.values(IncidentRequestDTOIncidentType);

function getCurrentUserId(): string | null {
    try {
        const token = document.cookie.split("; ").find((r) => r.startsWith("reporthole_token="))?.split("=")[1];
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub ?? null;
    } catch {
        return null;
    }
}

interface Coords {
    latitude: number;
    longitude: number;
}

interface ReportIssueModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: (incident: IncidentResponseDTO) => void;
}

/** Steps in the modal flow. */
type Step = "choose" | "ai-detect" | "form" | "duplicate" | "success";

/**
 * Compresses an image file to a JPEG blob no larger than {@code maxBytes}.
 * Scales the image down to fit within 1024×1024 and reduces JPEG quality
 * iteratively until the size target is met. Inference only needs enough
 * detail for the model's 640×640 input — high resolution is wasted.
 */
async function compressForInference(file: File, maxBytes = 900_000): Promise<Blob> {
    const bitmap = await createImageBitmap(file);
    const MAX_DIM = 1024;
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    for (let quality = 0.85; quality >= 0.3; quality -= 0.1) {
        const blob = await new Promise<Blob>((res) =>
            canvas.toBlob((b) => res(b!), "image/jpeg", quality)
        );
        if (blob.size <= maxBytes) return blob;
    }
    return new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.3));
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Maps a raw inference label to the nearest IncidentRequestDTOIncidentType value.
 * The inference endpoint returns labels that already match the enum when possible
 * (POTHOLE, CRACK, BLOCKED_DRAIN, ACCIDENT). Unknown labels fall back to POTHOLE.
 */
function inferredLabelToIssueType(label: string): IncidentRequestDTOIncidentType {
    const known = ISSUE_TYPES.find((t) => t === label);
    return known ?? IncidentRequestDTOIncidentType.POTHOLE;
}

/**
 * Report-incident modal with two entry modes.
 *
 * **Choose step (initial):** Asks the user whether they want AI-assisted
 * detection or a manual form. Only shown on first open — once a mode is
 * selected the user is taken directly to the relevant step.
 *
 * **AI-detect step:** User takes or uploads a photo. The image is sent to
 * POST /api/ml/predict and the returned label pre-fills the issue type and
 * description in the manual form. If detection fails or the user disagrees,
 * they can switch to the manual form.
 *
 * **Form step:** Standard manual report form (issue type, description, image,
 * location). Supports separate "Take Photo" and "Upload from Gallery" actions.
 */
export default function ReportIssueModal({ visible, onClose }: ReportIssueModalProps) {
    const [step, setStep] = useState<Step>("choose");

    // Form state
    const [type, setType] = useState<IncidentRequestDTOIncidentType>(ISSUE_TYPES[0]);
    const [description, setDescription] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [coords, setCoords] = useState<Coords | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [geocoding, setGeocoding] = useState(false);
    const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [duplicate, setDuplicate] = useState<IncidentResponseDTO | null>(null);

    // AI-detect state
    const [aiFile, setAiFile] = useState<File | null>(null);
    const [aiPreview, setAiPreview] = useState<string | null>(null);
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<DetectionDTO | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    // File input refs — separate refs for camera and gallery
    const cameraRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);
    const aiCameraRef = useRef<HTMLInputElement>(null);
    const aiGalleryRef = useRef<HTMLInputElement>(null);

    const reverseGeocode = useCallback(async (lat: number, lng: number) => {
        setGeocoding(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                { headers: { "User-Agent": "Reporthole/1.0 (refentsengoako101@gmail.com)" } }
            );
            const data = await res.json();
            const { road, suburb, city, town, village, county } = data.address ?? {};
            const parts = [road, suburb, city ?? town ?? village ?? county].filter(Boolean);
            setAddress(parts.join(", ") || data.display_name || null);
        } catch {
            setAddress(null);
        } finally {
            setGeocoding(false);
        }
    }, []);

    // Request geolocation whenever the modal becomes visible (not just on first open)
    useEffect(() => {
        if (visible && !coords && navigator.geolocation) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocating(true);
            setError(null);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setCoords({ latitude: lat, longitude: lng });
                    setLocating(false);
                    reverseGeocode(lat, lng);
                },
                (err) => {
                    console.warn(`[Geolocation] auto-prompt error — code: ${err.code}, message: ${err.message}`);
                    setError("Could not get your location. Please enable location permissions and try again.");
                    setLocating(false);
                }
            );
        }
    }, [visible, reverseGeocode]);

    const createIncident = useCreateIncident({
        mutation: {
            onSuccess: (res) => {
                if (res.data?.duplicate) {
                    setDuplicate(res.data);
                    setStep("duplicate");
                } else {
                    setStep("success");
                }
            },
            onError: (err: unknown) => {
                const status = (err as { response?: { status?: number } }).response?.status;
                if (status === 404 || status === 401) {
                    document.cookie = "reporthole_token=; path=/; max-age=0";
                    document.cookie = "reporthole_role=; path=/; max-age=0";
                    window.location.href = "/login";
                } else {
                    setError("Something went wrong. Please try again.");
                }
            },
        },
    });

    const confirmDuplicate = useConfirmDuplicate({
        mutation: {
            onSuccess: () => setStep("success"),
            onError: () => setError("Something went wrong. Please try again."),
        },
    });

    const handleMapLocationChange = useCallback((lat: number, lng: number) => {
        setCoords({ latitude: lat, longitude: lng });
        if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
        geocodeTimer.current = setTimeout(() => reverseGeocode(lat, lng), 500);
    }, [reverseGeocode]);

    const handleGetLocation = async () => {
        if (!navigator.geolocation) {
            setError("Your browser does not support location. Try Chrome or Safari.");
            return;
        }

        if (navigator.permissions) {
            const permission = await navigator.permissions.query({ name: "geolocation" });
            if (permission.state === "denied") {
                setError("Location access is blocked. To fix this: open your browser's site settings for this page and set Location to Allow, then refresh.");
                return;
            }
        }

        setLocating(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCoords({ latitude: lat, longitude: lng });
                setLocating(false);
                reverseGeocode(lat, lng);
            },
            (err) => {
                console.warn(`[Geolocation] button error — code: ${err.code}, message: ${err.message}`);
                setLocating(false);
                if (err.code === err.PERMISSION_DENIED) {
                    setError("Location access was denied. This usually means the site is not on HTTPS. Ask your developer to run 'npm run dev:https', or open browser site settings and set Location to Allow.");
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    setError("Your location could not be determined. Check that your device has location services enabled.");
                } else if (err.code === err.TIMEOUT) {
                    setError("Location request timed out. Please try again.");
                } else {
                    setError("Could not get your location. Please try again.");
                }
            },
            { timeout: 10000 }
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const submitIncident = async (forceCreate = false) => {
        if (!description || !file) {
            setError("Please add a description and capture an image.");
            return;
        }
        setError(null);
        const imageBase64 = await fileToBase64(file);
        const payload: IncidentRequestDTO = {
            incidentType: type,
            description,
            source: "MANUAL",
            latitude: coords?.latitude ?? 0,
            longitude: coords?.longitude ?? 0,
            imageBase64,
            forceCreate,
            locationAddress: address ?? undefined,
        };
        createIncident.mutate({ data: payload });
    };

    // ── AI-detect handlers ───────────────────────────────────────────────────

    /**
     * Called when the user selects an image in AI-detect mode.
     * Immediately sends the image to the inference endpoint and
     * updates aiResult with the prediction.
     */
    const handleAiFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        setAiFile(selected);
        setAiPreview(URL.createObjectURL(selected));
        setAiResult(null);
        setAiError(null);
        setAiAnalyzing(true);

        try {
            const compressed = await compressForInference(selected);
            const form = new FormData();
            form.append("image", compressed, "image.jpg");
            const res = await fetch("/api/ml/predict", { method: "POST", body: form });
            if (!res.ok) {
                setAiError(
                    res.status === 413
                        ? "Image is too large to analyze. Please use a smaller photo."
                        : "Could not analyze the image. You can still report manually."
                );
                return;
            }
            const data: PredictResponseDTO = await res.json();
            if (!data.detected || !data.detection?.label || !data.detection?.confidence) {
                setAiError("No road damage detected in this image. Try a clearer photo or report manually.");
                return;
            }
            setAiResult(data.detection);
        } catch {
            setAiError("Could not reach the analysis service. You can still report manually.");
        } finally {
            setAiAnalyzing(false);
        }
    }, []);

    /**
     * Accepts the AI prediction and pre-fills the form.
     * The photo captured in AI mode is reused so the user does not need to retake it.
     */
    const acceptAiPrediction = useCallback(() => {
        if (!aiResult || !aiFile || !aiPreview) return;
        const issueType = inferredLabelToIssueType(aiResult.label ?? "");
        setType(issueType);
        setDescription(`AI detected: ${(aiResult.label ?? "").replace(/_/g, " ")} at ${Math.round((aiResult.confidence ?? 0) * 100)}% confidence.`);
        setFile(aiFile);
        setPreview(aiPreview);
        setStep("form");
    }, [aiResult, aiFile, aiPreview]);

    /** Discards the AI result and goes to the manual form. */
    const rejectAiPrediction = useCallback(() => {
        setStep("form");
    }, []);

    const handleClose = () => {
        setStep("choose");
        setDescription("");
        setPreview(null);
        setFile(null);
        setCoords(null);
        setAddress(null);
        setType(ISSUE_TYPES[0]);
        setError(null);
        setDuplicate(null);
        setAiFile(null);
        setAiPreview(null);
        setAiResult(null);
        setAiError(null);
        setAiAnalyzing(false);
        if (cameraRef.current) cameraRef.current.value = "";
        if (galleryRef.current) galleryRef.current.value = "";
        if (aiCameraRef.current) aiCameraRef.current.value = "";
        if (aiGalleryRef.current) aiGalleryRef.current.value = "";
        onClose();
    };

    if (!visible) return null;

    const submitting = createIncident.isPending || confirmDuplicate.isPending;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ── Success ────────────────────────────────────────────── */}
                {step === "success" && (
                    <div className="flex flex-col items-center gap-4 py-6">
                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <p className="text-base font-semibold text-gray-900">Report Submitted</p>
                        <p className="text-sm text-gray-500 text-center">Your issue has been logged and will be reviewed shortly.</p>
                        <button type="button" onClick={handleClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors">
                            Done
                        </button>
                    </div>
                )}

                {/* ── Duplicate ──────────────────────────────────────────── */}
                {step === "duplicate" && duplicate && (() => {
                    const isOwnReport = duplicate.alreadyConfirmed || getCurrentUserId() === duplicate.userId?.toString();
                    return (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold text-gray-900 text-center">
                                {isOwnReport ? "You Already Reported This" : "Similar Issue Already Reported"}
                            </h2>
                            <p className="text-sm text-gray-500 text-center">
                                {isOwnReport
                                    ? <>You already submitted a <span className="font-semibold">{duplicate.incidentType?.replace(/_/g, " ").toLowerCase()}</span> report at this location.</>
                                    : <>A <span className="font-semibold">{duplicate.incidentType?.replace(/_/g, " ").toLowerCase()}</span> has already been reported within 1 km of your location.</>
                                }
                            </p>
                        </div>

                        {duplicate.imageUrl && (
                            <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-100">
                                <Image
                                    src={`/api/image-proxy?url=${encodeURIComponent(duplicate.imageUrl ?? "")}`}
                                    alt="Reported incident"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Type</span>
                                <span className="font-medium text-gray-800">{duplicate.incidentType?.replace(/_/g, " ")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Reported</span>
                                <span className="font-medium text-gray-800">{duplicate.incidentDate ? new Date(duplicate.incidentDate).toLocaleDateString() : "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Confirmations</span>
                                <span className="font-medium text-gray-800">{duplicate.reportCount}</span>
                            </div>
                            {duplicate.description && (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-gray-500">Description</span>
                                    <span className="text-gray-700">{duplicate.description}</span>
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-gray-600 text-center font-medium">Is this the same issue you were going to report?</p>

                        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                        <button
                            type="button"
                            onClick={() => confirmDuplicate.mutate({ id: duplicate.existingIncidentId! })}
                            disabled={submitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
                        >
                            {submitting ? "Confirming..." : "Yes, same issue"}
                        </button>
                        <button
                            type="button"
                            onClick={() => submitIncident(true)}
                            disabled={submitting}
                            className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold py-3.5 rounded-xl text-sm transition-colors"
                        >
                            No, it&apos;s a different issue
                        </button>
                        <button type="button" onClick={handleClose} className="text-sm text-gray-400 text-center hover:text-gray-600">
                            Cancel
                        </button>
                    </div>
                    );
                })()}

                {/* ── Choose mode ────────────────────────────────────────── */}
                {step === "choose" && (
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col items-center gap-1 pt-2">
                            <h2 className="text-lg font-bold text-gray-900">Report an Issue</h2>
                            <p className="text-sm text-gray-500 text-center">How would you like to report?</p>
                        </div>

                        {/* AI option */}
                        <button
                            type="button"
                            onClick={() => setStep("ai-detect")}
                            className="flex items-start gap-4 p-4 border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 rounded-2xl transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Detect with AI</p>
                                <p className="text-xs text-gray-500 mt-0.5">Take or upload a photo and let AI identify the issue type automatically.</p>
                            </div>
                        </button>

                        {/* Manual option */}
                        <button
                            type="button"
                            onClick={() => setStep("form")}
                            className="flex items-start gap-4 p-4 border-2 border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 rounded-2xl transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Report Manually</p>
                                <p className="text-xs text-gray-500 mt-0.5">Fill in the issue type, description, and photo yourself.</p>
                            </div>
                        </button>

                        <button type="button" onClick={handleClose} className="text-sm text-gray-400 text-center hover:text-gray-600">
                            Cancel
                        </button>
                    </div>
                )}

                {/* ── AI Detect ──────────────────────────────────────────── */}
                {step === "ai-detect" && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setStep("choose")} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                            </button>
                            <h2 className="text-base font-bold text-gray-900">Detect with AI</h2>
                        </div>

                        <p className="text-sm text-gray-500">Take or upload a clear photo of the road issue. AI will identify it automatically.</p>

                        {/* Image preview or capture buttons */}
                        {aiPreview ? (
                            <div className="relative w-full h-52 rounded-xl overflow-hidden">
                                <Image src={aiPreview} alt="AI analysis preview" fill sizes="100vw" className="object-cover" unoptimized />
                                {aiAnalyzing && (
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <p className="text-white text-xs font-medium">Analyzing...</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => aiCameraRef.current?.click()}
                                    className="h-28 bg-gray-100 hover:bg-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                    </svg>
                                    <span className="text-xs font-medium text-gray-600">Take Photo</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => aiGalleryRef.current?.click()}
                                    className="h-28 bg-gray-100 hover:bg-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    <span className="text-xs font-medium text-gray-600">Upload Photo</span>
                                </button>
                            </div>
                        )}

                        {/* Hidden file inputs for AI mode */}
                        <input ref={aiCameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAiFileChange} />
                        <input ref={aiGalleryRef} type="file" accept="image/*" className="hidden" onChange={handleAiFileChange} />

                        {/* Prediction result */}
                        {!aiAnalyzing && aiResult && (() => {
                            const confident = (aiResult.confidence ?? 0) >= 0.80;
                            return (
                            <div className={`${confident ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"} border rounded-xl p-4 flex flex-col gap-3`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-xs font-medium uppercase tracking-wide ${confident ? "text-blue-500" : "text-red-500"}`}>AI Detected</p>
                                        <p className="text-base font-bold text-gray-900 mt-0.5">{(aiResult.label ?? "").replace(/_/g, " ")}</p>
                                        <p className="text-xs text-gray-500">{Math.round((aiResult.confidence ?? 0) * 100)}% confidence</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confident ? "bg-blue-100" : "bg-red-100"}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${confident ? "text-blue-600" : "text-red-600"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                        </svg>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={acceptAiPrediction}
                                    className={`w-full text-white font-semibold py-3 rounded-xl text-sm transition-colors ${confident ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
                                >
                                    Yes, that looks right
                                </button>
                                <button
                                    type="button"
                                    onClick={rejectAiPrediction}
                                    className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors"
                                >
                                    No, I&apos;ll select the type manually
                                </button>
                            </div>
                            );
                        })()}

                        {/* AI error */}
                        {!aiAnalyzing && aiError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col gap-2">
                                <p className="text-sm text-red-700">{aiError}</p>
                                <button
                                    type="button"
                                    onClick={rejectAiPrediction}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 text-left"
                                >
                                    Report manually instead →
                                </button>
                            </div>
                        )}

                        {/* Retake option shown after a photo has been captured */}
                        {aiPreview && !aiAnalyzing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setAiFile(null);
                                    setAiPreview(null);
                                    setAiResult(null);
                                    setAiError(null);
                                    if (aiCameraRef.current) aiCameraRef.current.value = "";
                                    if (aiGalleryRef.current) aiGalleryRef.current.value = "";
                                }}
                                className="text-xs text-gray-400 text-center hover:text-gray-600"
                            >
                                Retake photo
                            </button>
                        )}

                        <button type="button" onClick={() => setStep("choose")} className="text-sm text-gray-400 text-center hover:text-gray-600">
                            Cancel
                        </button>
                    </div>
                )}

                {/* ── Manual Form ────────────────────────────────────────── */}
                {step === "form" && (
                    <>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setStep("choose")} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                            </button>
                            <h2 className="text-base font-bold text-gray-900">Report Issue</h2>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Issue Type <span className="text-red-500">*</span></label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as IncidentRequestDTOIncidentType)}
                                className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none"
                            >
                                {ISSUE_TYPES.map((t) => (
                                    <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the issue..."
                                rows={3}
                                className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Image <span className="text-red-500">*</span></label>
                            {preview ? (
                                <div className="relative w-full h-44 rounded-xl overflow-hidden">
                                    <Image src={preview} alt="Preview" fill sizes="100vw" className="object-cover" unoptimized />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => cameraRef.current?.click()}
                                        className="h-28 bg-gray-100 hover:bg-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                        </svg>
                                        <span className="text-xs font-medium text-gray-600">Take Photo</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => galleryRef.current?.click()}
                                        className="h-28 bg-gray-100 hover:bg-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                        <span className="text-xs font-medium text-gray-600">Upload Photo</span>
                                    </button>
                                </div>
                            )}
                            {/* Camera input — opens rear camera directly */}
                            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                            {/* Gallery input — opens file picker / photo library */}
                            <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            {preview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreview(null);
                                        setFile(null);
                                        if (cameraRef.current) cameraRef.current.value = "";
                                        if (galleryRef.current) galleryRef.current.value = "";
                                    }}
                                    className="text-xs text-gray-400 text-center hover:text-gray-600"
                                >
                                    Retake
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Location</label>
                            {coords ? (
                                <div className="flex flex-col gap-2">
                                    <LocationPickerMap
                                        latitude={coords.latitude}
                                        longitude={coords.longitude}
                                        onLocationChange={handleMapLocationChange}
                                    />
                                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.013 3.713-4.912 3.713-8.287a8 8 0 10-16 0c0 3.375 1.77 6.274 3.713 8.287a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex flex-col gap-0.5">
                                            {geocoding ? (
                                                <span className="text-xs text-green-600">Resolving address...</span>
                                            ) : address ? (
                                                <span className="text-xs text-green-700 font-medium">{address}</span>
                                            ) : null}
                                            <span className="text-xs text-green-600">{coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 text-center">Drag the pin or tap the map to adjust</p>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={locating}
                                    className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl px-4 py-3 text-sm text-gray-600 text-left transition-colors"
                                >
                                    {locating ? "Getting location..." : "Use my current location"}
                                </button>
                            )}
                        </div>

                        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                        <button
                            type="button"
                            onClick={() => submitIncident()}
                            disabled={submitting || !description || !preview}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                        <button type="button" onClick={handleClose} className="text-sm text-gray-400 text-center hover:text-gray-600">
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
