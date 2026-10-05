"use client";

import { motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

type Props = ComponentProps<typeof motion.button> & {
  children: ReactNode;
  variant?: "primary" | "sun" | "ghost";
};

export function GameButton({ children, variant = "primary", className = "", ...props }: Props) {
  const styles = {
    primary: "bg-[#7357ff] text-white shadow-[0_7px_0_#4e39c9]",
    sun: "bg-[#ffd84d] text-[#2c2942] shadow-[0_7px_0_#e2af28]",
    ghost: "bg-white/85 text-[#24304a] shadow-[0_6px_0_rgba(21,33,59,.1)] border border-white",
  }[variant];

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.015 }}
      whileTap={{ y: 5, scale: 0.985 }}
      className={`min-h-12 rounded-2xl px-5 py-3 font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
