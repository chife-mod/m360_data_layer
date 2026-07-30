"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  History,
  ToggleLeft,
  Layers,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

// ─── Module registry ──────────────────────────────────────────────────────────

const MODULES = [
  {
    id: "data-layer",
    title: "M360 Data Layer",
    description:
      "The module. Industry and Type selectors, 16 datalakes per industry, Overview and Tasks & Apps.",
    href: "/",
    status: "wip" as const,
    Icon: Zap,
    accent: "#00e59b",
  },
  {
    id: "data-layer-v1",
    title: "Data Layer V1",
    description:
      "Frozen first version, kept for comparison and rollback. The original 16-signal picker before industries existed.",
    href: "/v1",
    status: "live" as const,
    Icon: History,
    accent: "#646eca",
  },
  {
    id: "toggle",
    title: "Toggle Component",
    description:
      "Custom animated toggle with spring physics. Supports three states, dark theme. Integrated into Signal Selector.",
    href: "/toggle-demo",
    status: "demo" as const,
    Icon: ToggleLeft,
    accent: "#8b5cf6",
  },
  {
    id: "card-demo",
    title: "Card States",
    description:
      "Full showcase of DataCard and SourceCard states — default, hover, active, selected, disabled. Pixel-perfect from Figma.",
    href: "/card-demo",
    status: "demo" as const,
    Icon: Layers,
    accent: "#00d4ff",
  },
  {
    id: "round-crossover",
    title: "Sneaker Circles",
    description:
      "Canvas particle animation. Circles assemble into a sneaker silhouette with spring physics and cursor repulsion.",
    href: "/round_crossover",
    status: "wip" as const,
    Icon: Sparkles,
    accent: "#c026d3",
  },
];

const STATUS_DOT: Record<string, string> = {
  live: "#00e59b",
  demo: "#646eca",
  wip: "#f59e0b",
};

// ─── Card ─────────────────────────────────────────────────────────────────────

function ModuleCard({
  mod,
  index,
}: {
  mod: (typeof MODULES)[number];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const { Icon } = mod;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.15 + index * 0.07,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link
        href={mod.href}
        target={mod.href === "/" ? "_self" : "_blank"}
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          flexDirection: "column",
          height: 200,
          padding: 24,
          borderRadius: 16,
          backgroundColor: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
          textDecoration: "none",
          transition: "all 0.25s ease",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle bottom glow on hover */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -40,
            transform: "translateX(-50%)",
            width: 140,
            height: 80,
            borderRadius: "50%",
            backgroundColor: mod.accent,
            filter: "blur(50px)",
            opacity: hovered ? 0.12 : 0,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          }}
        />

        {/* Top row: icon + arrow */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: hovered ? `${mod.accent}18` : "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.25s ease",
            }}
          >
            <Icon
              size={18}
              strokeWidth={1.5}
              style={{
                color: hovered ? mod.accent : "rgba(255,255,255,0.4)",
                transition: "color 0.25s ease",
              }}
            />
          </div>
          <ArrowUpRight
            size={14}
            style={{
              color: hovered ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.12)",
              transition: "color 0.25s ease",
              marginTop: 2,
            }}
          />
        </div>

        {/* Title */}
        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)",
            fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
            lineHeight: 1.3,
            marginBottom: 8,
            transition: "color 0.25s ease",
          }}
        >
          {mod.title}
        </span>

        {/* Description — max 3 lines */}
        <p
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
            lineHeight: 1.55,
            margin: 0,
            flex: 1,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {mod.description}
        </p>

        {/* Status dot — bottom left */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: STATUS_DOT[mod.status],
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 400,
              color: "rgba(255,255,255,0.25)",
              fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
              letterSpacing: "0.03em",
            }}
          >
            {mod.status}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a1a",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "72px 20px 120px" }}>
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 56,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}>
              M360
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.15)" }}>/</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              Project Dashboard
            </span>
          </div>
          <Link
            href="/"
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
          >
            Product page
            <ArrowUpRight size={11} />
          </Link>
        </motion.div>

        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ marginBottom: 48 }}
        >
          <h1
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "rgba(255,255,255,0.92)",
              margin: "0 0 10px",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Project Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", margin: 0, lineHeight: 1.5 }}>
            {MODULES.length} modules built · click to preview
          </p>
        </motion.div>

        {/* ── Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          {MODULES.map((mod, i) => (
            <ModuleCard key={mod.id} mod={mod} index={i} />
          ))}

          {/* Placeholder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 + MODULES.length * 0.07 }}
            style={{
              height: 200,
              borderRadius: 16,
              border: "1px dashed rgba(255,255,255,0.06)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 20, color: "rgba(255,255,255,0.08)", fontWeight: 300 }}>+</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.12)", textAlign: "center", lineHeight: 1.5 }}>
              Next module
            </span>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
