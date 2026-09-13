"use client";

import { useState } from "react";
import Link from "next/link";
import PinIcon from "./PinIcon";

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

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid #E3E7EE",
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
          style={{ display: "flex", alignItems: "center", gap: 10, color: "#0E1420", textDecoration: "none", flex: "none" }}
          aria-label="Reporthole home"
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#1A56F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <PinIcon size={17} />
          </span>
          <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em" }}>Reporthole</span>
        </Link>

        {/* Desktop nav — hidden on mobile via CSS */}
        <nav className="rh-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 22, marginLeft: 4 }}>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} style={navLinkStyle}>{l.label}</Link>
          ))}
        </nav>

        {/* Desktop auth buttons — hidden on mobile via CSS */}
        <div className="rh-desktop-auth" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flex: "none" }}>
          <Link
            href="/login"
            style={{ padding: "11px 16px", borderRadius: 10, fontSize: 14.5, fontWeight: 700, color: "#0E1420", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            style={{ padding: "11px 18px", borderRadius: 10, fontSize: 14.5, fontWeight: 700, color: "#fff", background: "#1A56F0", boxShadow: "0 1px 2px rgba(14,20,32,0.18)", textDecoration: "none", whiteSpace: "nowrap" }}
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
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#0E1420" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="3" x2="19" y2="19" />
              <line x1="19" y1="3" x2="3" y2="19" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#0E1420" strokeWidth="2.5" strokeLinecap="round">
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
          style={{ borderTop: "1px solid #E3E7EE", background: "#fff" }}
        >
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
                  color: "#0E1420",
                  textDecoration: "none",
                  borderBottom: "1px solid #F0F2F6",
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 10, padding: "16px 20px" }}>
            <Link
              href="/login"
              style={{ flex: 1, padding: "13px 0", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "#0E1420", textDecoration: "none", textAlign: "center", border: "1.5px solid #E3E7EE", display: "block" }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              style={{ flex: 1, padding: "13px 0", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "#fff", background: "#1A56F0", textDecoration: "none", textAlign: "center", display: "block" }}
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
