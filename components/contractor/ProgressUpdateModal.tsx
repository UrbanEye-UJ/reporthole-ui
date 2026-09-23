"use client";

import { useState } from "react";

import { useAddProgressUpdate } from "@/lib/hooks/useAddProgressUpdate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { enqueue, isNetworkError, listQueued } from "@/lib/offlineQueue";
import { dispatchQueueChanged } from "@/lib/hooks/useOfflineSync";

interface ProgressUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  incidentId: string;
  incidentLabel: string;
}

export default function ProgressUpdateModal({
  visible,
  onClose,
  incidentId,
  incidentLabel,
}: ProgressUpdateModalProps) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [queuedOffline, setQueuedOffline] = useState(false);

  const { mutate, isPending } = useAddProgressUpdate();

  const reset = () => {
    setNote("");
    setError(null);
    setQueuedOffline(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!note.trim()) {
      setError("Please enter a progress note.");
      return;
    }
    setError(null);
    const trimmedNote = note.trim();
    mutate(
      { incidentId, note: trimmedNote },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: async (err) => {
          if (isNetworkError(err)) {
            await enqueue({
              kind: "contractor-progress",
              url: `/incidents/${incidentId}/progress`,
              method: "POST",
              body: { note: trimmedNote },
              authMode: "jwt",
            });
            dispatchQueueChanged((await listQueued()).length);
            setQueuedOffline(true);
            return;
          }
          setError(getErrorMessage(err));
        },
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
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Add Progress Update</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{incidentLabel}</p>
        </div>

        {queuedOffline ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Saved — will send when you&apos;re back online</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">No connection right now. This update is saved on this device and will be sent automatically once you&apos;re back online.</p>
            <button
              type="button"
              onClick={handleClose}
              className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
        <>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Progress Note <span className="text-red-500">*</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe what has been done so far..."
            rows={4}
            maxLength={255}
            className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 outline-none resize-none"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 text-right">{note.length}/255</p>
        </div>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !note.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
        >
          {isPending ? "Submitting..." : "Submit Update"}
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="text-sm text-gray-400 text-center hover:text-gray-600 dark:hover:text-gray-300"
        >
          Cancel
        </button>
        </>
        )}
      </div>
    </div>
  );
}
