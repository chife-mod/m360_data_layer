"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Floating version pill (bottom-right).
 *
 * Chrome only — it must never affect the layout or the design of a version,
 * so it renders as a fixed overlay and is the single shared component allowed
 * on both V1 and V2 pages. Each version otherwise owns its own component tree
 * (`components/ui` + `lib` for V1, `components/v2` + `lib/v2` for V2), which is
 * what keeps V1 frozen while V2 evolves.
 */

type Version = {
  id: string;
  label: string;
  href: string;
};

const VERSIONS: Version[] = [
  { id: "v1", label: "V1", href: "/" },
  { id: "v2", label: "V2", href: "/v2" },
];

function Segment({
  version,
  isCurrent,
}: {
  version: Version;
  isCurrent: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const content = (
    <span
      style={{
        display: "block",
        padding: "5px 14px",
        borderRadius: 999,
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: "16px",
        whiteSpace: "nowrap",
        color: isCurrent
          ? "rgba(255,255,255,0.95)"
          : hovered
            ? "rgba(255,255,255,0.7)"
            : "rgba(255,255,255,0.4)",
        backgroundColor: isCurrent ? "rgba(255,255,255,0.1)" : "transparent",
        transition: "color 0.15s ease, background-color 0.15s ease",
      }}
    >
      {version.label}
    </span>
  );

  if (isCurrent) {
    return (
      <span aria-current="page" title={`Current version — ${version.label}`}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={version.href}
      title={`Switch to ${version.label}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: "none", outline: "none" }}
    >
      {content}
    </Link>
  );
}

/**
 * Hidden for the client demo — brief of 2026-07-29: "Hide V1 / V2 switch in the
 * bottom". The versions still exist at `/` and `/v2`; only the pill is gone.
 * Flip this to bring it back.
 */
const SHOW_VERSION_SWITCHER = false;

export function VersionSwitcher({ current }: { current: string }) {
  if (!SHOW_VERSION_SWITCHER) return null;

  return (
    <nav
      aria-label="Prototype version"
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: 3,
        borderRadius: 999,
        backgroundColor: "rgba(10, 10, 26, 0.72)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
      }}
    >
      {VERSIONS.map((v) => (
        <Segment key={v.id} version={v} isCurrent={v.id === current} />
      ))}
    </nav>
  );
}
