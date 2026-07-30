"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { sourcesGrid } from "@/lib/sources-data";
import {
  signalConfigs,
  getCompatibleSignals,
} from "@/lib/signals-data";
import { DataCard } from "@/components/ui/DataCard";
import { InsightPanel } from "@/components/ui/InsightPanel";
import { Toggle } from "@/components/ui/Toggle";
import { VersionSwitcher } from "@/components/VersionSwitcher";
import { getAssetPath } from "@/lib/utils";

export default function Home() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showAiOnly, setShowAiOnly] = useState(false);
  const [resetHovered, setResetHovered] = useState(false);

  const handleToggleChange = useCallback((value: boolean) => {
    setShowAiOnly(value);
    setSelectedIds([]);
  }, []);

  const compatibleIds = useMemo(
    () => getCompatibleSignals(selectedIds),
    [selectedIds]
  );

  const toggleSignal = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (showAiOnly) {
        // Single-select mode: clicking selected deselects, clicking another swaps
        return prev.includes(id) ? [] : [id];
      }
      // Multi-select mode (up to 3, compatibility-based)
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      const compatible = getCompatibleSignals(prev);
      if (!compatible.includes(id)) return prev;
      return [...prev, id];
    });
  }, [showAiOnly]);

  const selectedSignals = useMemo(
    () =>
      selectedIds
        .map((id) => signalConfigs[id])
        .filter((c): c is NonNullable<typeof c> => Boolean(c)),
    [selectedIds]
  );

  const AI_CHAT_SIGNAL_IDS = ["media", "reviews", "products", "brands", "retailers"];

  const handleReset = useCallback(() => {
    setSelectedIds([]);
  }, []);

  let cardIndex = 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#111539",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Top bar — Toggle + Reset — width = card grid (4×191 + 3×4 = 776px) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: 776,
            height: 32,
          }}
        >
          {/* Toggle + label */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Toggle
              checked={showAiOnly}
              onChange={handleToggleChange}
            />
            <span
              style={{
                fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
                fontSize: 14,
                fontWeight: 400,
                lineHeight: "19.6px",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              Show only data sources available in LLMs
            </span>
          </div>

          {/* Reset selection — fade-in, fixed-width slot prevents layout shift */}
          <div
            style={{
              minWidth: 150,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.button
                type="button"
                onClick={handleReset}
                onMouseEnter={() => setResetHovered(true)}
                onMouseLeave={() => setResetHovered(false)}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                whileHover={{}}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  outline: "none",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: "19.6px",
                    color: resetHovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)",
                    transition: "color 0.15s ease",
                  }}
                >
                  Reset selection
                </span>
                <Image
                  src={getAssetPath("/assets/icons/reload.svg")}
                  alt=""
                  width={16}
                  height={16}
                  style={{
                    opacity: resetHovered ? 1 : 0.4,
                    transition: "opacity 0.15s ease",
                    filter: "invert(1)",
                  }}
                  unoptimized
                />
              </motion.button>
            )}
            </AnimatePresence>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 5,
          }}
        >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 191px)",
            gap: "4px",
          }}
        >
          {sourcesGrid.map((row) =>
            row.map((source) => {
              const isSelected = selectedIds.includes(source.id);
              const isHovered = hoveredCard === source.id;
              let isActive = false;
              let isDisabled = false;

              if (showAiOnly) {
                // LLM mode: non-AI cards disabled, AI cards stay default unless selected
                if (!AI_CHAT_SIGNAL_IDS.includes(source.id)) {
                  isDisabled = true;
                }
              } else if (selectedIds.length > 0) {
                if (isSelected) {
                  // keep defaults
                } else if (compatibleIds.includes(source.id)) {
                  isActive = true;
                } else {
                  isDisabled = true;
                }
              }

              return (
                <DataCard
                  key={source.id}
                  source={source}
                  index={cardIndex++}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  isActive={isActive}
                  isDisabled={isDisabled}
                  onClick={() => toggleSignal(source.id)}
                  onMouseEnter={() => setHoveredCard(source.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                />
              );
            })
          )}
        </div>

        <InsightPanel selectedSignals={selectedSignals} singleSelect={showAiOnly} />
        </div>
      </div>

      <VersionSwitcher current="v1" />
    </main>
  );
}
