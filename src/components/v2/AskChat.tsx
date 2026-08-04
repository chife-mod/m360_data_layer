"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Datalake, DatalakePrompt } from "@/lib/v2/datalakes";

const FONT = "var(--font-inter), Inter, system-ui, sans-serif";

/**
 * The chat door — Oleg's health-check hypothesis (2026-08-04): "теоретически
 * мы могли бы дать человеку окно чата… но чтобы не было чёрного ящика".
 *
 * Two pieces, one channel:
 *   AskBar     — an always-visible composer ABOVE the board. Visible on
 *                purpose: a corner FAB is "стикер, приклеенный к углу — не
 *                видишь, как он реагирует на выбор". The bar reacts: picked
 *                lakes appear in it as context chips, the placeholder
 *                rewrites itself, so the board doubles as the chat's scope.
 *   ChatDrawer — the conversation, sliding in from the right the way the
 *                pharma prototype's assistant was meant to. No backdrop:
 *                the board stays clickable, and changing the selection
 *                re-scopes the open chat live.
 *
 * Honesty rule as everywhere: the prompt goes out, the answer stays a
 * shimmer — no invented AI output.
 */

/** The four-point spark the empty panel uses, sized for inline chrome. */
export function SparkIcon({ size = 18, opacity = 0.6 }: { size?: number; opacity?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={{ flexShrink: 0, opacity }}
      aria-hidden
    >
      <path
        d="M17.6667 7.66667C18.5336 7.437 19.379 7.13253 20.1933 6.75667C21.7117 6.02667 22.6833 5.065 23.4217 3.53667C23.7667 2.82333 24.0583 1.99 24.3333 1C24.6083 1.99167 24.9 2.825 25.245 3.535C25.9833 5.065 26.955 6.02667 28.4733 6.75667C29.1833 7.09833 30.015 7.39 31 7.66667C30.133 7.89687 29.2876 8.2019 28.4733 8.57833C26.955 9.30833 25.9833 10.27 25.245 11.7983C24.8657 12.6143 24.5606 13.4627 24.3333 14.3333C24.0583 13.3433 23.7667 12.5083 23.4217 11.7983C22.6833 10.2683 21.7117 9.30833 20.1933 8.57833C19.3801 8.19949 18.5345 7.89438 17.6667 7.66667ZM1 19.3333C1.9296 19.0758 2.84817 18.78 3.75333 18.4467C7.99 16.8583 10.175 14.7167 11.78 10.4367C12.1157 9.52667 12.4116 8.60246 12.6667 7.66667C12.9218 8.60246 13.2176 9.52667 13.5533 10.4367C15.1583 14.715 17.345 16.8583 21.58 18.4467C22.4133 18.7578 23.3311 19.0533 24.3333 19.3333C23.4037 19.5908 22.4852 19.8866 21.58 20.22C17.3433 21.8083 15.1567 23.95 13.5533 28.23C13.2176 29.14 12.9218 30.0642 12.6667 31C12.4116 30.0642 12.1157 29.14 11.78 28.23C10.175 23.95 7.98833 21.8083 3.75333 20.22C2.84817 19.8866 1.9296 19.5908 1 19.3333Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Picked lake as a context chip — colour dot + label, board-to-chat link. */
function ContextChip({ lake }: { lake: Datalake }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 26,
        padding: "0 9px",
        borderRadius: 7,
        backgroundColor: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        fontSize: 13,
        lineHeight: 1,
        color: "rgba(255,255,255,0.9)",
        whiteSpace: "nowrap",
        fontFamily: FONT,
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: lake.color,
          flexShrink: 0,
        }}
      />
      {lake.label}
    </span>
  );
}

export function AskBar({
  selected,
  industryLabel,
  onAsk,
}: {
  selected: Datalake[];
  industryLabel: string;
  onAsk: (question: string) => void;
}) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [sendHovered, setSendHovered] = useState(false);

  const placeholder =
    selected.length === 0
      ? `Ask across all ${industryLabel} lakes — trends, drivers, anomalies…`
      : `Ask about ${selected.map((s) => s.label).join(" + ")}…`;

  const submit = () => {
    onAsk(value.trim());
    setValue("");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: 52,
        padding: "0 10px 0 16px",
        borderRadius: 12,
        backgroundColor: "#070a28",
        border: `1px solid ${
          focused ? "rgba(159,169,255,0.7)" : "rgba(255,255,255,0.14)"
        }`,
        transition: "border-color 0.15s ease",
        fontFamily: FONT,
      }}
    >
      <SparkIcon />
      {/* The board's selection, mirrored — the visible proof that picking
          tiles scopes the chat. */}
      {selected.map((s) => (
        <ContextChip key={s.id} lake={s} />
      ))}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder={placeholder}
        aria-label="Ask the AI chat"
        style={{
          flex: "1 1 auto",
          minWidth: 60,
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 14,
          color: "rgba(255,255,255,0.92)",
          fontFamily: FONT,
        }}
      />
      <button
        type="button"
        onClick={submit}
        onMouseEnter={() => setSendHovered(true)}
        onMouseLeave={() => setSendHovered(false)}
        style={{
          height: 36,
          padding: "0 16px",
          borderRadius: 8,
          border: "1px solid transparent",
          backgroundColor: sendHovered ? "#ffffff" : "rgba(255,255,255,0.92)",
          color: "#0b0e2b",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          outline: "none",
          transition: "background-color 0.15s ease",
          fontFamily: FONT,
          flexShrink: 0,
        }}
      >
        Ask
      </button>
    </div>
  );
}

