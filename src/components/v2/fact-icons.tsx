/**
 * Glyphs for the lake facts — archive depth, zero-day indexing, explorer.
 * Shared between the panel's passport strip (with labels and tooltips) and
 * the tiles' micro-marks (glyphs only), so both surfaces speak one language.
 * Tabler geometry in a 24-unit box, stroked with currentColor.
 */

export const ICON_DATABASE = (
  <>
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v6a8 3 0 0 0 16 0V6" />
    <path d="M4 12v6a8 3 0 0 0 16 0v-6" />
  </>
);

export const ICON_SKIP_BACK = (
  <>
    <path d="M4 5v14" />
    <path d="M20 5v14l-12 -7z" />
  </>
);

export const ICON_COMPASS = (
  <>
    <path d="M8 16l2 -6l6 -2l-2 6z" />
    <circle cx="12" cy="12" r="9" />
  </>
);

/** Fixed-size stroked glyph — the wrapper both surfaces render icons with. */
export function FactGlyph({
  size = 15,
  children,
  style,
}: {
  size?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      aria-hidden
    >
      {children}
    </svg>
  );
}
