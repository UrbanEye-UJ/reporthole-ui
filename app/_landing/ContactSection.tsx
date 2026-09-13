"use client";

import { useState } from "react";
import { useContact } from "@/app/api/generated/messages/messages";
import { useLandingTheme } from "./LandingThemeContext";

/**
 * Landing-page contact form — submits to the public POST /messages/contact endpoint.
 * No authentication required.
 */
export default function ContactSection() {
  const { dark } = useLandingTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const inputBorder = dark ? "#2D2D2D" : "#e5e7eb";
  const inputBg     = dark ? "#161616" : "#fff";
  const inputColor  = dark ? "#F9FAFB" : "#111827";
  const labelColor  = dark ? "#9CA3AF" : "#374151";
  const headingCol  = dark ? "#F9FAFB" : "#111111";
  const subColor    = dark ? "#6B7280" : "#6b7280";

  const { mutate: sendContact, isPending } = useContact({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
        setName(""); setEmail(""); setSubject(""); setContent("");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) return;
    sendContact({ data: { name, email, subject, content } });
  };

  return (
    <section id="contact" style={{ padding: "clamp(48px, 7vw, 92px) 24px", maxWidth: 680, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2
          style={{
            fontSize: "clamp(26px, 3.2vw, 38px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: 0,
            color: headingCol,
          }}
        >
          Get in touch
        </h2>
        <p style={{ fontSize: 16, color: subColor, margin: "12px auto 0", maxWidth: "36em", lineHeight: 1.6 }}>
          Questions about pricing, access, or partnership? Send us a message and we&apos;ll get back to you.
        </p>
      </div>

      {submitted ? (
        <div
          style={{
            background: "#f0fdf4",
            border: "1.5px solid #bbf7d0",
            borderRadius: 16,
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 18, fontWeight: 700, color: "#15803d", margin: 0 }}>
            Message received!
          </p>
          <p style={{ fontSize: 15, color: "#4ade80", margin: "8px 0 16px" }}>
            We&apos;ll respond within one business day.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            style={{
              background: "none",
              border: "none",
              color: "#15803d",
              fontSize: 14,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="cf-name" style={{ fontSize: 13, fontWeight: 600, color: labelColor }}>
                Full name *
              </label>
              <input
                id="cf-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Smith"
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `1.5px solid ${inputBorder}`,
                  fontSize: 15,
                  outline: "none",
                  transition: "border-color .15s",
                  color: inputColor,
                  background: inputBg,
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="cf-email" style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                Email *
              </label>
              <input
                id="cf-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jane@municipality.gov.za"
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1.5px solid #e5e7eb",
                  fontSize: 15,
                  outline: "none",
                  color: "#111827",
                  background: "#fff",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="cf-subject" style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
              Subject
            </label>
            <input
              id="cf-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Partnership enquiry, pricing, etc."
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "1.5px solid #e5e7eb",
                fontSize: 15,
                outline: "none",
                color: "#111827",
                background: "#fff",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="cf-content" style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
              Message *
            </label>
            <textarea
              id="cf-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Tell us how we can help…"
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "1.5px solid #e5e7eb",
                fontSize: 15,
                outline: "none",
                resize: "vertical",
                color: "#111827",
                background: "#fff",
                fontFamily: "inherit",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !name.trim() || !email.trim() || !content.trim()}
            style={{
              padding: "15px 32px",
              borderRadius: 12,
              background: dark ? "#FFFFFF" : "#111111",
              color: dark ? "#111111" : "#fff",
              fontWeight: 800,
              fontSize: 16,
              border: "none",
              cursor: isPending ? "wait" : "pointer",
              opacity: isPending || !name.trim() || !email.trim() || !content.trim() ? 0.6 : 1,
              transition: "opacity .15s",
              alignSelf: "flex-start",
            }}
          >
            {isPending ? "Sending…" : "Send message"}
          </button>
        </form>
      )}
    </section>
  );
}
