import Image from "next/image";
import { Issue } from "@/app/types/issue";

interface IssueCardProps {
    issue: Issue;
    priority?: boolean;
}

export default function IssueCard({ issue, priority }: IssueCardProps) {
    return (
        <div className="flex gap-3 bg-white rounded-xl p-3 shadow-sm">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {issue.image ? (
                    <Image
                        src={issue.image}
                        alt={issue.title}
                        fill
                        sizes="64px"
                        priority={priority}
                        unoptimized
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
                        </svg>
                    </div>
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
