"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    useGetProfile,
    useUpdateProfile,
    useDeleteAccount,
} from "@/app/api/generated/user-profile/user-profile";
import { useContractorTheme } from "../../_context/ContractorThemeContext";

type EditState = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
};

/**
 * Profile page for contractor users — uses the same profile API as civilians
 * but wraps in ContractorThemeContext and links back to the contractor dashboard.
 */
export default function ContractorProfilePage() {
    const router = useRouter();
    const { darkMode, toggle: toggleTheme } = useContractorTheme();

    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editValues, setEditValues] = useState<EditState>({ firstName: "", lastName: "", phoneNumber: "" });
    const [saveError, setSaveError] = useState<string | null>(null);

    const { data, refetch, isLoading } = useGetProfile({ query: { staleTime: 0 } });
    const profile = data?.data;

    useEffect(() => {
        if (profile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEditValues({
                firstName: profile.firstName ?? "",
                lastName: profile.lastName ?? "",
                phoneNumber: profile.phoneNumber ?? "",
            });
        }
    }, [profile]);

    const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile({
        mutation: {
            onSuccess: () => {
                setEditing(false);
                setSaveError(null);
                refetch();
            },
            onError: () => setSaveError("Failed to save changes. Please try again."),
        },
    });

    const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount({
        mutation: {
            onSuccess: () => {
                document.cookie = "reporthole_token=; path=/; max-age=0";
                document.cookie = "reporthole_role=; path=/; max-age=0";
                document.cookie = "reporthole_user_id=; path=/; max-age=0";
                router.push("/");
            },
            onError: () => setConfirmDelete(false),
        },
    });

    const handleSave = () => {
        const { firstName, lastName, phoneNumber } = editValues;
        if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
            setSaveError("All fields are required.");
            return;
        }
        updateProfile({ data: { firstName, lastName, phoneNumber } });
    };

    const handleDelete = () => {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        deleteAccount();
    };

    const formatDate = (iso?: string) =>
        iso ? new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "—";

    if (isLoading) {
        return (
            <main className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
                <p className="text-sm text-gray-400">Loading profile…</p>
            </main>
        );
    }

    return (
        <main className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
            <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/contractor/dashboard"
                            className={`transition-colors ${darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}
                            aria-label="Back to dashboard"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <h1 className={`text-xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>My Profile</h1>
                    </div>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        className={`transition-colors ${darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}
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
                </div>

                {/* Profile card */}
                <div className={`rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-300 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                    {editing ? (
                        <>
                            <div className="flex flex-col gap-3">
                                {(["firstName", "lastName", "phoneNumber"] as const).map((field) => (
                                    <div key={field} className="flex flex-col gap-1">
                                        <label className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            {field === "firstName" ? "First name" : field === "lastName" ? "Last name" : "Phone number"}
                                        </label>
                                        <input
                                            type={field === "phoneNumber" ? "tel" : "text"}
                                            value={editValues[field]}
                                            onChange={(e) => setEditValues((v) => ({ ...v, [field]: e.target.value }))}
                                            className={`border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${darkMode ? "border-gray-600 bg-gray-700 text-gray-100" : "border-gray-200 bg-white text-gray-800"}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setEditing(false); setSaveError(null); }}
                                    className={`flex-1 font-semibold py-3 rounded-xl text-sm transition-colors ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                                >
                                    {isSaving ? "Saving…" : "Save"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col gap-3">
                                <ProfileRow darkMode={darkMode} label="Name" value={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "—"} />
                                <ProfileRow darkMode={darkMode} label="Email" value={profile?.email ?? "—"} />
                                <ProfileRow darkMode={darkMode} label="Phone" value={profile?.phoneNumber ?? "—"} />
                                <ProfileRow darkMode={darkMode} label="Role" value={profile?.role ?? "—"} />
                                <ProfileRow darkMode={darkMode} label="Member since" value={formatDate(profile?.createdAt)} />
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditing(true)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                            >
                                Edit profile
                            </button>
                        </>
                    )}
                </div>

                {/* Danger zone */}
                {!editing && (
                    <div className={`rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-300 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                        <h2 className={`text-sm font-semibold ${darkMode ? "text-red-400" : "text-red-600"}`}>Danger zone</h2>
                        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Deleting your account is permanent. Your job history will remain in the system but you will no longer be able to log in.
                        </p>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className={`w-full font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 ${
                                confirmDelete
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : darkMode
                                        ? "bg-red-900/30 hover:bg-red-900/50 text-red-400"
                                        : "bg-red-50 hover:bg-red-100 text-red-600"
                            }`}
                        >
                            {isDeleting ? "Deleting…" : confirmDelete ? "Tap again to confirm" : "Delete account"}
                        </button>
                        {confirmDelete && (
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                className={`w-full text-xs ${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

function ProfileRow({ label, value, darkMode }: { label: string; value: string; darkMode: boolean }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className={`text-xs font-medium shrink-0 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
            <span className={`text-sm text-right ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{value}</span>
        </div>
    );
}
