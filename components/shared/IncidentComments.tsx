"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useGetComments, useAddComment, getGetCommentsQueryKey } from "@/app/api/generated/incidents/incidents";
import type { IncidentCommentResponse } from "@/app/api/generated/openAPIDefinition.schemas";
import { getErrorMessage } from "@/lib/getErrorMessage";

const ROLE_LABEL: Record<string, string> = {
  CIVILIAN: "Civilian",
  ADMIN: "Municipality",
  CONTRACTOR: "Contractor",
  SECURITY_ADMIN: "Platform Admin",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface IncidentCommentsProps {
  incidentId: string | undefined;
}

/**
 * Displays and allows posting of comments on an incident.
 * Tailwind-styled — suitable for civilian and contractor UIs.
 */
export default function IncidentComments({ incidentId }: IncidentCommentsProps) {
  const [draft, setDraft] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetComments(incidentId ?? "", {
    query: { enabled: !!incidentId },
  });
  const comments: IncidentCommentResponse[] = data?.data ?? [];

  const { mutate: post, isPending } = useAddComment({
    mutation: {
      onSuccess: () => {
        setDraft("");
        queryClient.invalidateQueries({ queryKey: getGetCommentsQueryKey(incidentId ?? "") });
      },
      onError: (err) => setSubmitError(getErrorMessage(err)),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !incidentId) return;
    setSubmitError(null);
    post({ id: incidentId, data: { content: draft.trim() } });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Comments
      </p>

      {/* Comment list */}
      <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-xs text-gray-400">Loading…</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-gray-400">
            No comments yet. Be the first to leave one.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-xl px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-800">
                  {c.authorName}
                  <span className="ml-1.5 text-[10px] font-normal text-gray-400">
                    ({ROLE_LABEL[c.authorRole ?? ""] ?? c.authorRole})
                  </span>
                </span>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {c.createdAt ? formatTime(c.createdAt) : ""}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-snug">{c.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Post form */}
      {incidentId && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            maxLength={500}
            className="w-full text-sm text-gray-900 rounded-xl border border-gray-300 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/20 placeholder-gray-500"
          />
          {submitError && (
            <p className="text-xs text-red-600">{submitError}</p>
          )}
          <button
            type="submit"
            disabled={isPending || !draft.trim()}
            className="self-end text-xs font-semibold bg-gray-900 text-white px-4 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition-colors"
          >
            {isPending ? "Posting…" : "Post"}
          </button>
        </form>
      )}
    </div>
  );
}
