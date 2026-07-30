"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * `/v2` moved to the root — the working version is no longer "version two of
 * something", it is the data layer.
 *
 * This stub stays because the /v2 link was shared around all day; without it
 * every one of those links would 404. It redirects, and still says where it
 * went for anyone who lands here with JavaScript off.
 */
export default function V2Moved() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#111539",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 16, color: "rgba(255,255,255,0.85)" }}>
          This page moved
        </span>
        <Link
          href="/"
          style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}
        >
          Open the data layer →
        </Link>
      </div>
    </main>
  );
}
