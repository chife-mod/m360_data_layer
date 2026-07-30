"use client";

import { Fragment, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SignalConfig } from "@/lib/signals-data";
import { getInsightDescription } from "@/lib/signals-data";
import { getAssetPath, fetchSvgAsset } from "@/lib/utils";

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function useIconSvg(iconName: string) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let live = true;
    fetchSvgAsset(`/assets/icons/${iconName}.svg`).then((t) => {
      if (live) setSvg(t);
    });
    return () => {
      live = false;
    };
  }, [iconName]);
  return svg;
}

const BAR_COUNT = 15;

const HEIGHT_SETS: Record<number, number[]> = {
  0: Array(BAR_COUNT).fill(0),
  1: [28, 52, 44, 72, 36, 88, 48, 64, 32, 76, 56, 40, 68, 96, 112],
  2: [17, 48, 87, 36, 73, 52, 28, 69, 20, 48, 84, 42, 73, 104, 119],
  3: [48, 72, 36, 96, 28, 64, 52, 88, 40, 80, 56, 32, 72, 108, 119],
};

function SignalBarChart({
  selectedSignals,
}: {
  selectedSignals: SignalConfig[];
}) {
  const count = selectedSignals.length;
  const heights = HEIGHT_SETS[Math.min(count, 3)];

  return (
    <>
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const signal = count > 0 ? selectedSignals[i % count] : null;
        const color = signal?.color ?? "transparent";
        const height = heights[i];

        return (
          <motion.div
            key={i}
            animate={{ height, opacity: count > 0 ? 1 : 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{
              height: {
                type: "spring",
                stiffness: 200,
                damping: 22,
                delay: i * 0.028,
              },
              opacity: { duration: 0.3, delay: i * 0.025 },
            }}
            style={{
              flex: "1 0 0",
              minWidth: 0,
              minHeight: 0,
              position: "relative",
              background:
                count > 0
                  ? `linear-gradient(to bottom, ${hexToRgba(color, 0.12)}, transparent)`
                  : "transparent",
              transition: "background 0.45s ease",
            }}
          >
            {count > 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: 1,
                  background: `linear-gradient(to bottom, ${hexToRgba(color, 0.2)}, transparent)`,
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  pointerEvents: "none",
                  transition: "background 0.45s ease",
                }}
              />
            )}
          </motion.div>
        );
      })}
    </>
  );
}

function SignalIconBadge({
  signal,
  index,
}: {
  signal: SignalConfig;
  index: number;
}) {
  const svg = useIconSvg(signal.icon);

  return (
    <motion.div
      layout
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.6, opacity: 0 }}
      transition={{
        layout: { type: "spring", stiffness: 350, damping: 28 },
        scale: { type: "spring", stiffness: 400, damping: 22 },
        opacity: { duration: 0.18 },
        delay: index * 0.05,
      }}
      style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}
    >
      {svg && (
        <div
          style={{
            width: 64,
            height: 64,
            color: signal.color,
            filter: "drop-shadow(0px -2px 3.9px #111539)",
          }}
          dangerouslySetInnerHTML={{
            __html: svg
              .replace(/width="32"\s*height="32"/, 'width="64" height="64"')
              .replace(/viewBox="[^"]*"/, 'viewBox="0 0 32 32"'),
          }}
        />
      )}
    </motion.div>
  );
}

type Props = { selectedSignals: SignalConfig[]; singleSelect?: boolean };

