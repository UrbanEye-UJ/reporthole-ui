"use client";

import { useMemo } from "react";

import { Chip, Grid, Typography, Box, Divider, Stack } from "@mui/material";

import MailRoundedIcon from "@mui/icons-material/MailRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import MarkEmailUnreadRoundedIcon from "@mui/icons-material/MarkEmailUnreadRounded";

import PageHeader from "../../_components/ui/PageHeader";
import MetricCard from "../../_components/ui/MetricCard";
import Panel from "../../_components/ui/Panel";

import { useGetAdminMessages } from "@/app/api/generated/messages/messages";

/** Formats an ISO datetime string into a human-readable local date/time. */
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

export default function MessagesPage() {
  const { data, isLoading } = useGetAdminMessages();

  const messages = useMemo(() => data?.data ?? [], [data]);
  const unread = useMemo(() => messages.filter((m) => !m.read).length, [messages]);

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Complaints and feedback submitted by civilians."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            title="Total Messages"
            value={isLoading ? "…" : messages.length || "0"}
            icon={<MailRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            title="Unread"
            value={isLoading ? "…" : unread || "0"}
            icon={<MarkEmailUnreadRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            title="Read"
            value={isLoading ? "…" : (messages.length - unread) || "0"}
            icon={<MarkEmailReadRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Panel title="Inbox">
            {isLoading ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 4 }}>
                Loading messages…
              </Typography>
            ) : messages.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 10,
                  gap: 1.5,
                  color: "text.disabled",
                }}
              >
                <InboxRoundedIcon sx={{ fontSize: 56, opacity: 0.4 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  No messages yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, textAlign: "center" }}>
                  Civilians can send complaints directly from their dashboard. Check back here for new messages.
                </Typography>
              </Box>
            ) : (
              <Stack divider={<Divider />}>
                {messages.map((msg) => (
                  <Box key={msg.id} sx={{ p: 2, opacity: msg.read ? 0.7 : 1 }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: msg.read ? 400 : 700 }}>
                        {msg.senderName ?? "Unknown Sender"}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        {!msg.read && <Chip label="New" size="small" color="primary" />}
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(msg.createdAt)}
                        </Typography>
                      </Stack>
                    </Stack>
                    {msg.subject && (
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {msg.subject}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {msg.content}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: "block" }}>
                      {msg.senderEmail}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Panel>
        </Grid>
      </Grid>
    </>
  );
}
