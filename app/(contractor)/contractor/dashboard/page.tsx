"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import StatusCard from "@/components/shared/StatusCard";
import ResolveIncidentModal from "@/components/contractor/ResolveIncidentModal";
import { useGetMyAssignments } from "@/lib/hooks/useMyAssignments";
import { useAcceptAssignment } from "@/lib/hooks/useAcceptAssignment";
import { useRejectAssignment } from "@/lib/hooks/useRejectAssignment";
import { getErrorMessage } from "@/lib/getErrorMessage";
import type { AssignmentStatus, IncidentWithStatus } from "@/lib/hooks/useRecentIncidents";
import { useContractorTheme } from "../../_context/ContractorThemeContext";

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

  const { data, isLoading } = useGetMyAssignments();
  const assignments = useMemo(() => data?.data ?? [], [data]);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);
  const { mutate: accept, isPending: accepting } = useAcceptAssignment();
  const { mutate: reject, isPending: rejecting } = useRejectAssignment();

  const handleAccept = (incidentId: string) => {
    setActionError(null);
    setActionTargetId(incidentId);
    accept(incidentId, {
      onError: (err) => setActionError(getErrorMessage(err)),
      onSettled: () => setActionTargetId(null),
    });
  };

  const handleReject = (incidentId: string) => {
    setActionError(null);
    setActionTargetId(incidentId);
    reject(incidentId, {
      onError: (err) => setActionError(getErrorMessage(err)),
      onSettled: () => setActionTargetId(null),
    });
  };

  const sorted = useMemo(
    () =>
      [...assignments].sort((a, b) => {
        const aResolved = a.status === "RESOLVED" ? 1 : 0;
        const bResolved = b.status === "RESOLVED" ? 1 : 0;
        return aResolved - bResolved;
      }),
    [assignments]
  );

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
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Reporthole</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{role.toLowerCase()}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
            <button
              type="button"
              onClick={handleLogout}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
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

        {/* Assigned incidents */}
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Assigned Incidents</h2>

          {actionError && (
            <p className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-3">
              {actionError}
            </p>
          )}

          {isLoading ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Loading...</p>
          ) : sorted.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No incidents assigned yet.</p>
          ) : (
            sorted.map((incident) => {
              const status = (incident.status ?? "ASSIGNED") as AssignmentStatus;
              const meta = STATUS_META[status];
              const isAssigned = status === "ASSIGNED";
              const isInProgress = status === "IN_PROGRESS";
              const isActing = actionTargetId === incident.incidentId && (accepting || rejecting);

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
                          onClick={() => handleReject(incident.incidentId ?? "")}
                          disabled={isActing}
                          className="flex-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 text-red-700 dark:text-red-300 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                        >
                          {isActing && rejecting ? "Rejecting..." : "Reject"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAccept(incident.incidentId ?? "")}
                          disabled={isActing}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                        >
                          {isActing && accepting ? "Accepting..." : "Accept"}
                        </button>
                      </>
                    )}
                    {isInProgress && (
                      <button
                        type="button"
                        onClick={() => setResolveTarget(incident)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ResolveIncidentModal
        visible={!!resolveTarget}
        onClose={() => setResolveTarget(null)}
        incidentId={resolveTarget?.incidentId ?? ""}
        incidentLabel={`${formatType(resolveTarget?.incidentType)} — ${resolveTarget?.locationAddress || "Unknown location"}`}
      />
    </main>
  );
}
