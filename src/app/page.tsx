"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  INDUSTRIES,
  getIndustry,
  getDatalakeSet,
  getCompatible,
  getDescription,
  getDatalake,
} from "@/lib/v2/datalakes";
import { DataCard } from "@/components/v2/DataCard";
import { InsightPanel } from "@/components/v2/InsightPanel";
import { Toggle } from "@/components/v2/Toggle";
import { Select } from "@/components/v2/Select";
import { VersionSwitcher } from "@/components/VersionSwitcher";
import { getAssetPath } from "@/lib/utils";

/** 4 columns x 191px + 3 gaps x 4px */
const GRID_WIDTH = 776;
/** Insight panel width */
const PANEL_WIDTH = 515;
/** Grid + 5px gap + insight panel — the full module width. */
const BOARD_WIDTH = GRID_WIDTH + 5 + PANEL_WIDTH;

export default function DataLayerV2() {
  const [industryId, setIndustryId] = useState("watches");
  const [typeId, setTypeId] = useState("brand");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showAiOnly, setShowAiOnly] = useState(false);
  const [resetHovered, setResetHovered] = useState(false);

  const industry = useMemo(() => getIndustry(industryId), [industryId]);
  const set = useMemo(() => getDatalakeSet(industryId), [industryId]);

  // Datalake ids are per-set, so a selection cannot survive an industry change.
  const handleIndustryChange = useCallback((id: string) => {
    setIndustryId(id);
    setTypeId(getIndustry(id).types[0]?.id ?? "");
    setSelectedIds([]);
  }, []);

  const handleTypeChange = useCallback((id: string) => {
    setTypeId(id);
  }, []);

  const handleToggleChange = useCallback(
    (value: boolean) => {
      setShowAiOnly(value);
      // Keep whatever survives the mode change instead of always clearing.
      // Turning the filter on drops tiles it hides and, since that mode is
      // single-select, keeps the first surviving one; turning it off widens the
      // board, so nothing has to go.
      setSelectedIds((prev) => {
        if (!value) return prev;
        const surviving = prev.filter((id) => set.aiChatIds.includes(id));
        return surviving.slice(0, 1);
      });
    },
    [set]
  );

  const handleReset = useCallback(() => setSelectedIds([]), []);

  const compatibleIds = useMemo(
    () => getCompatible(set, selectedIds),
    [set, selectedIds]
  );

  const toggleDatalake = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (showAiOnly) {
          // Single-select mode: clicking selected deselects, clicking another swaps
          return prev.includes(id) ? [] : [id];
        }
        // Multi-select mode (up to 3, compatibility-based)
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= 3) return prev;
        if (!getCompatible(set, prev).includes(id)) return prev;
        return [...prev, id];
      });
    },
    [set, showAiOnly]
  );

  const selectedDatalakes = useMemo(
    () =>
      selectedIds
        .map((id) => getDatalake(set, id))
        .filter((d): d is NonNullable<typeof d> => Boolean(d)),
    [set, selectedIds]
  );

  const description = useMemo(
    () => getDescription(set, selectedIds),
    [set, selectedIds]
  );

  const hasSelection = selectedIds.length > 0;

  const rows = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < set.datalakes.length; i += 4) {
      chunks.push(set.datalakes.slice(i, i + 4));
    }
    return chunks;
  }, [set]);

  let cardIndex = 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#111539",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* ── Control row ───────────────────────────────────────────────────
            Split the same way as the board underneath: the first block is
            exactly the grid's width, so Reset lands on the grid's right edge;
            the second is the insight panel's width, so the switch lands on the
            module's right edge. Both blocks are 48 high — the select box
            height — so everything shares one baseline. */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 5,
            width: BOARD_WIDTH,
          }}
        >
          {/* Aligned with the tile grid */}
          <div
            style={{
              width: GRID_WIDTH,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <Select
                label="Industry"
                options={INDUSTRIES.map((i) => ({
                  id: i.id,
                  label: i.label,
                  icon: i.icon,
                  accent: i.accent,
                  // Factual subtitle — the industry's viewer types, no copy
                  // invented for it.
                  hint: i.types.map((t) => t.label).join(" · "),
                }))}
                value={industryId}
                onChange={handleIndustryChange}
                minWidth={210}
              />
              <Select
                label="Type"
                options={industry.types}
                value={typeId}
                onChange={handleTypeChange}
                minWidth={230}
              />
            </div>

            {/* Reset — flush with the grid's right edge. Fixed slot so the row
                does not shift when the button fades in and out. */}
            <div
              style={{
                minWidth: 150,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
            {/* Plain CSS transition on purpose.
                Under AnimatePresence an interrupted transition stranded a
                translateX(8px) on this button, pushing it past the grid edge it
                aligns to; driving framer from state did not recover either.
                Two properties do not need an animation library. */}
                <button
                  type="button"
                  onClick={handleReset}
                  aria-hidden={!hasSelection}
                  tabIndex={hasSelection ? 0 : -1}
                  onMouseEnter={() => setResetHovered(true)}
                  onMouseLeave={() => setResetHovered(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    outline: "none",
                    opacity: hasSelection ? 1 : 0,
                    transform: hasSelection
                      ? "translateX(0)"
                      : "translateX(8px)",
                    transition: "opacity 0.2s ease, transform 0.2s ease",
                    pointerEvents: hasSelection ? "auto" : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        "var(--font-inter), Inter, system-ui, sans-serif",
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: "19.6px",
                      color: resetHovered
                        ? "rgba(255,255,255,1)"
                        : "rgba(255,255,255,0.7)",
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
                </button>
            </div>
          </div>

          {/* Aligned with the insight panel: label first, switch flush against
              the module's right edge. */}
          <div
            style={{
              width: PANEL_WIDTH,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
                fontSize: 14,
                fontWeight: 400,
                lineHeight: "19.6px",
                color: "rgba(255, 255, 255, 0.8)",
                whiteSpace: "nowrap",
              }}
            >
              Show only datasets available in LLMs
            </span>
            <Toggle checked={showAiOnly} onChange={handleToggleChange} />
          </div>
        </div>

        {/* ── Grid + insight panel ─────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 5 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 191px)",
              gap: "4px",
            }}
          >
            {rows.map((row) =>
              row.map((datalake) => {
                const isSelected = selectedIds.includes(datalake.id);
                const isHovered = hoveredCard === datalake.id;
                let isActive = false;
                let isDisabled = false;

                if (showAiOnly) {
                  // LLM mode: non-AI datalakes disabled, AI ones stay default
                  if (!set.aiChatIds.includes(datalake.id)) isDisabled = true;
                } else if (selectedIds.length > 0) {
                  if (isSelected) {
                    // keep defaults
                  } else if (compatibleIds.includes(datalake.id)) {
                    isActive = true;
                  } else {
                    isDisabled = true;
                  }
                }

                return (
                  <DataCard
                    key={`${set.id}-${datalake.id}`}
                    source={datalake}
                    index={cardIndex++}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    isActive={isActive}
                    isDisabled={isDisabled}
                    onClick={() => toggleDatalake(datalake.id)}
                    onMouseEnter={() => setHoveredCard(datalake.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  />
                );
              })
            )}
          </div>

          <InsightPanel
            selectedSignals={selectedDatalakes}
            singleSelect={showAiOnly}
            description={description}
            setId={set.id}
            typeLabel={
              industry.types.find((t) => t.id === typeId)?.label ?? ""
            }
          />
        </div>
      </div>

      <VersionSwitcher current="v2" />
    </main>
  );
}
