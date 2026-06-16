import { Issue } from "@/app/types/issue";

interface IncidentDetailModalProps {
    issue: Issue | null;
    onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
    reported: "Reported",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
};

const STATUS_COLORS: Record<string, string> = {
    reported: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    in_progress: "bg-orange-100 text-orange-800",
    resolved: "bg-green-100 text-green-800",
};

export default function IncidentDetailModal({ issue, onClose }: IncidentDetailModalProps) {
    if (!issue) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8 flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />

                {/* Image */}
                {issue.image && (
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                        <img
                            src={issue.image}
                            alt={issue.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Title + status */}
                <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-bold text-gray-900 capitalize">{issue.title}</h2>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[issue.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[issue.status] ?? issue.status}
                    </span>
                </div>

                {/* Description */}
                {issue.description && (
                    <p className="text-sm text-gray-600">{issue.description}</p>
                )}

                {/* Meta */}
                <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span>{issue.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                        </svg>
                        <span>{issue.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        <span>
                            {(issue.reporterCount ?? 1) === 1
                                ? "1 person reported this"
                                : `${issue.reporterCount} people reported this`}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-full mt-1 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-semibold py-3 rounded-xl text-sm"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
