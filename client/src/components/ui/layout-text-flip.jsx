"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const LayoutTextFlip = ({
  text = "",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <motion.span
      
        layoutId="subtext"
        className="text-1xl font-bold drop-shadow-lg md:text-2xl ">
        {text}
      </motion.span>
      <motion.span
        layout
        
        className="relative overflow-hidden rounded-l-full text-white md:px-8 mx-1 md:p-1.5 border mt-3 sm:mt-0 p-4 sm:px-20 bg-linear-to-r  to-yellow-400 from-orange-800 dark:from-indigo-700 dark:to-purple-800 font-bold tracking-tight  shadow-lg ring shadow-black/10 ring-black/10 drop-shadow-lg md:text-1xl dark:bg-neutral-900 dark:text-white dark:shadow-sm dark:ring-1 dark:shadow-white/10 dark:ring-white/10">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={currentIndex}
            initial={{ y: -40, filter: "blur(20px)" }}
            animate={{
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{ y: 50, filter: "blur(20px)", opacity: 0 }}
            transition={{
              duration: 0.2,
            }}
            className={cn("inline-block whitespace-nowrap ")}>
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
};
