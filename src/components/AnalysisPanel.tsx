"use client";

import { useState } from "react";

interface IrabItem {
  word: string;
  irab: string;
}

interface SarfItem {
  word: string;
  root: string;
  wazn: string;
  type: string;
  details: string;
}

interface BalaghaItem {
  device: string;
  explanation: string;
}

interface VocabItem {
  word: string;
  meaning: string;
}

export interface Analysis {
  meaning: string;
  irab: IrabItem[];
  sarf: SarfItem[];
  balagha: BalaghaItem[];
  context: string;
  vocabulary: VocabItem[];
}

interface AnalysisPanelProps {
  analysis: Analysis | null;
  loading: boolean;
  error: string | null;
  sentence: string;
}

type TabKey = "meaning" | "irab" | "sarf" | "balagha" | "context" | "vocabulary";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "meaning", label: "المعنى", icon: "📖" },
  { key: "irab", label: "الإعراب", icon: "✏️" },
  { key: "sarf", label: "الصرف", icon: "🔤" },
  { key: "balagha", label: "البلاغة", icon: "🎨" },
  { key: "vocabulary", label: "المفردات", icon: "📚" },
  { key: "context", label: "السياق", icon: "🔗" },
];

export default function AnalysisPanel({
  analysis,
  loading,
  error,
  sentence,
}: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("meaning");

  if (!sentence) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--color-ink-light)]/60">
        <div className="text-center space-y-4">
          <div className="text-6xl">☝️</div>
          <p className="text-xl">اختر جملة من القائمة لتحليلها</p>
          <p className="text-sm opacity-60">
            سيتم تحليل الجملة نحوياً وصرفياً وبلاغياً
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-2">
        <div className="bg-[var(--color-gold)]/10 rounded-xl p-6 border border-[var(--color-gold)]/30">
          <p className="text-lg leading-loose text-center font-bold">
            {sentence}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="w-3 h-3 bg-[var(--color-gold)] rounded-full animate-bounce" />
          <div
            className="w-3 h-3 bg-[var(--color-gold)] rounded-full animate-bounce"
            style={{ animationDelay: "0.15s" }}
          />
          <div
            className="w-3 h-3 bg-[var(--color-gold)] rounded-full animate-bounce"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
        <p className="text-center text-[var(--color-ink-light)]/60">
          جارٍ التحليل بالذكاء الاصطناعي...
        </p>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <p className="text-red-600 font-bold">{error}</p>
          <p className="text-sm text-[var(--color-ink-light)]/60">
            حاول مرة أخرى
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Selected sentence */}
      <div className="bg-[var(--color-gold)]/10 rounded-xl p-5 border border-[var(--color-gold)]/30">
        <p className="text-xl leading-loose text-center font-bold text-[var(--color-ink)]">
          {sentence}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer
              ${
                activeTab === tab.key
                  ? "bg-[var(--color-gold)] text-white shadow-md"
                  : "bg-white/80 text-[var(--color-ink-light)] hover:bg-[var(--color-gold-light)] hover:text-white"
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white/80 rounded-xl p-5 border border-[var(--color-parchment-dark)] min-h-[300px] animate-slide-in">
        {activeTab === "meaning" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-gold-dark)] border-b border-[var(--color-gold)]/30 pb-2">
              📖 شرح المعنى
            </h3>
            <p className="text-lg leading-relaxed">{analysis.meaning}</p>
          </div>
        )}

        {activeTab === "irab" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-gold-dark)] border-b border-[var(--color-gold)]/30 pb-2">
              ✏️ الإعراب التفصيلي
            </h3>
            <div className="space-y-3">
              {analysis.irab?.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-start p-3 rounded-lg bg-[var(--color-parchment)]/80 animate-slide-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="font-bold text-[var(--color-accent)] text-lg min-w-[80px]">
                    {item.word}
                  </span>
                  <span className="text-[var(--color-ink-light)] leading-relaxed">
                    {item.irab}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "sarf" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-gold-dark)] border-b border-[var(--color-gold)]/30 pb-2">
              🔤 التحليل الصرفي
            </h3>
            <div className="space-y-3">
              {analysis.sarf?.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-[var(--color-parchment)]/80 animate-slide-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex flex-wrap gap-4 items-center mb-2">
                    <span className="font-bold text-[var(--color-accent)] text-lg">
                      {item.word}
                    </span>
                    <span className="bg-[var(--color-gold)]/20 text-[var(--color-gold-dark)] px-3 py-1 rounded-full text-sm font-bold">
                      {item.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[var(--color-ink-light)]/60">
                        الجذر:{" "}
                      </span>
                      <span className="font-bold">{item.root}</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-ink-light)]/60">
                        الوزن:{" "}
                      </span>
                      <span className="font-bold">{item.wazn}</span>
                    </div>
                  </div>
                  {item.details && (
                    <p className="text-sm mt-2 text-[var(--color-ink-light)]">
                      {item.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "balagha" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-gold-dark)] border-b border-[var(--color-gold)]/30 pb-2">
              🎨 التحليل البلاغي
            </h3>
            {analysis.balagha?.length > 0 ? (
              <div className="space-y-3">
                {analysis.balagha.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-[var(--color-parchment)]/80 border-r-4 border-[var(--color-gold)] animate-slide-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <p className="font-bold text-[var(--color-accent)] mb-1">
                      {item.device}
                    </p>
                    <p className="text-[var(--color-ink-light)] leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--color-ink-light)]/60">
                لا توجد أساليب بلاغية بارزة في هذه الجملة
              </p>
            )}
          </div>
        )}

        {activeTab === "vocabulary" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-gold-dark)] border-b border-[var(--color-gold)]/30 pb-2">
              📚 المفردات
            </h3>
            {analysis.vocabulary?.length > 0 ? (
              <div className="space-y-2">
                {analysis.vocabulary.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-center p-3 rounded-lg bg-[var(--color-parchment)]/80 animate-slide-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <span className="font-bold text-[var(--color-accent)] text-lg min-w-[100px]">
                      {item.word}
                    </span>
                    <span className="text-[var(--color-ink-light)]">
                      {item.meaning}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--color-ink-light)]/60">
                لا توجد مفردات صعبة في هذه الجملة
              </p>
            )}
          </div>
        )}

        {activeTab === "context" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-gold-dark)] border-b border-[var(--color-gold)]/30 pb-2">
              🔗 السياق القصصي
            </h3>
            <p className="text-lg leading-relaxed">{analysis.context}</p>
          </div>
        )}
      </div>
    </div>
  );
}
