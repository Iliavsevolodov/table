import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.name,
    description: "Игровое приключение для изучения умножения и деления",
    start_url: "/game",
    display: "standalone",
    background_color: "#fff9ec",
    theme_color: "#7357ff",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
