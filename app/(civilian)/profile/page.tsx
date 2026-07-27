"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    useGetProfile,
    useUpdateProfile,
    useDeleteAccount,
} from "@/app/api/generated/user-profile/user-profile";

type EditState = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
};

export default function ProfilePage() {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editValues, setEditValues] = useState<EditState>({ firstName: "", lastName: "", phoneNumber: "" });
    const [saveError, setSaveError] = useState<string | null>(null);

    const { data, refetch, isLoading } = useGetProfile({ query: { staleTime: 0 } });
    const profile = data?.data;

    useEffect(() => {
        if (profile) {
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
            <main className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-sm text-gray-400">Loading profile…</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100">
            <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/civilian/dashboard"
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        aria-label="Back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                </div>

                {/* Profile card */}
                <div className="bg-white rounded-2xl p-5 flex flex-col gap-4">
                    {editing ? (
                        <>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500">First name</label>
                                    <input
                                        type="text"
                                        value={editValues.firstName}
                                        onChange={(e) => setEditValues((v) => ({ ...v, firstName: e.target.value }))}
                                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500">Last name</label>
                                    <input
                                        type="text"
                                        value={editValues.lastName}
                                        onChange={(e) => setEditValues((v) => ({ ...v, lastName: e.target.value }))}
                                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-medium text-gray-500">Phone number</label>
                                    <input
                                        type="tel"
                                        value={editValues.phoneNumber}
                                        onChange={(e) => setEditValues((v) => ({ ...v, phoneNumber: e.target.value }))}
                                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setEditing(false); setSaveError(null); }}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors"
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

                {/* Danger zone */}
                {!editing && (
                    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
                        <h2 className="text-sm font-semibold text-red-600">Danger zone</h2>
                        <p className="text-xs text-gray-500">
                            Deleting your account is permanent. Your incidents will remain in the system but you will no longer be able to log in.
                        </p>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className={`w-full font-semibold py-3 rounded-xl text-sm transition-colors ${
                                confirmDelete
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-red-50 hover:bg-red-100 text-red-600"
                            } disabled:opacity-50`}
                        >
                            {isDeleting ? "Deleting…" : confirmDelete ? "Tap again to confirm" : "Delete account"}
                        </button>
                        {confirmDelete && (
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                className="w-full text-xs text-gray-500 hover:text-gray-700"
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
            <span className="text-xs font-medium text-gray-500 shrink-0">{label}</span>
            <span className="text-sm text-gray-800 text-right">{value}</span>
        </div>
    );
}
