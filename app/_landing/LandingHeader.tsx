"use client";

import { useState } from "react";
import Link from "next/link";
import PinIcon from "./PinIcon";
import { useLandingTheme } from "./LandingThemeContext";

const navLinks = [
  { href: "/#how", label: "How it works" },
  { href: "/#report", label: "What you can report" },
  { href: "/#municipalities", label: "For municipalities" },
  { href: "/contact", label: "Contact" },
];

const navLinkStyle: React.CSSProperties = {
  fontSize: 14.5,
  fontWeight: 600,
  color: "#414A5C",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { dark, toggle } = useLandingTheme();

  const headerBg   = dark ? "rgba(15,15,15,0.96)"  : "rgba(255,255,255,0.96)";
  const headerText = dark ? "#E9E9E7" : "#0E1420";
  const borderCol  = dark ? "#2F2F2F" : "#E3E7EE";
  const navColor   = dark ? "#9CA3AF" : "#414A5C";
  const btnBg      = dark ? "#FFFFFF" : "#191919";
  const btnColor   = dark ? "#191919" : "#FFFFFF";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: headerBg,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: `1px solid ${borderCol}`,
      }}
    >
      {/* Main bar */}
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 10, color: headerText, textDecoration: "none", flex: "none" }}
          aria-label="Reporthole home"
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: dark ? "#FFFFFF" : "#191919",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <PinIcon size={17} color={dark ? "#191919" : "#FFFFFF"} />
          </span>
          <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em" }}>Reporthole</span>
        </Link>

        {/* Desktop nav — hidden on mobile via CSS */}
        <nav className="rh-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 22, marginLeft: 4 }}>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} style={{ ...navLinkStyle, color: navColor }}>{l.label}</Link>
          ))}
        </nav>

        {/* Desktop auth + theme toggle — hidden on mobile via CSS */}
        <div className="rh-desktop-auth" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 8, color: navColor, display: "flex", alignItems: "center" }}
          >
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z" />
              </svg>
            )}
          </button>

          <Link
            href="/login"
            style={{ padding: "11px 16px", borderRadius: 10, fontSize: 14.5, fontWeight: 700, color: headerText, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            style={{ padding: "11px 18px", borderRadius: 10, fontSize: 14.5, fontWeight: 700, color: btnColor, background: btnBg, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            Create account
          </Link>
        </div>

        {/* Hamburger — visible on mobile only via CSS */}
        <button
          className="rh-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            borderRadius: 8,
          }}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={headerText} strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="3" x2="19" y2="19" />
              <line x1="19" y1="3" x2="3" y2="19" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={headerText} strokeWidth="2.5" strokeLinecap="round">
              <line x1="2" y1="6" x2="20" y2="6" />
              <line x1="2" y1="11" x2="20" y2="11" />
              <line x1="2" y1="16" x2="20" y2="16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown — only rendered when open; CSS class makes it flex on mobile */}
      {menuOpen && (
        <div
          className="rh-mobile-menu"
          style={{ borderTop: `1px solid ${borderCol}`, background: dark ? "#191919" : "#fff" }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 20px 0" }}>
            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              style={{ background: "none", border: "none", cursor: "pointer", color: navColor, display: "flex", alignItems: "center", padding: 6 }}
            >
              {dark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z" />
                </svg>
              )}
            </button>
          </div>
          <nav style={{ display: "flex", flexDirection: "column" }}>
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: "14px 20px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: headerText,
                  textDecoration: "none",
                  borderBottom: `1px solid ${borderCol}`,
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 10, padding: "16px 20px" }}>
            <Link
              href="/login"
              style={{ flex: 1, padding: "13px 0", borderRadius: 10, fontSize: 15, fontWeight: 700, color: headerText, textDecoration: "none", textAlign: "center", border: `1.5px solid ${borderCol}`, display: "block" }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              style={{ flex: 1, padding: "13px 0", borderRadius: 10, fontSize: 15, fontWeight: 700, color: btnColor, background: btnBg, textDecoration: "none", textAlign: "center", display: "block" }}
            >
              Create account
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .rh-desktop-nav  { display: none !important; }
          .rh-desktop-auth { display: none !important; }
          .rh-hamburger    { display: flex !important; }
          .rh-mobile-menu  { display: block; }
        }
      `}</style>
    </header>
  );
}
