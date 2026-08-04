"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
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
import { AskBar, ChatDrawer } from "@/components/v2/AskChat";
import { seedHistoryIfEmpty } from "@/lib/v2/history";
import {
  ALL_ROLES,
  ROLE_META,
  getRolesForSet,
  getRoleTasks,
  getRoleDatalakeIds,
} from "@/lib/v2/roles";
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

// Default scope per the client (2026-07-30): the Mastercard demo opens on
// Banking as seen by a Payment System. Named so Reset knows where home is.
const DEFAULT_INDUSTRY = "banking";
const DEFAULT_TYPE = "payment-system";

export default function DataLayerV2() {
  const [industryId, setIndustryId] = useState(DEFAULT_INDUSTRY);
  const [typeId, setTypeId] = useState(DEFAULT_TYPE);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showAiOnly, setShowAiOnly] = useState(false);
  const [resetHovered, setResetHovered] = useState(false);
  // Role & Tasks view (client email 2026-08-03, "Advanced"): "я пиарщик —
  // что я могу решить?". "All roles" keeps the module exactly as it was.
  const [roleId, setRoleId] = useState(ALL_ROLES);

  // The chat door (Oleg's hypothesis check, 2026-08-04): the Ask bar above
  // the board and the lake prompts both open one drawer. `chatNonce` marks
  // each ask so repeating the same question still appends.
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSeed, setChatSeed] = useState("");
  const [chatNonce, setChatNonce] = useState(0);

  const openChat = useCallback((question: string) => {
    setChatSeed(question);
    if (question) setChatNonce((n) => n + 1);
    setChatOpen(true);
  }, []);

  const industry = useMemo(() => getIndustry(industryId), [industryId]);
  const set = useMemo(() => getDatalakeSet(industryId), [industryId]);

  // A virgin journal gets a believable week of outputs, so History reads as
  // lived-in on first open ("как будто там уже есть история", 2026-08-04).
  // No-op the moment any real output exists.
  useEffect(() => {
    seedHistoryIfEmpty();
  }, []);

  // Datalake ids are per-set, so a selection cannot survive an industry
  // change — and neither can a role: the tags belong to the set's apps.
  const handleIndustryChange = useCallback((id: string) => {
    // Roadmap industries are listed but not selectable; the Select already
    // refuses them, this is the belt to its braces.
    if (getIndustry(id).disabled) return;
    setIndustryId(id);
    setTypeId(getIndustry(id).types[0]?.id ?? "");
    setSelectedIds([]);
    setRoleId(ALL_ROLES);
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

  // Reset clears the WHOLE stage, not just the tile selection (Oleg's call
  // note, 2026-08-04): industry, type, role, the LLM toggle and the picked
  // tiles all go home in one click — the demo's "clean sheet" move.
  const handleReset = useCallback(() => {
    setIndustryId(DEFAULT_INDUSTRY);
    setTypeId(DEFAULT_TYPE);
    setSelectedIds([]);
    setRoleId(ALL_ROLES);
    setShowAiOnly(false);
  }, []);

  const compatibleIds = useMemo(
    () => getCompatible(set, selectedIds),
    [set, selectedIds]
  );

  /**
   * Body click — single-select swap (client call, 2026-08-03): picking a pair
   * is real but not frequent enough to own the whole tile, so clicking a tile
   * now selects exactly that tile wherever the selection stood before.
   * Clicking the sole selected tile clears it. Combinations are built from the
   * tile's top-right corner zone instead — see toggleCombo.
   */
  const selectSingle = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.length === 1 && prev[0] === id ? [] : [id]));
  }, []);

  /** Corner-zone click — the old multi-select toggle (max 3, compatibility). */
  const toggleCombo = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (showAiOnly) {
          // Single-select mode: clicking selected deselects, clicking another swaps
          return prev.includes(id) ? [] : [id];
        }
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

  // Anything off the default state makes Reset appear — the button doubles
  // as the "you have wandered" indicator, so it never shows on a clean sheet.
  const isDirty =
    hasSelection ||
    industryId !== DEFAULT_INDUSTRY ||
    typeId !== DEFAULT_TYPE ||
    roleId !== ALL_ROLES ||
    showAiOnly;

  // In LLM mode a selected dataset the toggle filters out gets the "why not
  // in LLMs" view instead of its content (client, 2026-08-04).
  const llmBlocked =
    showAiOnly &&
    selectedIds.length === 1 &&
    !set.aiChatIds.includes(selectedIds[0]);

  const roles = useMemo(() => getRolesForSet(set), [set]);
  const roleOptions = useMemo(
    () => [
      {
        id: ALL_ROLES,
        label: "All roles",
        hint: "Browse by dataset",
        icon: ROLE_META[ALL_ROLES].icon,
        accent: ROLE_META[ALL_ROLES].accent,
      },
      ...roles.map((r) => {
        const n = getRoleTasks(set, r).length;
        return {
          id: r,
          label: r,
          hint: `${n} task${n === 1 ? "" : "s"}`,
          icon: ROLE_META[r]?.icon,
          accent: ROLE_META[r]?.accent,
        };
      }),
    ],
    [set, roles]
  );
  // Lakes the picked role can actually work in — everything else dims while
  // nothing is selected, so the board doubles as the role's coverage map.
  const roleLakeIds = useMemo(
    () => (roleId === ALL_ROLES ? null : getRoleDatalakeIds(set, roleId)),
    [set, roleId]
  );

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
                  // invented for it. Roadmap industries have no types yet and
                  // say why they cannot be picked instead.
                  hint: i.disabled
                    ? "Coming soon"
                    : i.types.map((t) => t.label).join(" · "),
                  disabled: i.disabled,
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
              {roles.length > 0 && (
                <Select
                  label="Role"
                  options={roleOptions}
                  value={roleId}
                  onChange={setRoleId}
                  minWidth={150}
                />
              )}
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
                  aria-hidden={!isDirty}
                  tabIndex={isDirty ? 0 : -1}
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
                    opacity: isDirty ? 1 : 0,
                    transform: isDirty
                      ? "translateX(0)"
                      : "translateX(8px)",
                    transition: "opacity 0.2s ease, transform 0.2s ease",
                    pointerEvents: isDirty ? "auto" : "none",
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
                    Reset
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
                } else if (
                  roleLakeIds &&
                  !roleLakeIds.includes(datalake.id)
                ) {
                  // Role view, nothing selected: the board is the role's
                  // coverage map — lakes the role has no tasks in dim out.
                  isDisabled = true;
                }

                // No tile is dead any more (2026-08-04). In LLM mode a
                // filtered-out tile still takes the click — it selects, and
                // the panel explains WHY the dataset is unavailable there
                // instead of showing its content.
                // No Add affordance before the first pick (client, 2026-08-04:
                // "я не добавляю, я просто выбираю") — the corner only starts
                // meaning something once there is a selection to add to.
                // Remove needs TWO selected: excluding the only pick makes no
                // sense ("выбор-то один") — a body click already clears it.
                const comboMode = showAiOnly
                  ? "none"
                  : isSelected
                    ? selectedIds.length >= 2
                      ? "remove"
                      : "none"
                    : selectedIds.length > 0 &&
                        compatibleIds.includes(datalake.id)
                      ? "add"
                      : "none";

                return (
                  <DataCard
                    key={`${set.id}-${datalake.id}`}
                    source={datalake}
                    index={cardIndex++}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    isActive={isActive}
                    isDisabled={isDisabled}
                    onSelect={() => selectSingle(datalake.id)}
                    onToggleCombo={() => toggleCombo(datalake.id)}
                    comboMode={comboMode}
                    onMouseEnter={() => setHoveredCard(datalake.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  />
                );
              })
            )}
          </div>

          <InsightPanel
            selectedSignals={selectedDatalakes}
            description={description}
            llmBlocked={llmBlocked}
            roleId={roleId}
            set={set}
            setId={set.id}
            typeLabel={
              industry.types.find((t) => t.id === typeId)?.label ?? ""
            }
            onRunPrompt={(p) => openChat(p.text)}
          />
        </div>

        {/* ── The chat door — visible, but UNDER the board (Oleg,
            2026-08-04): controls scope the tiles, so nothing may wedge
            between them; below the grid the bar reads as a chat composer
            (the convention every messenger set), not as a search box that
            would pretend to filter tiles. Picked lakes still mirror in as
            context chips, the placeholder still rewrites itself. */}
        <AskBar
          selected={selectedDatalakes}
          industryLabel={industry.label}
          onAsk={openChat}
        />
      </div>

      {/* One chat channel for every entry point — bar, prompt rows. No
          backdrop on purpose: the board stays clickable and re-scopes the
          open chat live. */}
      <ChatDrawer
        open={chatOpen}
        context={selectedDatalakes}
        industryLabel={industry.label}
        seed={chatSeed}
        seedNonce={chatNonce}
        onClose={() => setChatOpen(false)}
      />

      <VersionSwitcher current="v2" />
    </main>
  );
}
