"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    useGetProfile,
    useUpdateProfile,
    useDeleteAccount,
} from "@/app/api/generated/user-profile/user-profile";
import { useCivilianTheme } from "../_context/CivilianThemeContext";

type EditState = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
};

export default function ProfilePage() {
    const router = useRouter();
    const { darkMode, toggle: toggleTheme } = useCivilianTheme();
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
                router.push("/login");
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
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        deleteAccount();
    };

    const formatDate = (iso?: string) =>
        iso ? new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "—";

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
                <p className="text-sm text-gray-400 dark:text-gray-500">Loading profile…</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/civilian/dashboard"
                            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            aria-label="Back"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
                    </div>

                    {/* Theme toggle */}
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
                </div>

                {/* Profile card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-300">
                    {editing ? (
                        <>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">First name</label>
                                    <input
                                        type="text"
                                        value={editValues.firstName}
                                        onChange={(e) => setEditValues((v) => ({ ...v, firstName: e.target.value }))}
                                        className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Last name</label>
                                    <input
                                        type="text"
                                        value={editValues.lastName}
                                        onChange={(e) => setEditValues((v) => ({ ...v, lastName: e.target.value }))}
                                        className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone number</label>
                                    <input
                                        type="tel"
                                        value={editValues.phoneNumber}
                                        onChange={(e) => setEditValues((v) => ({ ...v, phoneNumber: e.target.value }))}
                                        className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    />
                                </div>
                            </div>
                            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setEditing(false); setSaveError(null); }}
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl text-sm transition-colors"
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
                                <ProfileRow label="Name" value={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "—"} />
                                <ProfileRow label="Email" value={profile?.email ?? "—"} />
                                <ProfileRow label="Phone" value={profile?.phoneNumber ?? "—"} />
                                <ProfileRow label="Role" value={profile?.role ?? "—"} />
                                <ProfileRow label="Member since" value={formatDate(profile?.createdAt)} />
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

                {/* Apply for Admin */}
                {!editing && profile?.role === "CIVILIAN" && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-300">
                        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Become an Admin</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Have a municipality token? Apply for admin access to manage road incidents across Gauteng.
                        </p>
                        <Link
                            href="/apply-for-admin"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors text-center block"
                        >
                            Apply for Admin
                        </Link>
                    </div>
                )}

                {/* Danger zone */}
                {!editing && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-300">
                        <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger zone</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Deleting your account is permanent. Your incidents will remain in the system but you will no longer be able to log in.
                        </p>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className={`w-full font-semibold py-3 rounded-xl text-sm transition-colors ${
                                confirmDelete
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
                            } disabled:opacity-50`}
                        >
                            {isDeleting ? "Deleting…" : confirmDelete ? "Tap again to confirm" : "Delete account"}
                        </button>
                        {confirmDelete && (
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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

function ProfileRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
            <span className="text-sm text-gray-800 dark:text-gray-100 text-right">{value}</span>
        </div>
    );
}
