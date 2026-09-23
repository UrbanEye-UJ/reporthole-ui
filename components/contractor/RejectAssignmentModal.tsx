"use client";

import { useState } from "react";

import { useRejectAssignment } from "@/lib/hooks/useRejectAssignment";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { enqueue, isNetworkError, listQueued } from "@/lib/offlineQueue";
import { dispatchQueueChanged } from "@/lib/hooks/useOfflineSync";

interface RejectAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  incidentId: string;
  incidentLabel: string;
}

export default function RejectAssignmentModal({ visible, onClose, incidentId, incidentLabel }: RejectAssignmentModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [queuedOffline, setQueuedOffline] = useState(false);

  const { mutate, isPending } = useRejectAssignment();

  const reset = () => {
    setReason("");
    setError(null);
    setQueuedOffline(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Please explain why you are rejecting this assignment.");
      return;
    }
    setError(null);
    const trimmedReason = reason.trim();
    mutate(
      { incidentId, reason: trimmedReason },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: async (err) => {
          if (isNetworkError(err)) {
            await enqueue({
              kind: "contractor-reject",
              url: `/incidents/${incidentId}/reject`,
              method: "POST",
              body: { reason: trimmedReason },
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
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Reject Assignment</h2>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">No connection right now. This rejection is saved on this device and will be sent automatically once you&apos;re back online.</p>
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
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you can't take this assignment..."
            rows={3}
            className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 outline-none resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !reason.trim()}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
        >
          {isPending ? "Rejecting..." : "Confirm Rejection"}
        </button>
        <button type="button" onClick={handleClose} className="text-sm text-gray-400 text-center hover:text-gray-600 dark:hover:text-gray-300">
          Cancel
        </button>
        </>
        )}
      </div>
    </div>
  );
}
