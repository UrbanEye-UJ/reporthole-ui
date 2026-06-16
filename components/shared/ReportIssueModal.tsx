"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), { ssr: false });
import {
    useCreateIncident,
    useConfirmDuplicate,
} from "@/app/api/generated/incidents/incidents";
import {
    IncidentRequestDTO,
    IncidentRequestDTOIncidentType,
    IncidentResponseDTO,
} from "@/app/api/generated/openAPIDefinition.schemas";

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
}

type Step = "form" | "duplicate" | "success";

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

export default function ReportIssueModal({ visible, onClose }: ReportIssueModalProps) {
    const [step, setStep] = useState<Step>("form");
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
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (visible && !coords && navigator.geolocation) {
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
                    fetch("/api/log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `[Geolocation] auto-prompt error — code: ${err.code}, message: ${err.message}` }) });
                    setError("Could not get your location. Please enable location permissions and try again.");
                    setLocating(false);
                }
            );
        }
    }, [visible]);

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

    const handleMapLocationChange = useCallback((lat: number, lng: number) => {
        setCoords({ latitude: lat, longitude: lng });
        if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
        geocodeTimer.current = setTimeout(() => reverseGeocode(lat, lng), 500);
    }, [reverseGeocode]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
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
                fetch("/api/log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `[Geolocation] button error — code: ${err.code}, message: ${err.message}` }) });
                setError("Could not get your location. Please try again.");
                setLocating(false);
            }
        );
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

    const handleClose = () => {
        setStep("form");
        setDescription("");
        setPreview(null);
        setFile(null);
        setCoords(null);
        setAddress(null);
        setType(ISSUE_TYPES[0]);
        setError(null);
        setDuplicate(null);
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
                                    src={`/api/image-proxy?url=${encodeURIComponent(duplicate.imageUrl)}`}
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

                {step === "form" && (
                    <>
                        <h2 className="text-lg font-bold text-gray-900 text-center">Report Issue</h2>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Issue Type</label>
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
                            <label className="text-sm font-semibold text-gray-700">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the issue..."
                                rows={3}
                                className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Image</label>
                            {preview ? (
                                <div className="relative w-full h-44 rounded-xl overflow-hidden">
                                    <Image src={preview} alt="Preview" fill sizes="100vw" className="object-cover" unoptimized />
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className="h-44 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                                >
                                    <span className="text-sm text-gray-400">Tap to capture or upload</span>
                                </div>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                            {preview && (
                                <button
                                    type="button"
                                    onClick={() => { setPreview(null); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
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
