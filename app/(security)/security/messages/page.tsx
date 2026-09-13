"use client";

import { useMemo } from "react";

import { Box, Chip, Divider, Stack, Typography } from "@mui/material";

import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import MarkEmailUnreadRoundedIcon from "@mui/icons-material/MarkEmailUnreadRounded";

import { useGetAdminMessages } from "@/app/api/generated/messages/messages";

/** Formats an ISO datetime into a human-readable local date/time. */
function formatDate(iso?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
    return (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2.5, bgcolor: "background.paper" }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>{value}</Typography>
        </Box>
    );
}

/** Civilian complaint messages inbox — accessible only to SECURITY_ADMIN. */
export default function SecurityMessagesPage() {
    const { data, isLoading } = useGetAdminMessages();

    const messages = useMemo(() => data?.data ?? [], [data]);
    const unread = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Civilian Messages</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Complaints and feedback submitted by civilians via the app.
                </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
                <StatBadge label="Total" value={isLoading ? "…" : messages.length} />
                <StatBadge label="Unread" value={isLoading ? "…" : unread} />
                <StatBadge label="Read" value={isLoading ? "…" : messages.length - unread} />
            </Box>

            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "background.paper", overflow: "hidden" }}>
                <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                    <MailRoundedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Inbox</Typography>
                </Box>

                {isLoading ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 4 }}>Loading messages…</Typography>
                ) : messages.length === 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 1.5, color: "text.disabled" }}>
                        <InboxRoundedIcon sx={{ fontSize: 56, opacity: 0.4 }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>No messages yet</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, textAlign: "center" }}>
                            Civilians can send complaints from their profile. They will appear here.
                        </Typography>
                    </Box>
                ) : (
                    <Stack divider={<Divider />}>
                        {messages.map((msg) => (
                            <Box key={msg.id} sx={{ p: 2.5, opacity: msg.read ? 0.7 : 1 }}>
                                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: msg.read ? 400 : 700 }}>
                                        {msg.senderName ?? "Unknown Sender"}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {!msg.read && (
                                            <Chip
                                                icon={<MarkEmailUnreadRoundedIcon />}
                                                label="New"
                                                size="small"
                                                color="primary"
                                            />
                                        )}
                                        {msg.read && <MarkEmailReadRoundedIcon fontSize="small" sx={{ color: "text.disabled" }} />}
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(msg.createdAt)}
                                        </Typography>
                                    </Stack>
                                </Stack>
                                {msg.subject && (
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{msg.subject}</Typography>
                                )}
                                <Typography variant="body2" color="text.secondary">{msg.content}</Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: "block" }}>
                                    {msg.senderEmail}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>
        </Box>
    );
}
