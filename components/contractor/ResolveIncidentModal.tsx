"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { useResolveIncident } from "@/lib/hooks/useResolveIncident";
import { fileToBase64 } from "@/lib/fileToBase64";
import { getErrorMessage } from "@/lib/getErrorMessage";

interface ResolveIncidentModalProps {
  visible: boolean;
  onClose: () => void;
  incidentId: string;
  incidentLabel: string;
}

export default function ResolveIncidentModal({ visible, onClose, incidentId, incidentLabel }: ResolveIncidentModalProps) {
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending } = useResolveIncident();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const reset = () => {
    setNote("");
    setFile(null);
    setPreview(null);
    setError(null);
    if (cameraRef.current) cameraRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!note.trim() || !file) {
      setError("Please add a note and a photo of the completed repair.");
      return;
    }
    setError(null);
    const photoBase64 = await fileToBase64(file);
    mutate(
      { incidentId, note: note.trim(), photoBase64 },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (err) => setError(getErrorMessage(err)),
      }
    );
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Mark as Resolved</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{incidentLabel}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Repair Photo <span className="text-red-500">*</span>
          </label>
          {preview ? (
            <div className="relative w-full h-44 rounded-xl overflow-hidden">
              <Image src={preview} alt="Repair preview" fill sizes="100vw" className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="h-28 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Take Photo</span>
              </button>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="h-28 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Upload Photo</span>
              </button>
            </div>
          )}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
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
              className="text-xs text-gray-400 text-center hover:text-gray-600 dark:hover:text-gray-300"
            >
              Retake
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Note <span className="text-red-500">*</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe the repair that was completed..."
            rows={3}
            className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !note.trim() || !file}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
        >
          {isPending ? "Submitting..." : "Submit & Mark Resolved"}
        </button>
        <button type="button" onClick={handleClose} className="text-sm text-gray-400 text-center hover:text-gray-600 dark:hover:text-gray-300">
          Cancel
        </button>
      </div>
    </div>
  );
}
