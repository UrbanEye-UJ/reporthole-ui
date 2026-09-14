"use client";

import { useState } from "react";

import { useAddProgressUpdate } from "@/lib/hooks/useAddProgressUpdate";
import { getErrorMessage } from "@/lib/getErrorMessage";

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

  const { mutate, isPending } = useAddProgressUpdate();

  const reset = () => {
    setNote("");
    setError(null);
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
    mutate(
      { incidentId, note: note.trim() },
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
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Add Progress Update</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{incidentLabel}</p>
        </div>

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
      </div>
    </div>
  );
}
