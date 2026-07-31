"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@/app/api/generated/incidents/incidents";
import { Issue, Status } from "@/app/types/issue";
import { IncidentResponseDTO, SearchMyIncidentsType } from "@/app/api/generated/openAPIDefinition.schemas";

const getCookie = (name: string) =>
    document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`))
        ?.split("=")[1] ?? "";

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
        status: (dto.incidentType ? "reported" : "reported") as Status,
        image: dto.imageUrl ?? "",
        reporterCount: dto.reporterCount ?? 1,
    };
}

const SEARCH_TYPES = Object.values(SearchMyIncidentsType);

export default function CivilianDashboard() {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [role] = useState(() => typeof window !== "undefined" ? getCookie("reporthole_role") : "");
    const [userId] = useState(() => typeof window !== "undefined" ? getCookie("reporthole_user_id") : "");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchType, setSearchType] = useState<SearchMyIncidentsType | "">("");

    const { data, refetch } = useGetMyIncidents({ query: { staleTime: 0, refetchOnWindowFocus: false } });
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
        es.addEventListener("incident-updated", () => { refetch(); });
        es.onerror = () => { es.close(); refetch(); };
        return () => { es.close(); };
    }, []);

    const resolved = allIncidents.filter((i) => i.status === "resolved").length;
    const inProgress = allIncidents.filter((i) => i.status === "in_progress").length;

    const handleLogout = () => {
        document.cookie = "reporthole_token=; path=/; max-age=0";
        document.cookie = "reporthole_role=; path=/; max-age=0";
        document.cookie = "reporthole_user_id=; path=/; max-age=0";
        router.push("/login");
    };

    return (
        <main className="min-h-screen bg-gray-100">
            <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-blue-600">Reporthole</h1>
                        <p className="text-sm text-gray-500 capitalize">{role.toLowerCase()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/profile"
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                            aria-label="Profile"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
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
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm"
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

                {/* Search */}
                <div className="flex flex-col gap-2">
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by description or location..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value as SearchMyIncidentsType | "")}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All issue types</option>
                        {SEARCH_TYPES.map((t) => (
                            <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                </div>

                {/* Recent Issues */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-800">
                            {searchKeyword || searchType ? "Search Results" : "Recent Issues"}
                        </h2>
                        {(searchKeyword || searchType) && (
                            <button
                                type="button"
                                onClick={() => { setSearchKeyword(""); setSearchType(""); }}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    {incidents.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">
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
            />

            <SessionExpiryWarning />
        </main>
    );
}
