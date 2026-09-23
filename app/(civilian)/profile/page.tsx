"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    useGetProfile,
    useUpdateProfile,
    useDeleteAccount,
} from "@/app/api/generated/user-profile/user-profile";
import { useSend } from "@/app/api/generated/messages/messages";
import { useGenerateToken, useRevokeToken1 } from "@/app/api/generated/devices/devices";
import { useListDevices } from "@/lib/deviceTokens";
import { useCivilianTheme } from "../_context/CivilianThemeContext";
import { apiClient } from "@/lib/axios";
import { maskName, maskEmail, maskPhone } from "@/lib/piiMask";

type EditState = {
    firstName: string;
    lastName: string;
    phoneNumber: string;
};

/** Eye-open SVG icon */
function EyeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        </svg>
    );
}

/** Eye-closed (slash) SVG icon */
function EyeSlashIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const { darkMode, toggle: toggleTheme } = useCivilianTheme();
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editValues, setEditValues] = useState<EditState>({ firstName: "", lastName: "", phoneNumber: "" });
    const [saveError, setSaveError] = useState<string | null>(null);

    // Sensitive-field reveal state — once verified the values are visible for this session
    const [revealed, setRevealed] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

    // "Send us a message" section
    const [messageOpen, setMessageOpen] = useState(false);
    const [messageSubject, setMessageSubject] = useState("");
    const [messageContent, setMessageContent] = useState("");
    const [messageSent, setMessageSent] = useState(false);

    // "Dashcam devices" section
    const [devicesOpen, setDevicesOpen] = useState(false);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [newToken, setNewToken] = useState<string | null>(null);
    const [copyConfirmed, setCopyConfirmed] = useState(false);

    const { data, refetch, isLoading } = useGetProfile({ query: { staleTime: 0 } });
    const profile = data?.data;

    const {
        data: devicesData,
        isLoading: isLoadingDevices,
        refetch: refetchDevices,
    } = useListDevices();
    const devices = devicesData?.data ?? [];

    const { mutate: generateToken, isPending: isGeneratingToken } = useGenerateToken({
        mutation: {
            onSuccess: (res) => {
                const token = res.data?.deviceToken;
                if (token) setNewToken(token);
                refetchDevices();
            },
        },
    });

    const { mutate: revokeToken, isPending: isRevoking } = useRevokeToken1({
        mutation: {
            onSuccess: () => {
                setRevokingId(null);
                refetchDevices();
            },
        },
    });

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

    const { mutate: sendMessage, isPending: isSending } = useSend({
        mutation: {
            onSuccess: () => {
                setMessageSent(true);
                setMessageSubject("");
                setMessageContent("");
            },
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

    const handleCopyToken = async () => {
        if (!newToken) return;
        try {
            await navigator.clipboard.writeText(newToken);
            setCopyConfirmed(true);
        } catch {
            // Clipboard API unavailable (e.g. non-secure context) — the token
            // is still shown selectable in the modal for manual copy.
        }
    };

    const closeTokenModal = () => {
        setNewToken(null);
        setCopyConfirmed(false);
    };

    const handleRevealSubmit = useCallback(async () => {
        if (!passwordInput.trim()) { setVerifyError("Please enter your password."); return; }
        setVerifying(true);
        setVerifyError(null);
        try {
            await apiClient({ url: "/users/verify-password", method: "POST", data: { password: passwordInput } });
            setRevealed(true);
            setShowPasswordModal(false);
            setPasswordInput("");
            setShowPasswordInput(false);
        } catch {
            setVerifyError("Incorrect password. Please try again.");
        } finally {
            setVerifying(false);
        }
    }, [passwordInput]);

    const formatDate = (iso?: string) =>
        iso ? new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "—";

    const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "—";
    const email = profile?.email ?? "—";
    const phone = profile?.phoneNumber ?? "—";

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-100 dark:bg-[#191919] flex items-center justify-center transition-colors duration-300">
                <p className="text-sm text-gray-400 dark:text-gray-500">Loading profile…</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 dark:bg-[#191919] transition-colors duration-300">
            <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/civilian/dashboard"
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            aria-label="Back"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
                    </div>

                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
                <div className="bg-white dark:bg-[#202020] rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-300">
                    {editing ? (
                        <>
                            <div className="flex flex-col gap-3">
                                {(["firstName", "lastName", "phoneNumber"] as const).map((field) => (
                                    <div key={field} className="flex flex-col gap-1">
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {field === "firstName" ? "First name" : field === "lastName" ? "Last name" : "Phone number"}
                                        </label>
                                        <input
                                            type={field === "phoneNumber" ? "tel" : "text"}
                                            value={editValues[field]}
                                            onChange={(e) => setEditValues((v) => ({ ...v, [field]: e.target.value }))}
                                            className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                                        />
                                    </div>
                                ))}
                            </div>
                            {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                            <div className="flex gap-2">
                                <button type="button" onClick={() => { setEditing(false); setSaveError(null); }}
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl text-sm transition-colors">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleSave} disabled={isSaving}
                                    className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                                    {isSaving ? "Saving…" : "Save"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col gap-3">
                                {/* Sensitive fields — masked until password verified */}
                                <SensitiveRow
                                    label="Name"
                                    value={fullName}
                                    masked={maskName(fullName)}
                                    revealed={revealed}
                                    onReveal={() => setShowPasswordModal(true)}
                                    onHide={() => setRevealed(false)}
                                />
                                <SensitiveRow
                                    label="Email"
                                    value={email}
                                    masked={maskEmail(email)}
                                    revealed={revealed}
                                    onReveal={() => setShowPasswordModal(true)}
                                    onHide={() => setRevealed(false)}
                                />
                                <SensitiveRow
                                    label="Phone"
                                    value={phone}
                                    masked={maskPhone(phone)}
                                    revealed={revealed}
                                    onReveal={() => setShowPasswordModal(true)}
                                    onHide={() => setRevealed(false)}
                                />
                                {/* Non-sensitive fields — always visible */}
                                <ProfileRow label="Role" value={profile?.role ?? "—"} />
                                <ProfileRow label="Member since" value={formatDate(profile?.createdAt)} />
                            </div>

                            {!revealed && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                                    Tap the eye icon next to a field to reveal sensitive information.
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setEditValues({
                                        firstName: profile?.firstName ?? "",
                                        lastName: profile?.lastName ?? "",
                                        phoneNumber: profile?.phoneNumber ?? "",
                                    });
                                    setEditing(true);
                                }}
                                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                            >
                                Edit profile
                            </button>
                        </>
                    )}
                </div>

                {/* Send us a message */}
                {!editing && (
                    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#202020] p-4">
                        <button
                            type="button"
                            className="flex items-center justify-between w-full"
                            onClick={() => { setMessageOpen(!messageOpen); setMessageSent(false); }}
                        >
                            <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
                                Send us a message
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-gray-400 transition-transform ${messageOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                        {messageOpen && (
                            messageSent ? (
                                <p className="text-sm text-green-600 dark:text-green-400 text-center py-2">
                                    Message sent! We&apos;ll look into it.
                                </p>
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (!messageContent.trim()) return;
                                        sendMessage({ data: { subject: messageSubject, content: messageContent } });
                                    }}
                                    className="flex flex-col gap-3"
                                >
                                    <input
                                        type="text"
                                        placeholder="Subject (optional)"
                                        value={messageSubject}
                                        onChange={(e) => setMessageSubject(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-gray-400"
                                    />
                                    <textarea
                                        rows={4}
                                        placeholder="Write your message or complaint here…"
                                        value={messageContent}
                                        onChange={(e) => setMessageContent(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSending || !messageContent.trim()}
                                        className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 disabled:opacity-50 transition-colors text-white font-semibold py-2.5 rounded-xl text-sm"
                                    >
                                        {isSending ? "Sending…" : "Send Message"}
                                    </button>
                                </form>
                            )
                        )}
                    </div>
                )}

                {/* Dashcam devices */}
                {!editing && (
                    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#202020] p-4">
                        <button
                            type="button"
                            className="flex items-center justify-between w-full"
                            onClick={() => setDevicesOpen(!devicesOpen)}
                        >
                            <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
                                Dashcam devices
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-gray-400 transition-transform ${devicesOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                        {devicesOpen && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    A device token lets a dashcam create incidents without logging in. Generate one per physical device, and revoke it if the device is lost.
                                </p>

                                {isLoadingDevices ? (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Loading devices…</p>
                                ) : devices.length === 0 ? (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No devices registered yet.</p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {devices.map((device) => {
                                            const isConfirming = revokingId === device.deviceId;
                                            return (
                                                <div key={device.deviceId} className="flex flex-col gap-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2.5">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-mono text-gray-800 dark:text-gray-100 truncate">{device.tokenPreview}</span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(device.createdAt)}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            disabled={isRevoking && isConfirming}
                                                            onClick={() =>
                                                                isConfirming
                                                                    ? revokeToken({ id: device.deviceId })
                                                                    : setRevokingId(device.deviceId)
                                                            }
                                                            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                                                                isConfirming
                                                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                                                    : "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
                                                            } disabled:opacity-50`}
                                                        >
                                                            {isRevoking && isConfirming
                                                                ? "Revoking…"
                                                                : isConfirming
                                                                    ? "Tap again to confirm"
                                                                    : "Revoke"}
                                                        </button>
                                                    </div>
                                                    {isConfirming && !isRevoking && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setRevokingId(null)}
                                                            className="self-start text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => generateToken()}
                                    disabled={isGeneratingToken}
                                    className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 text-gray-900 dark:text-gray-100 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                                >
                                    {isGeneratingToken ? "Generating…" : "Generate new device token"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Dashcam Mode entry point — only once a device is registered */}
                {!editing && devices.length > 0 && (
                    <Link
                        href="/dashcam"
                        className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#202020] p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Dashcam Mode</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Auto-detect road damage while you drive</p>
                            </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </Link>
                )}

                {/* Danger zone */}
                {!editing && (
                    <div className="bg-white dark:bg-[#202020] rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-300">
                        <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger zone</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Deleting your account is permanent. Your incidents will remain in the system but you will no longer be able to log in.
                        </p>
                        <button type="button" onClick={handleDelete} disabled={isDeleting}
                            className={`w-full font-semibold py-3 rounded-xl text-sm transition-colors ${
                                confirmDelete
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
                            } disabled:opacity-50`}>
                            {isDeleting ? "Deleting…" : confirmDelete ? "Tap again to confirm" : "Delete account"}
                        </button>
                        {confirmDelete && (
                            <button type="button" onClick={() => setConfirmDelete(false)}
                                className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                Cancel
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* New device token modal — shown once, right after generation */}
            {newToken && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
                    <div className="bg-white dark:bg-[#202020] rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Device token generated</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Copy this now and enter it on the dashcam device. For your security, it won&apos;t be shown again.
                            </p>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2.5">
                            <code className="text-sm font-mono text-gray-800 dark:text-gray-100 break-all select-all">
                                {newToken}
                            </code>
                        </div>
                        <button
                            type="button"
                            onClick={handleCopyToken}
                            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                        >
                            {copyConfirmed ? "Copied!" : "Copy to clipboard"}
                        </button>
                        <button
                            type="button"
                            onClick={closeTokenModal}
                            className="text-sm text-gray-400 text-center hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* Password confirmation modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
                    onClick={() => { setShowPasswordModal(false); setPasswordInput(""); setVerifyError(null); setShowPasswordInput(false); }}>
                    <div className="bg-white dark:bg-[#202020] rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4"
                        onClick={(e) => e.stopPropagation()}>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Confirm your identity</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Enter your password to reveal sensitive profile information.
                            </p>
                        </div>
                        <div className="relative">
                            <input
                                type={showPasswordInput ? "text" : "password"}
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleRevealSubmit()}
                                placeholder="Your password"
                                autoFocus
                                className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswordInput((v) => !v)}
                                aria-label={showPasswordInput ? "Hide password" : "Show password"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                {showPasswordInput ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {verifyError && <p className="text-xs text-red-500">{verifyError}</p>}
                        <button type="button" onClick={handleRevealSubmit} disabled={verifying || !passwordInput.trim()}
                            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                            {verifying ? "Verifying…" : "Reveal"}
                        </button>
                        <button type="button"
                            onClick={() => { setShowPasswordModal(false); setPasswordInput(""); setVerifyError(null); setShowPasswordInput(false); }}
                            className="text-sm text-gray-400 text-center hover:text-gray-600 dark:hover:text-gray-300">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center gap-4">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
            <span className="text-sm text-gray-800 dark:text-gray-100 text-right">{value}</span>
        </div>
    );
}

interface SensitiveRowProps {
    label: string;
    value: string;
    masked: string;
    revealed: boolean;
    onReveal: () => void;
    onHide: () => void;
}

function SensitiveRow({ label, value, masked, revealed, onReveal, onHide }: SensitiveRowProps) {
    return (
        <div className="flex justify-between items-center gap-4">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-800 dark:text-gray-100 text-right">
                    {revealed ? value : masked}
                </span>
                <button
                    type="button"
                    onClick={revealed ? onHide : onReveal}
                    aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                >
                    {revealed ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
            </div>
        </div>
    );
}
