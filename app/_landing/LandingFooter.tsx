import Link from "next/link";
import PinIcon from "./PinIcon";
import { useLandingTheme } from "./LandingThemeContext";

const mono: React.CSSProperties = { fontFamily: "var(--font-mono-brand, 'IBM Plex Mono', monospace)" };

const colLabel: React.CSSProperties = {
  ...mono,
  fontSize: 11.5,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#6F7A8F",
};

const footLink: React.CSSProperties = { fontSize: 14.5, color: "#C8D0DE", textDecoration: "none" };

export default function LandingFooter() {
  const { dark } = useLandingTheme();
  const footerBg = dark ? "#191919" : "#191919";

  return (
    <footer style={{ background: footerBg, color: "#B9C2D4", padding: "54px 24px 40px" }}>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 32,
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              <PinIcon size={15} color="#191919" />
            </span>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>Reporthole</span>
          </div>
          <p style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.6, maxWidth: "24em" }}>
            Civic road-incident reporting for Gauteng, South Africa.
          </p>
        </div>

        {/* Product */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={colLabel}>Product</span>
          <Link href="/#how" style={footLink}>How it works</Link>
          <Link href="/#report" style={footLink}>What you can report</Link>
          <Link href="/#municipalities" style={footLink}>For municipalities</Link>
        </div>

        {/* Account */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={colLabel}>Account</span>
          <Link href="/login" style={footLink}>Sign in</Link>
          <Link href="/register" style={footLink}>Create account</Link>
          <Link href="/contact" style={footLink}>Contact us</Link>
        </div>

        {/* Legal */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={colLabel}>Legal</span>
          <Link href="/privacy" style={footLink}>Privacy</Link>
          <Link href="/terms" style={footLink}>Terms</Link>
        </div>
      </div>

      <p style={{ maxWidth: 1180, margin: "36px auto 0", fontSize: 13, color: "#6F7A8F" }}>
        © 2026 Reporthole. Built in Gauteng.
      </p>
    </footer>
  );
}
