"use client";

import { Sentence } from "@/data/books";

interface SentenceCardProps {
  sentence: Sentence;
  isActive: boolean;
  onClick: () => void;
  accentColor?: string;
}

export default function SentenceCard({
  sentence,
  isActive,
  onClick,
  accentColor = "#c8a84e",
}: SentenceCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-right p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group
        ${
          isActive
            ? "bg-white shadow-lg"
            : "border-transparent bg-white/60 hover:bg-white hover:shadow-md"
        }`}
      style={
        isActive
          ? {
              borderColor: accentColor,
              boxShadow: `0 4px 20px ${accentColor}33`,
            }
          : undefined
      }
    >
      <div className="flex items-start gap-3">
        <span
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
          style={
            isActive
              ? { backgroundColor: accentColor, color: "white" }
              : undefined
          }
        >
          {!isActive && (
            <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-parchment-dark)] text-[var(--color-ink-light)] group-hover:text-white"
              style={{ ...(isActive ? {} : {}) }}
            >
              {sentence.id}
            </span>
          )}
          {isActive && sentence.id}
        </span>
        <p
          className={`text-lg leading-loose flex-1 ${
            isActive
              ? "text-[var(--color-ink)] font-bold"
              : "text-[var(--color-ink-light)]"
          }`}
        >
          {sentence.text}
        </p>
      </div>
    </button>
  );
}
