"use client";

import * as React from "react";
import { motion } from "framer-motion";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export function LiquidButton({
  children,
  className,
  ...props
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-full px-6 py-3 font-semibold",
        "border border-white/30 backdrop-blur-sm",
        "bg-[var(--liquid-button-background-color,rgba(0,0,0,0.75))]",
        "inline-flex items-center justify-center gap-2",
        "transition-colors duration-500",
        hovered ? "text-gray-100" : "text-white",
        className
      )}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      {/* السائل المتدرج: خط من اليمين → يصعد → يملأ */}
      <motion.div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 z-0 rounded-full"
        style={{
       
            
          backgroundSize: "200% 100%",
          transformOrigin: "right bottom",
          boxShadow: hovered
            ? "0 0 24px rgba(250, 204, 21, 0.55), 0 0 48px rgba(250, 204, 21, 0.25), inset 10px 10px 30px rgba(250, 204, 21, 0.25)"
            : "none",
        }}
        initial={false}
        animate={
          hovered
            ? {
                scaleX: 1,
                height: "100%",
                backgroundPosition: ["0% 50%", "100% 50%"],
              }
            : {
                scaleX: 0,
                height: "2px",
                backgroundPosition: "0% 50%",
              }
        }
        transition={{
          scaleX: {
            duration: 0.3,
            ease: "easeOut",
            delay: hovered ? 0 : 0.4,
          },
          height: {
            duration: 0.4,
            ease: "easeOut",
            delay: hovered ? 0.3 : 0,
          },
          backgroundPosition: {
            duration: 2.5,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse",
          },
          boxShadow: { duration: 0.5 },
        }}
      />

      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}