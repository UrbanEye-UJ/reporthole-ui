"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import StatusCard from "@/components/shared/StatusCard";
import IssueCard from "@/components/shared/IssueCard";
import ReportIssueModal from "@/components/shared/ReportIssueModal";
import IncidentDetailModal from "@/components/shared/IncidentDetailModal";
import SessionExpiryWarning from "@/components/shared/SessionExpiryWarning";
import {
    useGetMyIncidents,
    useDeleteIncident,
    useSearchMyIncidents,
    useReportStillUnresolved,
    useGetNearbyIncidents,
} from "@/app/api/generated/incidents/incidents";
import { Issue, Status } from "@/app/types/issue";
import { IncidentResponseDTO, SearchMyIncidentsType } from "@/app/api/generated/openAPIDefinition.schemas";
import { useCivilianTheme } from "../../_context/CivilianThemeContext";
import { useLogout } from "@/lib/hooks/useLogout";
import {
    useNotifications,
    useUnreadNotificationCount,
    useMarkAllNotificationsRead,
    useRefetchNotifications,
} from "@/lib/hooks/useNotifications";
const getCookie = (name: string) =>
    document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`))
        ?.split("=")[1] ?? "";

/** Maps the backend's 5-state AssignmentStatus onto the FE's simpler Status type; VERIFIED reads as "reported" to a civilian since nothing actionable has changed for them yet. */
function mapStatus(status?: IncidentResponseDTO["status"]): Status {
    switch (status) {
        case "ASSIGNED": return "assigned";
        case "IN_PROGRESS": return "in_progress";
        case "RESOLVED": return "resolved";
        default: return "reported";
    }
}

function toIssue(dto: IncidentResponseDTO): Issue {
    return {
        id: dto.incidentId ?? "",
        userId: dto.userId ?? "",
        title: dto.incidentType?.replace(/_/g, " ") ?? "Unknown",
        description: dto.description ?? "",
        location: dto.locationAddress
            ?? (dto.latitude != null && dto.longitude != null
                ? `${dto.latitude.toFixed(4)}, ${dto.longitude.toFixed(4)}`
                : "Unknown location"),
        locationAddress: dto.locationAddress,
        date: dto.incidentDate ? new Date(dto.incidentDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }) : "",
        status: mapStatus(dto.status),
        image: dto.imageUrl ?? "",
        reporterCount: dto.reporterCount ?? 1,
        workflowHistory: dto.workflowHistory,
    };
}

const SEARCH_TYPES = Object.values(SearchMyIncidentsType);

export default function CivilianDashboard() {
    const handleLogout = useLogout();
    const queryClient = useQueryClient();
    const { darkMode, toggle: toggleTheme } = useCivilianTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [notifOpen, setNotifOpen] = useState(false);

    const { data: notifications = [] } = useNotifications();
    const { data: unreadCount = 0 } = useUnreadNotificationCount();
    const { mutate: markAllRead } = useMarkAllNotificationsRead();
    const refetchNotifications = useRefetchNotifications();
    // Initialized to "" on both server and client (not read from the cookie synchronously) to
    // avoid a hydration mismatch — the cookie is only readable client-side, so reading it in the
    // initializer made the server-rendered "" and the client's first render disagree. Set for
    // real in an effect instead, after hydration has already matched.
    const [role, setRole] = useState("");
    const [userId, setUserId] = useState("");
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRole(getCookie("reporthole_role"));
        setUserId(getCookie("reporthole_user_id"));
    }, []);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchType, setSearchType] = useState<SearchMyIncidentsType | "">("");
    const [activeTab, setActiveTab] = useState<"my" | "nearby">("my");

    const [nearbyCoords, setNearbyCoords] = useState<{ latitude: number; longitude: number } | null>(null);

    const { data, refetch } = useGetMyIncidents({ query: { staleTime: 0, refetchOnWindowFocus: false, refetchInterval: 60_000 } });

    const { data: nearbyData } = useGetNearbyIncidents(
        { latitude: nearbyCoords?.latitude ?? 0, longitude: nearbyCoords?.longitude ?? 0, radiusMeters: 1000 },
        { query: { enabled: !!nearbyCoords, staleTime: 60_000 } }
    );
    const nearbyIncidents: IncidentResponseDTO[] = nearbyData?.data ?? [];
    const allIncidents: Issue[] = (data?.data ?? []).map(toIssue);

    const hasSearch = !!(searchKeyword.trim() || searchType);
    const { data: searchData } = useSearchMyIncidents(
        { keyword: searchKeyword.trim() || undefined, type: searchType || undefined },
        { query: { staleTime: 0, refetchOnWindowFocus: false, enabled: hasSearch } }
    );
    const incidents: Issue[] = hasSearch ? (searchData?.data ?? []).map(toIssue) : allIncidents;

    const { mutate: deleteIncident } = useDeleteIncident({
        mutation: {
            onSuccess: () => {
                setSelectedIssue(null);
                refetch();
            },
        },
    });

    const { mutate: reportStillUnresolved } = useReportStillUnresolved({
        mutation: {
            onSuccess: () => {
                setSelectedIssue(null);
                refetch();
            },
        },
    });

    // Keep the open detail modal in sync when incidents refresh (e.g. after confirming a duplicate)
    useEffect(() => {
        if (selectedIssue && data?.data) {
            const updatedDto = data.data.find((d) => d.incidentId === selectedIssue.id);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (updatedDto) setSelectedIssue(toIssue(updatedDto));
        }
    }, [data]);

    // Real-time updates: EventSource connects directly to Spring Boot.
    // JWT is passed as ?token= because EventSource does not support custom headers.
    useEffect(() => {
        const token = getCookie("reporthole_token");
        if (!token) return;
        const es = new EventSource(`/api/incidents/events?token=${token}`);
        es.addEventListener("incident-updated", () => {
            refetch();
            // Also covers a new comment on whichever incident's comment list is currently
            // mounted (e.g. the open detail modal) — comments don't have their own SSE event
            // type, they ride on the same "incident-updated" push.
            queryClient.invalidateQueries({
                predicate: (query) =>
                    typeof query.queryKey[0] === "string" && query.queryKey[0].includes("/comments"),
            });
        });
        es.addEventListener("notification", () => { refetchNotifications(); });
        es.onerror = () => { es.close(); refetch(); };
        return () => { es.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Silently fetch the user's location for the nearby section.
    // No error shown — if location is denied, the section simply stays hidden.
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setNearbyCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => { /* denied or unavailable — hide nearby section */ }
        );
    }, []);

    const resolved = allIncidents.filter((i) => i.status === "resolved").length;
    const inProgress = allIncidents.filter((i) => i.status === "in_progress").length;

    return (
        <main className="min-h-screen bg-white dark:bg-[#191919] transition-colors duration-300">
            <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reporthole</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{role.toLowerCase()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Theme toggle */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            {darkMode ? (
                                /* Sun icon */
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
                                </svg>
                            ) : (
                                /* Moon icon */
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

                        <Link
                            href="/profile"
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            aria-label="Profile"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        </Link>
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

                {/* Report Button */}
                <button
                    type="button"
                    onClick={() => setModalVisible(true)}
                    className="w-full bg-gray-900 hover:bg-gray-800 active:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 transition-colors text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    Report Issue
                </button>

                {/* Stats */}
                <div className="flex gap-3">
                    <StatusCard label="Total" value={String(allIncidents.length)} />
                    <StatusCard label="In Progress" value={String(inProgress)} />
                    <StatusCard label="Resolved" value={String(resolved)} />
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 bg-gray-100 dark:bg-[#202020] rounded-xl p-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("my")}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                            activeTab === "my"
                                ? "bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                    >
                        My Reports
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("nearby")}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                            activeTab === "nearby"
                                ? "bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        }`}
                    >
                        Nearby
                        {nearbyIncidents.length > 0 && (
                            <span className="text-xs bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full w-4 h-4 flex items-center justify-center leading-none">
                                {nearbyIncidents.length > 9 ? "9+" : nearbyIncidents.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* My Reports tab */}
                {activeTab === "my" && (
                    <>
                        {/* Search */}
                        <div className="flex flex-col gap-2">
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by description or location..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-colors"
                                />
                            </div>
                            <select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value as SearchMyIncidentsType | "")}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 transition-colors"
                            >
                                <option value="">All issue types</option>
                                {SEARCH_TYPES.map((t) => (
                                    <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                                    {searchKeyword || searchType ? "Search Results" : "Recent Issues"}
                                </h2>
                                {(searchKeyword || searchType) && (
                                    <button
                                        type="button"
                                        onClick={() => { setSearchKeyword(""); setSearchType(""); }}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            {incidents.length === 0 ? (
                                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                                    {searchKeyword || searchType ? "No incidents match your search." : "No incidents reported yet."}
                                </p>
                            ) : (
                                incidents.map((issue, index) => (
                                    <button
                                        key={issue.id}
                                        type="button"
                                        className="w-full text-left"
                                        onClick={() => setSelectedIssue(issue)}
                                    >
                                        <IssueCard issue={issue} priority={index === 0} />
                                    </button>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* Nearby tab */}
                {activeTab === "nearby" && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Reported Nearby</h2>
                            <span className="text-xs text-gray-400 dark:text-gray-500">within 1 km</span>
                        </div>
                        {nearbyIncidents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400 dark:text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                                <p className="text-sm">No incidents reported within 1 km of your location.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2">
                                    {nearbyIncidents.map((dto) => {
                                        const imageUrl = dto.imageUrl
                                            ? `/api/image-proxy?url=${encodeURIComponent(dto.imageUrl)}`
                                            : "";
                                        const location = dto.locationAddress
                                            ?? (dto.latitude != null && dto.longitude != null
                                                ? `${dto.latitude.toFixed(4)}, ${dto.longitude.toFixed(4)}`
                                                : "Unknown location");
                                        const date = dto.incidentDate
                                            ? new Date(dto.incidentDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })
                                            : "";
                                        return (
                                            <button
                                                key={dto.incidentId}
                                                type="button"
                                                className="w-full text-left flex gap-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200"
                                                onClick={() => setSelectedIssue(toIssue(dto))}
                                            >
                                                <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                                                    {imageUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={imageUrl} alt="Nearby incident" className="w-full h-full object-cover"
                                                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                                                    ) : null}
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                        {dto.incidentType?.replace(/_/g, " ") ?? "Unknown"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{location}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">{date}</span>
                                                        {(dto.reporterCount ?? 0) > 1 && (
                                                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                                {dto.reporterCount} reports
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}

            </div>

            <ReportIssueModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    refetch();
                }}
            />

            <IncidentDetailModal
                issue={selectedIssue}
                onClose={() => setSelectedIssue(null)}
                currentUserId={userId}
                onDelete={(id) => deleteIncident({ id })}
                onStillUnresolved={(id) => reportStillUnresolved({ id })}
            />

            <SessionExpiryWarning />

            {/* Notification drawer — slides in from the right */}
            {notifOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 z-40"
                        onClick={() => setNotifOpen(false)}
                    />
                    {/* Panel */}
                    <div className="fixed top-0 right-0 h-full w-80 max-w-full bg-white dark:bg-[#202020] border-l border-gray-200 dark:border-[#2F2F2F] z-50 flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-[#2F2F2F]">
                            <div>
                                <p className="text-base font-bold text-gray-900 dark:text-white">Notifications</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Your incident activity</p>
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
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#2F2F2F]">
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
