import Link from "next/link";
import LandingHeader from "./_landing/LandingHeader";
import LandingFooter from "./_landing/LandingFooter";
import PinIcon from "./_landing/PinIcon";

/** Monospace style used for labels and stats sub-text. */
const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono-brand, 'IBM Plex Mono', monospace)",
};

const issueTypes = [
  "Potholes",
  "Cracked surface",
  "Faded lane markings",
  "Damaged traffic signs",
  "Blocked storm drains",
  "Broken traffic lights",
  "Accidents",
];

const steps = [
  {
    num: "01",
    title: "Snap it",
    body: "Take the photo in-app. Your GPS location is attached automatically, so you never type an address.",
  },
  {
    num: "02",
    title: "Classify it",
    body: "Pick a category and add a line of context. If someone already reported it nearby, we ask you to confirm theirs instead of filing a duplicate.",
  },
  {
    num: "03",
    title: "Follow it",
    body: "Every report carries an audit trail. You get a live update each time the status moves or another resident backs your report.",
  },
];

const muniPoints = [
  "Geospatial clustering so one road fault is one work item, not forty tickets.",
  "Every status change timestamped and attributed for accountability.",
  "Reporter confirmations give you a real severity signal, not guesswork.",
];

const stats = [
  { value: "7 issue types", label: "potholes to broken robots" },
  { value: "1 km radius", label: "duplicate detection on submit" },
  { value: "5 statuses", label: "reported → resolved" },
  { value: "Live push", label: "updates the moment status changes" },
];

