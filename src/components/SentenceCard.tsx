"use client";

import { Sentence } from "@/data/maqamat";

interface SentenceCardProps {
  sentence: Sentence;
  isActive: boolean;
  onClick: () => void;
}

export default function SentenceCard({
  sentence,
  isActive,
  onClick,
}: SentenceCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-right p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group
        ${
          isActive
            ? "border-[var(--color-gold)] bg-[var(--color-gold)]/10 shadow-lg shadow-[var(--color-gold)]/20 pulse-gold"
            : "border-transparent bg-white/60 hover:bg-white hover:border-[var(--color-gold-light)] hover:shadow-md"
        }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${
            isActive
              ? "bg-[var(--color-gold)] text-white"
              : "bg-[var(--color-parchment-dark)] text-[var(--color-ink-light)] group-hover:bg-[var(--color-gold-light)] group-hover:text-white"
          }`}
        >
          {sentence.id}
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
