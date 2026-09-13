"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import StatusCard from "@/components/shared/StatusCard";
import IncidentComments from "@/components/shared/IncidentComments";
import { useSend } from "@/app/api/generated/messages/messages";
import ProgressUpdateModal from "@/components/contractor/ProgressUpdateModal";
import ResolveIncidentModal from "@/components/contractor/ResolveIncidentModal";
import RejectAssignmentModal from "@/components/contractor/RejectAssignmentModal";
import { useGetMyAssignments } from "@/lib/hooks/useMyAssignments";
import { useAcceptAssignment } from "@/lib/hooks/useAcceptAssignment";
import { getErrorMessage } from "@/lib/getErrorMessage";
import type { AssignmentStatus, IncidentWithStatus } from "@/lib/hooks/useRecentIncidents";
import { useContractorTheme } from "../../_context/ContractorThemeContext";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAllNotificationsRead,
} from "@/lib/hooks/useNotifications";

const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1] ?? "";

const formatType = (type?: string) =>
  type
    ? type
        .toLowerCase()
        .split("_")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ")
    : "Unknown";

const STATUS_META: Record<AssignmentStatus, { label: string; className: string }> = {
  REPORTED: { label: "Reported", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  VERIFIED: { label: "Verified", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  ASSIGNED: { label: "Assigned", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  RESOLVED: { label: "Resolved", className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
};

const directionsUrl = (lat?: number, lng?: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat ?? 0},${lng ?? 0}`;

export default function ContractorDashboard() {
  const router = useRouter();
  const { darkMode, toggle: toggleTheme } = useContractorTheme();
  const [role] = useState(() => (typeof window !== "undefined" ? getCookie("reporthole_role") : ""));
  const [resolveTarget, setResolveTarget] = useState<IncidentWithStatus | null>(null);
  const [progressTarget, setProgressTarget] = useState<IncidentWithStatus | null>(null);
  const [rejectTarget, setRejectTarget] = useState<IncidentWithStatus | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [tab, setTab] = useState<"active" | "history">("active");
  const [commentOpenId, setCommentOpenId] = useState<string | null>(null);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgContent, setMsgContent] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  const { mutate: sendMsg, isPending: sendingMsg } = useSend({
    mutation: {
      onSuccess: () => { setMsgContent(""); setMsgSent(true); },
    },
  });

  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const { data, isLoading } = useGetMyAssignments();
  const assignments = useMemo(() => data?.data ?? [], [data]);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);
  const { mutate: accept, isPending: accepting } = useAcceptAssignment();

  const handleAccept = (incidentId: string) => {
    setActionError(null);
    setActionTargetId(incidentId);
    accept(incidentId, {
      onError: (err) => setActionError(getErrorMessage(err)),
      onSettled: () => setActionTargetId(null),
    });
  };

  const active = useMemo(
    () => assignments.filter((a) => a.status !== "RESOLVED"),
    [assignments]
  );

  const history = useMemo(
    () => assignments.filter((a) => a.status === "RESOLVED"),
    [assignments]
  );

  const displayed = tab === "active" ? active : history;

  const total = assignments.length;
  const resolved = assignments.filter((a) => a.status === "RESOLVED").length;
  const pending = total - resolved;

  const handleLogout = () => {
    document.cookie = "reporthole_token=; path=/; max-age=0";
    document.cookie = "reporthole_role=; path=/; max-age=0";
    document.cookie = "reporthole_user_id=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0F0F0F] transition-colors duration-300">
      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reporthole</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{role.toLowerCase()}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Profile link */}
            <Link
              href="/contractor/profile"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="My profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z" />
                </svg>
              )}
            </button>

            {/* Notification bell */}
            <button
              type="button"
              onClick={() => {
                setNotifOpen(true);
                if (unreadCount > 0) markAllRead();
              }}
              aria-label="Notifications"
              className="relative text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <StatusCard label="Total" value={String(total)} />
          <StatusCard label="Pending" value={String(pending)} />
          <StatusCard label="Resolved" value={String(resolved)} />
        </div>

        {/* Contact municipality card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => { setMsgOpen((o) => !o); setMsgSent(false); }}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Contact Municipality</span>
            <span className="text-xs text-gray-400">{msgOpen ? "▲" : "▼"}</span>
          </button>

          {msgOpen && (
            <div className="px-4 pb-4 flex flex-col gap-3">
              {msgSent ? (
                <p className="text-xs text-green-600 font-medium">Message sent successfully.</p>
              ) : (
                <>
                  <textarea
                    value={msgContent}
                    onChange={(e) => setMsgContent(e.target.value)}
                    placeholder="Describe your query or concern…"
                    rows={3}
                    maxLength={2000}
                    className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/20 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    disabled={sendingMsg || !msgContent.trim()}
                    onClick={() => sendMsg({ data: { content: msgContent.trim() } })}
                    className="self-end text-xs font-semibold bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-4 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition-colors"
                  >
                    {sendingMsg ? "Sending…" : "Send"}
                  </button>
                </>
              )}
              <p className="text-[11px] text-gray-400">
                Or email us at{" "}
                <a href="mailto:reporthole.team@gmail.com" className="underline">
                  reporthole.team@gmail.com
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Tab switcher */}
        <div className={`flex rounded-xl p-1 gap-1 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
          {(["active", "history"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t
                  ? darkMode ? "bg-white text-gray-900" : "bg-white text-gray-900 shadow-sm"
                  : darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "active" ? `Active (${active.length})` : `History (${history.length})`}
            </button>
          ))}
        </div>

        {/* Incident list */}
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            {tab === "active" ? "Active Assignments" : "Completed Assignments"}
          </h2>

          {actionError && (
            <p className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-3">
              {actionError}
            </p>
          )}

          {isLoading ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Loading...</p>
          ) : displayed.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
              {tab === "active" ? "No active assignments." : "No completed assignments yet."}
            </p>
          ) : (
            displayed.map((incident) => {
              const status = (incident.status ?? "ASSIGNED") as AssignmentStatus;
              const meta = STATUS_META[status];
              const isAssigned = status === "ASSIGNED";
              const isInProgress = status === "IN_PROGRESS";
              const isActing = actionTargetId === incident.incidentId && accepting;

              return (
                <div
                  key={incident.incidentId}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-colors duration-300 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatType(incident.incidentType)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{incident.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {incident.locationAddress || "Unknown location"}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${meta.className}`}>
                      {meta.label}
                    </span>
                  </div>

                  {/* Comments toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setCommentOpenId(
                        commentOpenId === incident.incidentId ? null : (incident.incidentId ?? null)
                      )
                    }
                    className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    {commentOpenId === incident.incidentId ? "Hide comments ▲" : "View / add comments ▼"}
                  </button>

                  {commentOpenId === incident.incidentId && (
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                      <IncidentComments incidentId={incident.incidentId} />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <a
                      href={directionsUrl(incident.latitude, incident.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                    >
                      Get Directions
                    </a>
                    {isAssigned && (
                      <>
                        <button
                          type="button"
                          onClick={() => setRejectTarget(incident)}
                          disabled={isActing}
                          className="flex-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 text-red-700 dark:text-red-300 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAccept(incident.incidentId ?? "")}
                          disabled={isActing}
                          className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                        >
                          {isActing && accepting ? "Accepting..." : "Accept"}
                        </button>
                      </>
                    )}
                    {isInProgress && (
                      <>
                        <button
                          type="button"
                          onClick={() => setProgressTarget(incident)}
                          className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                        >
                          Add Update
                        </button>
                        <button
                          type="button"
                          onClick={() => setResolveTarget(incident)}
                          className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                        >
                          Mark Resolved
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ProgressUpdateModal
        visible={!!progressTarget}
        onClose={() => setProgressTarget(null)}
        incidentId={progressTarget?.incidentId ?? ""}
        incidentLabel={`${formatType(progressTarget?.incidentType)} — ${progressTarget?.locationAddress || "Unknown location"}`}
      />

      <ResolveIncidentModal
        visible={!!resolveTarget}
        onClose={() => setResolveTarget(null)}
        incidentId={resolveTarget?.incidentId ?? ""}
        incidentLabel={`${formatType(resolveTarget?.incidentType)} — ${resolveTarget?.locationAddress || "Unknown location"}`}
      />

      <RejectAssignmentModal
        visible={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        incidentId={rejectTarget?.incidentId ?? ""}
        incidentLabel={`${formatType(rejectTarget?.incidentType)} — ${rejectTarget?.locationAddress || "Unknown location"}`}
      />

      {/* Notification drawer — slides in from the right */}
      {notifOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setNotifOpen(false)}
          />
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-full bg-white dark:bg-[#161616] border-l border-gray-200 dark:border-[#2D2D2D] z-50 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#2D2D2D]">
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-white">Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your assignment activity</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifOpen(false)}
                aria-label="Close notifications"
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#2D2D2D]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 dark:text-gray-500 py-16">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  <p className="text-sm">No notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-5 py-3.5 ${!n.read ? "bg-gray-50 dark:bg-gray-800/40" : ""}`}
                  >
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? "bg-gray-900 dark:bg-white" : "bg-transparent border border-gray-300 dark:border-gray-600"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-ZA", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
