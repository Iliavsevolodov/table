import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { BRAND } from "@/lib/config/brand";
import { PwaRegister } from "@/components/pwa/pwa-register";

export const metadata: Metadata = {
  title: `${BRAND.name} — математическое приключение`,
  description: "Игровое адаптивное обучение таблице умножения и деления для детей 8–10 лет.",
  applicationName: BRAND.name,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7357ff",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body><PwaRegister />{children}</body>
    </html>
  );
}
