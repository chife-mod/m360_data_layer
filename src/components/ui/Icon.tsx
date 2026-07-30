"use client";

import { useEffect, useState } from "react";
import { fetchSvgAsset } from "@/lib/utils";

type IconProps = {
  name: string;
  size?: number;
  className?: string;
  color?: string;
};

export function Icon({ name, size = 22, className = "", color }: IconProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    fetchSvgAsset(`/assets/icons/${name}.svg`).then((text) => {
      if (!live) return;
      setSvgContent(text);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [name]);

  if (loading) {
    return (
      <div
        className={`inline-block ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (!svgContent) {
    return null;
  }

  // Извлекаем только SVG содержимое без внешних тегов
  const svgMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!svgMatch) {
    return null;
  }

  // Находим иконку внутри SVG (обычно это группа с opacity="0.4" или path)
  // Для начала просто используем весь SVG, но с правильным размером
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{
        __html: svgContent
          .replace(/width="[^"]*"/, `width="${size}"`)
          .replace(/height="[^"]*"/, `height="${size}"`)
          .replace(/viewBox="[^"]*"/, 'viewBox="0 0 189 131"'),
      }}
    />
  );
}
