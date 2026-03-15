"use client";

import { maqamat, Maqama } from "@/data/maqamat";

interface MaqamaSelectorProps {
  selected: number;
  onSelect: (id: number) => void;
}

export default function MaqamaSelector({
  selected,
  onSelect,
}: MaqamaSelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-[var(--color-gold-dark)]">
        فهرس المقامات
      </h2>
      <div className="max-h-[70vh] overflow-y-auto space-y-1 pl-2">
        {maqamat.map((m: Maqama) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            disabled={m.sentences.length === 0}
            className={`w-full text-right px-4 py-3 rounded-lg transition-all text-sm cursor-pointer
              ${
                selected === m.id
                  ? "bg-[var(--color-gold)] text-white font-bold shadow-md"
                  : m.sentences.length > 0
                  ? "bg-white/60 hover:bg-white hover:shadow-sm text-[var(--color-ink)]"
                  : "bg-white/30 text-[var(--color-ink-light)]/40 cursor-not-allowed"
              }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0
                ${
                  selected === m.id
                    ? "bg-white/30 text-white"
                    : "bg-[var(--color-parchment-dark)] text-[var(--color-ink-light)]"
                }`}
              >
                {m.id}
              </span>
              <span className="flex-1">{m.title}</span>
              {m.sentences.length === 0 && (
                <span className="text-xs opacity-50">قريباً</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
