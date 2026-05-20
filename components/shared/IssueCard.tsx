import Image from "next/image";
import { Issue } from "@/app/types/issue";

interface IssueCardProps {
    issue: Issue;
    priority?: boolean;
}

export default function IssueCard({ issue, priority = false }: IssueCardProps) {
    return (
        <div className="flex gap-3 bg-white rounded-xl p-3 shadow-sm">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                    src={issue.image}
                    alt={issue.title}
                    fill
                    sizes="64px"
                    priority={priority}
                    className="object-cover"
                />
            </div>

            <div className="flex flex-col justify-center flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{issue.title}</p>
                <p className="text-xs text-gray-500 truncate">{issue.description}</p>
                <p className="text-xs text-gray-400 mt-1">{issue.location} · {issue.date}</p>
            </div>
        </div>
    );
}