/** Full marketing landing page. */
export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F6F7F9", color: "#0E1420" }}>
      <LandingHeader />

      <main id="top">
        {/* ── Hero ── */}
        <section style={{ background: "#1A56F0", color: "#fff", padding: "clamp(48px, 8vw, 96px) 24px clamp(52px, 8vw, 96px)" }}>
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  ...mono,
                  display: "inline-block",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "7px 12px",
                  border: "1px solid rgba(255,255,255,0.45)",
                  borderRadius: 999,
                }}
              >
                Gauteng · civic reporting
              </span>
              <h1
                style={{
                  fontSize: "clamp(38px, 5.2vw, 62px)",
                  lineHeight: 1.03,
                  letterSpacing: "-0.035em",
                  fontWeight: 800,
                  margin: "22px 0 0",
                }}
              >
                Report the pothole.<br />Track the fix.
              </h1>
              <p
                style={{
                  fontSize: 18.5,
                  lineHeight: 1.55,
                  maxWidth: "30em",
                  margin: "20px 0 0",
                  color: "#E4EAFD",
                }}
              >
                Photograph a road issue, drop the location, and follow its status from reported to
                resolved — with live updates every time someone else confirms the same problem.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
                <Link
                  href="/register"
                  style={{
                    padding: "16px 28px",
                    borderRadius: 12,
                    background: "#fff",
                    color: "#1A56F0",
                    fontWeight: 800,
                    fontSize: 16,
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Create free account
                </Link>
                <Link
                  href="/login"
                  style={{
                    padding: "16px 28px",
                    borderRadius: 12,
                    border: "1.5px solid rgba(255,255,255,0.6)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Sign in
                </Link>
              </div>
              <p style={{ ...mono, fontSize: 12.5, color: "#C7D5FC", margin: "18px 0 0" }}>
                Free for residents · Accounts keep your reports traceable
              </p>
            </div>

            {/* Phone mockup */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: 300,
                  maxWidth: "100%",
                  aspectRatio: "9 / 18.5",
                  borderRadius: 34,
                  background: "#0E1420",
                  padding: 10,
                  boxShadow: "0 28px 60px rgba(8,16,40,0.38)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 26,
                    background: "#1A56F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PinIcon size={108} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats band ── */}
        <section style={{ background: "#0E1420", color: "#fff", padding: "26px 24px" }}>
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 24,
            }}
          >
            {stats.map((s) => (
              <div key={s.value} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>{s.value}</span>
                <span style={{ ...mono, fontSize: 12.5, color: "#98A2B8" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how" style={{ padding: "clamp(48px, 7vw, 92px) 24px", maxWidth: 1180, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(28px, 3.4vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Three taps from pothole to paper trail
          </h2>
          <p style={{ fontSize: 17, color: "#4B5566", maxWidth: "38em", margin: "14px 0 0", lineHeight: 1.55 }}>
            Reporthole is built for the side of the road: one hand, bad signal, two minutes.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              marginTop: 44,
            }}
          >
            {steps.map((step) => (
              <div
                key={step.num}
                style={{
                  background: "#fff",
                  border: "1px solid #E3E7EE",
                  borderRadius: 18,
                  padding: 28,
                }}
              >
                <span style={{ ...mono, fontSize: 12.5, color: "#1A56F0" }}>{step.num}</span>
                <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", margin: "12px 0 8px" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "#4B5566", margin: 0 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── What you can report ── */}
        <section
          id="report"
          style={{
            background: "#fff",
            borderTop: "1px solid #E3E7EE",
            borderBottom: "1px solid #E3E7EE",
            padding: "clamp(48px, 7vw, 88px) 24px",
          }}
        >
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "clamp(28px, 3.4vw, 40px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  margin: 0,
                }}
              >
                What you can report
              </h2>
              <p style={{ fontSize: 17, color: "#4B5566", maxWidth: "34em", margin: "14px 0 28px", lineHeight: 1.55 }}>
                Seven categories cover the road faults that actually get municipal work orders raised.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {issueTypes.map((label) => (
                  <span
                    key={label}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 999,
                      background: "#EEF3FE",
                      color: "#1240C4",
                      fontSize: 14.5,
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Map placeholder SVG */}
            <svg
              viewBox="0 0 520 360"
              style={{ width: "100%", height: "auto", borderRadius: 18, display: "block", border: "1px solid #E3E7EE" }}
              aria-label="Placeholder map of clustered incident reports"
            >
              <defs>
                <pattern id="rh-stripe-map" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                  <rect width="10" height="10" fill="#F1F3F8" />
                  <rect width="4" height="10" fill="#E5E9F2" />
                </pattern>
              </defs>
              <rect width="520" height="360" fill="url(#rh-stripe-map)" />
              <text x="260" y="176" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="13" fill="#5C6880">
                map of clustered reports
              </text>
              <text x="260" y="198" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="13" fill="#5C6880">
                Gauteng, South Africa
              </text>
            </svg>
          </div>
        </section>

        {/* ── For municipalities ── */}
        <section id="municipalities" style={{ padding: "clamp(48px, 7vw, 92px) 24px", maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{
              background: "#0E1420",
              color: "#fff",
              borderRadius: 24,
              padding: "clamp(32px, 5vw, 60px)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 40,
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "clamp(26px, 3.2vw, 38px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  margin: 0,
                }}
              >
                For municipalities and contractors
              </h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.6, color: "#B9C2D4", margin: "16px 0 0", maxWidth: "34em" }}>
                Deduplicated, geotagged, photo-backed reports with a full status audit trail — ready to
                route to the crew that fixes it.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {muniPoints.map((point) => (
                <div key={point} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#6A97FF",
                      marginTop: 8,
                      flex: "none",
                    }}
                  />
                  <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.55, color: "#E3E8F2" }}>{point}</p>
                </div>
              ))}
              <Link
                href="/contact"
                style={{
                  alignSelf: "flex-start",
                  marginTop: 10,
                  padding: "14px 24px",
                  borderRadius: 12,
                  background: "#fff",
                  color: "#0E1420",
                  fontWeight: 800,
                  fontSize: 15.5,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Talk to us
              </Link>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section style={{ background: "#1A56F0", color: "#fff", padding: "clamp(48px, 7vw, 80px) 24px", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "clamp(28px, 3.6vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Your street, on the record.
          </h2>
          <p
            style={{
              fontSize: 17.5,
              color: "#DCE5FD",
              margin: "14px auto 30px",
              maxWidth: "34em",
              lineHeight: 1.55,
            }}
          >
            Create an account and file your first report in under two minutes.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/register"
              style={{
                padding: "16px 30px",
                borderRadius: 12,
                background: "#fff",
                color: "#1A56F0",
                fontWeight: 800,
                fontSize: 16,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Create account
            </Link>
            <Link
              href="/login"
              style={{
                padding: "16px 30px",
                borderRadius: 12,
                border: "1.5px solid rgba(255,255,255,0.6)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
