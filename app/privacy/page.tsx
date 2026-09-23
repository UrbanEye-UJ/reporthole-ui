"use client";

import LandingHeader from "../_landing/LandingHeader";
import LandingFooter from "../_landing/LandingFooter";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono-brand, 'IBM Plex Mono', monospace)",
};

const h2: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: "-0.01em",
  margin: "36px 0 10px",
};

const p: React.CSSProperties = {
  fontSize: 15.5,
  lineHeight: 1.7,
  color: "#3A4353",
  margin: "0 0 10px",
};

const li: React.CSSProperties = { ...p, margin: "0 0 6px" };

/** Privacy / POPIA disclaimer page, linked from the registration forms. */
export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F6F7F9", color: "#0E1420" }}>
      <LandingHeader />

      <main style={{ padding: "72px 24px 92px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <span
            style={{
              ...mono,
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#2563EB",
            }}
          >
            Legal
          </span>
          <h1
            style={{
              fontSize: "clamp(28px, 3.6vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: "14px 0 0",
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ ...p, marginTop: 14 }}>
            Reporthole is built to help municipalities in Gauteng fix road infrastructure faster.
            This page explains, in plain language, what information we collect when you use the
            platform, why we collect it, and who it&apos;s shared with — in line with the
            Protection of Personal Information Act (POPIA).
          </p>

          <h2 style={h2}>What we collect</h2>
          <p style={p}>When you register and use Reporthole, we collect:</p>
          <ul style={{ margin: "0 0 10px", paddingLeft: 20 }}>
            <li style={li}>Your name, email address, and phone number, provided at registration.</li>
            <li style={li}>The GPS location and photo attached to each report you submit or confirm.</li>
            <li style={li}>Basic account activity, such as reports you&apos;ve made and messages you&apos;ve sent.</li>
          </ul>

          <h2 style={h2}>Why we collect it</h2>
          <p style={p}>
            Your name and contact details let a municipality follow up with you about a report, and
            let us send account notices (like updates on a report&apos;s status). The location and
            photo on a report are the core of what makes a report useful — a municipality can&apos;t
            fix a pothole it can&apos;t find.
          </p>

          <h2 style={h2}>Who it&apos;s shared with</h2>
          <p style={p}>
            Reports you submit — including their location and photo, but not your contact details —
            are visible to the municipality responsible for that area and to any contractor they
            assign to the job. Your name, email, and phone number are kept private and are only
            revealed to municipality or platform staff when there&apos;s a genuine need to contact
            you about a report, and every such disclosure is logged. We do not sell or share your
            information with advertisers or unrelated third parties.
          </p>

          <h2 style={h2}>Your consent</h2>
          <p style={p}>
            By registering for a Reporthole account, you agree to our Terms and Conditions and
            consent to the collection, storage, and use of your personal information — including
            your name, email, phone number, and the locations attached to the reports you submit —
            as described on this page.
          </p>

          <h2 style={h2}>Your rights</h2>
          <p style={p}>
            You can review and update your details at any time from your profile, and you can
            request that your account be deleted. If you have questions about your information or
            want to exercise a right under POPIA, get in touch via our contact page.
          </p>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
