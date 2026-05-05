"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const ISSUE_TYPES = [
    "POTHOLE",
    "CRACK",
    "FADED_MARKINGS",
    "DAMAGED_SIGN",
    "BLOCKED_DRAIN",
    "BROKEN_TRAFFIC_LIGHT",
];

interface Coords {
    latitude: number;
    longitude: number;
}

interface ReportIssueModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ReportIssueModal({ visible, onClose }: ReportIssueModalProps) {
    const [type, setType] = useState(ISSUE_TYPES[0]);
    const [description, setDescription] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const [coords, setCoords] = useState<Coords | null>(null);
    const [locating, setLocating] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreview(URL.createObjectURL(file));
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
                setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                setLocating(false);
            },
            () => {
                setError("Could not get your location. Please try again.");
                setLocating(false);
            }
        );
    };

    const handleSubmit = async () => {
        if (!description || !preview) {
            setError("Please add a description and capture an image.");
            return;
        }
        setError(null);
        setSubmitting(true);
        // Submission will be wired to the incident API once the endpoint is implemented
        await new Promise((r) => setTimeout(r, 800));
        setSubmitting(false);
        setSubmitted(true);
    };

    const handleClose = () => {
        setDescription("");
        setPreview(null);
        setCoords(null);
        setType(ISSUE_TYPES[0]);
        setError(null);
        setSubmitted(false);
        onClose();
    };

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {submitted ? (
                    <div className="flex flex-col items-center gap-4 py-6">
                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <p className="text-base font-semibold text-gray-900">Report Submitted</p>
                        <p className="text-sm text-gray-500 text-center">Your issue has been logged and will be reviewed shortly.</p>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-lg font-bold text-gray-900 text-center">Report Issue</h2>

                        {/* Issue Type */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Issue Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none"
                            >
                                {ISSUE_TYPES.map((t) => (
                                    <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
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

                        {/* Image */}
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
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {preview && (
                                <button
                                    type="button"
                                    onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                                    className="text-xs text-gray-400 text-center hover:text-gray-600"
                                >
                                    Retake
                                </button>
                            )}
                        </div>

                        {/* Location */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-gray-700">Location</label>
                            {coords ? (
                                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.013 3.713-4.912 3.713-8.287a8 8 0 10-16 0c0 3.375 1.77 6.274 3.713 8.287a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-xs text-green-700">
                                        {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
                                    </span>
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
                            onClick={handleSubmit}
                            disabled={submitting || !description || !preview}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </button>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="text-sm text-gray-400 text-center hover:text-gray-600"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
