"use client";

import { useState } from "react";

import { useRejectAssignment } from "@/lib/hooks/useRejectAssignment";
import { getErrorMessage } from "@/lib/getErrorMessage";

interface RejectAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  incidentId: string;
  incidentLabel: string;
}

export default function RejectAssignmentModal({ visible, onClose, incidentId, incidentLabel }: RejectAssignmentModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useRejectAssignment();

  const reset = () => {
    setReason("");
    setError(null);
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
    mutate(
      { incidentId, reason: reason.trim() },
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
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Reject Assignment</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{incidentLabel}</p>
        </div>

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
      </div>
    </div>
  );
}
