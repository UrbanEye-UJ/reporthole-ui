import { Issue } from "@/app/types/issue";

interface IssueCardProps {
    issue: Issue;
    priority?: boolean;
}

export default function IssueCard({ issue }: IssueCardProps) {
    return (
        <div className="flex gap-3 bg-white rounded-xl p-3 shadow-sm">
            <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {issue.image && (
                    <img
                        src={issue.image}
                        alt={issue.title}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            <div className="flex flex-col justify-center flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{issue.title}</p>
                <p className="text-xs text-gray-500 truncate">{issue.description}</p>
                <p className="text-xs text-gray-400 mt-1">{issue.location} · {issue.date}</p>
            </div>
        </div>
    );
}
