"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  scale?: boolean;
};

export default function FadeIn({
  children,
  delay = 0,
  className = "",
  scale = false,
}: FadeInProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        ...(scale ? { scale: 0.92 } : { y: 36 }),
      }}
      whileInView={{
        opacity: 1,
        ...(scale ? { scale: 1 } : { y: 0 }),
      }}
      transition={{ duration: 1, ease: "easeOut", delay }}
      viewport={{ once: true, amount: 0.12 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