export function InsightPanel({ selectedSignals, singleSelect = false }: Props) {
  const count = selectedSignals.length;
  const description = getInsightDescription(selectedSignals.map((s) => s.id));

  return (
    <div
      style={{
        width: 515,
        height: 532,
        backgroundColor: "#111539",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 12,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -0.5,
          borderRadius: "inherit",
          boxShadow:
            "inset 0px -12px 44.7px 0px rgba(255, 255, 255, 0.09)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      <AnimatePresence>
        {count === 0 && (
          <motion.div
            key="empty-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: 32,
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 32 32"
              fill="none"
              style={{ opacity: 0.4, overflow: "visible", flexShrink: 0 }}
            >
              <path
                d="M17.6667 7.66667C18.5336 7.437 19.379 7.13253 20.1933 6.75667C21.7117 6.02667 22.6833 5.065 23.4217 3.53667C23.7667 2.82333 24.0583 1.99 24.3333 1C24.6083 1.99167 24.9 2.825 25.245 3.535C25.9833 5.065 26.955 6.02667 28.4733 6.75667C29.1833 7.09833 30.015 7.39 31 7.66667C30.133 7.89687 29.2876 8.2019 28.4733 8.57833C26.955 9.30833 25.9833 10.27 25.245 11.7983C24.8657 12.6143 24.5606 13.4627 24.3333 14.3333C24.0583 13.3433 23.7667 12.5083 23.4217 11.7983C22.6833 10.2683 21.7117 9.30833 20.1933 8.57833C19.3801 8.19949 18.5345 7.89438 17.6667 7.66667ZM1 19.3333C1.9296 19.0758 2.84817 18.78 3.75333 18.4467C7.99 16.8583 10.175 14.7167 11.78 10.4367C12.1157 9.52667 12.4116 8.60246 12.6667 7.66667C12.9218 8.60246 13.2176 9.52667 13.5533 10.4367C15.1583 14.715 17.345 16.8583 21.58 18.4467C22.4133 18.7578 23.3311 19.0533 24.3333 19.3333C23.4037 19.5908 22.4852 19.8866 21.58 20.22C17.3433 21.8083 15.1567 23.95 13.5533 28.23C13.2176 29.14 12.9218 30.0642 12.6667 31C12.4116 30.0642 12.1157 29.14 11.78 28.23C10.175 23.95 7.98833 21.8083 3.75333 20.22C2.84817 19.8866 1.9296 19.5908 1 19.3333Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p
              style={{
                fontSize: 24,
                fontWeight: 400,
                lineHeight: 1.3,
                color: "white",
                opacity: 0.8,
                textAlign: "center",
                width: 318,
                fontFamily:
                  "var(--font-inter), Inter, system-ui, sans-serif",
              }}
            >
              Select multiple data sources to generate combined insights
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          flex: "1 0 0",
          position: "relative",
          minHeight: 0,
        }}
      >
        <AnimatePresence mode="wait">
          {count > 0 && (
            <motion.div
              key={singleSelect ? (selectedSignals[0]?.id ?? "single") : "active-content"}
              initial={{ opacity: 0, y: singleSelect ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: singleSelect ? 0 : -10 }}
              transition={{
                duration: singleSelect ? 0.18 : 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                position: "absolute",
                inset: 0,
                padding: "40px 40px 0 40px",
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  width: "100%",
                }}
              >
                <motion.div layout style={{ display: "flex", gap: 16 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                >
                  <AnimatePresence mode="popLayout">
                    {selectedSignals.map((signal, i) => (
                      <SignalIconBadge
                        key={signal.id}
                        signal={signal}
                        index={i}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    alignItems: "baseline",
                    fontSize: 32,
                    fontWeight: 600,
                    lineHeight: 1.05,
                    width: "100%",
                    fontFamily:
                      "var(--font-inter), Inter, system-ui, sans-serif",
                  }}
                >
                  {selectedSignals.map((signal, i) => (
                    <Fragment key={signal.id}>
                      {i > 0 && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 25,
                            delay: 0.08,
                          }}
                          style={{ color: "white" }}
                        >
                          +
                        </motion.span>
                      )}
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.07 }}
                        style={{ color: signal.color }}
                      >
                        {signal.label}
                      </motion.span>
                    </Fragment>
                  ))}
                </div>
              </div>

              <motion.p
                layout
                transition={{
                  layout: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                }}
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: "white",
                  width: 378,
                  maxWidth: "100%",
                  margin: 0,
                  fontFamily:
                    "var(--font-inter), Inter, system-ui, sans-serif",
                }}
              >
                {description}
              </motion.p>

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <motion.button
                  layout
                  transition={{
                    layout: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
                  }}
                  whileHover={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    borderRadius: 8,
                    height: 40,
                    padding: "0 24px",
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: 1,
                    color: "white",
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily:
                      "var(--font-inter), Inter, system-ui, sans-serif",
                    outline: "none",
                  }}
                >
                  Overview
                </motion.button>

                <motion.button
                  layout
                  transition={{
                    layout: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
                  }}
                  whileHover={{ color: "rgba(255, 255, 255, 1)" }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    border: "none",
                    background: "transparent",
                    height: 40,
                    padding: "0 16px",
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: 1,
                    color: "rgba(255, 255, 255, 0.45)",
                    cursor: "pointer",
                    fontFamily:
                      "var(--font-inter), Inter, system-ui, sans-serif",
                    outline: "none",
                  }}
                >
                  Apps
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        style={{
          height: 119,
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <SignalBarChart selectedSignals={selectedSignals} />
      </div>
    </div>
  );
}