/** One asked question: the outgoing bubble plus the honest shimmer reply. */
function Exchange({ question }: { question: string }) {
  const shimmer: React.CSSProperties = {
    height: 12,
    borderRadius: 6,
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%)",
    backgroundSize: "400px 100%",
    animation: "m360-shimmer 1.4s linear infinite",
  };
  return (
    <>
      <div
        style={{
          alignSelf: "flex-end",
          maxWidth: "88%",
          padding: "10px 14px",
          borderRadius: "12px 12px 4px 12px",
          backgroundColor: "rgba(255,255,255,0.08)",
          fontSize: 14,
          lineHeight: 1.5,
          color: "rgba(255,255,255,0.92)",
        }}
      >
        {question}
      </div>
      <div
        style={{
          alignSelf: "flex-start",
          width: "88%",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "12px 14px",
          borderRadius: "12px 12px 12px 4px",
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.02)",
        }}
      >
        <span style={{ ...shimmer, width: "100%" }} />
        <span style={{ ...shimmer, width: "92%" }} />
        <span style={{ ...shimmer, width: "58%" }} />
      </div>
    </>
  );
}

export function ChatDrawer({
  open,
  context,
  industryLabel,
  seed,
  seedNonce,
  onClose,
}: {
  open: boolean;
  /** Live board selection — re-scopes the open chat as tiles are clicked. */
  context: Datalake[];
  industryLabel: string;
  /** Question to append when seedNonce changes; "" opens the drawer empty. */
  seed: string;
  seedNonce: number;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [thread, setThread] = useState<string[]>([]);
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  // Each Ask (bar, prompt row, or in-drawer composer) appends one exchange.
  useEffect(() => {
    if (seedNonce === 0) return;
    if (seed) setThread((t) => [...t, seed]);
  }, [seed, seedNonce]);

  // A closed drawer forgets the thread — every demo starts clean.
  useEffect(() => {
    if (!open) {
      setThread([]);
      setValue("");
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    // New exchange → keep the latest question in view.
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [thread.length]);

  const send = () => {
    const q = value.trim();
    if (!q) return;
    setThread((t) => [...t, q]);
    setValue("");
  };

  // Suggested openers: a single picked lake lends its own custom prompts;
  // otherwise two generic examples (my copy, BACKLOG §1.4).
  const suggestions: { id: string; text: string }[] =
    context.length === 1 && context[0].prompts
      ? context[0].prompts.map((p: DatalakePrompt) => ({ id: p.id, text: p.text }))
      : [
          { id: "gen-1", text: "What changed across these lakes this week?" },
          { id: "gen-2", text: "Who drives the most negative buzz this month?" },
        ];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-label="AI chat"
          initial={{ x: "105%" }}
          animate={{ x: 0 }}
          exit={{ x: "105%" }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "min(440px, 92vw)",
            zIndex: 250,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#111539",
            borderLeft: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "-24px 0 64px rgba(0,0,0,0.5)",
            fontFamily: FONT,
          }}
        >
          <style>{`@keyframes m360-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "18px 20px 14px 22px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          >
            <SparkIcon size={16} opacity={0.7} />
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#ffffff",
                flex: "1 1 auto",
              }}
            >
              AI chat
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
                outline: "none",
              }}
            >
              ×
            </button>
          </div>

          {/* Scope line — live: clicking tiles while the drawer is open
              updates it, which is the whole board-equals-scope story. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 6,
              padding: "12px 22px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                marginRight: 4,
              }}
            >
              Scope
            </span>
            {context.length === 0 ? (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                All {industryLabel} lakes
              </span>
            ) : (
              context.map((s) => <ContextChip key={s.id} lake={s} />)
            )}
          </div>

          {/* Thread */}
          <div
            ref={scrollRef}
            className="m360-scroll"
            style={{
              flex: "1 1 auto",
              minHeight: 0,
              overflowY: "auto",
              padding: "18px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {thread.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  Ask anything the selected lakes can answer — or start from
                  one of these:
                </span>
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setThread((t) => [...t, s.text])}
                    style={{
                      textAlign: "left",
                      padding: "9px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "rgba(255,255,255,0.02)",
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 13.5,
                      lineHeight: 1.4,
                      cursor: "pointer",
                      outline: "none",
                      fontFamily: FONT,
                    }}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            ) : (
              thread.map((q, i) => <Exchange key={i} question={q} />)
            )}

            {thread.length > 0 && (
              <span
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                The assistant answers here from the selected lakes&apos; data —
                wired to the live AI chat in M360.
              </span>
            )}
          </div>

          {/* Composer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 20px 16px 22px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Ask a follow-up…"
              aria-label="Ask a follow-up"
              style={{
                flex: "1 1 auto",
                height: 38,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "#070a28",
                outline: "none",
                fontSize: 14,
                color: "rgba(255,255,255,0.92)",
                fontFamily: FONT,
              }}
            />
            <button
              type="button"
              onClick={send}
              aria-label="Send"
              style={{
                height: 38,
                padding: "0 14px",
                borderRadius: 8,
                border: "1px solid transparent",
                backgroundColor: "rgba(255,255,255,0.92)",
                color: "#0b0e2b",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                outline: "none",
                fontFamily: FONT,
                flexShrink: 0,
              }}
            >
              Send
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>,
    document.body
  );
}
