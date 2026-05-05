"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusCard from "@/components/shared/StatusCard";
import IssueCard from "@/components/shared/IssueCard";
import ReportIssueModal from "@/components/shared/ReportIssueModal";
import { Issue } from "@/app/types/issue";

const ISSUES: Issue[] = [
    {
        id: "1",
        title: "Pothole",
        description: "Large pothole causing damage",
        location: "Johannesburg",
        date: "Apr 26",
        status: "reported",
        image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=200",
    },
];

const getCookie = (name: string) =>
    document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`))
        ?.split("=")[1] ?? "";

export default function CivilianDashboard() {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [role, setRole] = useState("");

    useEffect(() => {
        setRole(getCookie("reporthole_role"));
    }, []);

    const handleLogout = () => {
        document.cookie = "reporthole_token=; path=/; max-age=0";
        document.cookie = "reporthole_role=; path=/; max-age=0";
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
                    <StatusCard label="Total" value="3" />
                    <StatusCard label="In Progress" value="1" />
                    <StatusCard label="Resolved" value="1" />
                </div>

                {/* Recent Issues */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-base font-semibold text-gray-800">Recent Issues</h2>
                    {ISSUES.map((issue, index) => (
                        <IssueCard key={issue.id} issue={issue} priority={index === 0} />
                    ))}
                </div>
            </div>

            <ReportIssueModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </main>
    );
}
