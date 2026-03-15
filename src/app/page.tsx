"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getMaqama } from "@/data/maqamat";
import MaqamaSelector from "@/components/MaqamaSelector";
import SentenceCard from "@/components/SentenceCard";
import AnalysisPanel, { Analysis } from "@/components/AnalysisPanel";

export default function Home() {
  const [selectedMaqama, setSelectedMaqama] = useState(1);
  const [selectedSentence, setSelectedSentence] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Record<string, Analysis>>({});

  const maqama = getMaqama(selectedMaqama);

  const analyzeSentence = useCallback(
    async (sentenceId: number) => {
      if (!maqama) return;
      const sentence = maqama.sentences.find((s) => s.id === sentenceId);
      if (!sentence) return;

      setSelectedSentence(sentenceId);
      setError(null);

      // Check cache
      const cacheKey = `${selectedMaqama}-${sentenceId}`;
      if (cacheRef.current[cacheKey]) {
        setAnalysis(cacheRef.current[cacheKey]);
        return;
      }

      setLoading(true);
      setAnalysis(null);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sentence: sentence.text,
            maqamaTitle: maqama.title,
            sentenceIndex: sentenceId,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "خطأ في التحليل");
        }

        const data = await res.json();
        cacheRef.current[cacheKey] = data;
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "حدث خطأ");
      } finally {
        setLoading(false);
      }
    },
    [maqama, selectedMaqama]
  );

  // Scroll analysis panel into view on mobile
  useEffect(() => {
    if ((analysis || loading) && analysisRef.current) {
      if (window.innerWidth < 1024) {
        analysisRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [analysis, loading]);

  const currentSentence =
    maqama?.sentences.find((s) => s.id === selectedSentence)?.text || "";

  const goToPrev = () => {
    if (!maqama || !selectedSentence) return;
    const idx = maqama.sentences.findIndex((s) => s.id === selectedSentence);
    if (idx > 0) analyzeSentence(maqama.sentences[idx - 1].id);
  };

  const goToNext = () => {
    if (!maqama || !selectedSentence) return;
    const idx = maqama.sentences.findIndex((s) => s.id === selectedSentence);
    if (idx < maqama.sentences.length - 1)
      analyzeSentence(maqama.sentences[idx + 1].id);
  };

  return (
    <div className="relative min-h-screen z-10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--color-ink)]/95 backdrop-blur-sm text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden text-2xl cursor-pointer hover:text-[var(--color-gold)] transition-colors"
            >
              ☰
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-gold)]">
                مقامات الحريري
              </h1>
              <p className="text-sm text-white/60">
                شرح تفصيلي — إعراب · صرف · بلاغة
              </p>
            </div>
          </div>
          {maqama && (
            <div className="text-left">
              <p className="text-sm text-[var(--color-gold-light)]">
                {maqama.subtitle}
              </p>
              <p className="font-bold">{maqama.title}</p>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-0 lg:gap-6 p-4">
        {/* Sidebar — maqama list */}
        <aside
          className={`fixed lg:static inset-0 z-40 lg:z-auto transition-transform duration-300
            ${showSidebar ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
            lg:w-64 lg:flex-shrink-0`}
        >
          {/* Mobile overlay */}
          {showSidebar && (
            <div
              className="fixed inset-0 bg-black/50 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}
          <div className="relative z-10 h-full lg:h-auto w-72 lg:w-full mr-auto bg-[var(--color-parchment)] lg:bg-transparent p-4 lg:p-0 overflow-y-auto">
            <div className="lg:hidden flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[var(--color-gold-dark)]">
                فهرس المقامات
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-2xl cursor-pointer"
              >
                ✕
              </button>
            </div>
            <MaqamaSelector
              selected={selectedMaqama}
              onSelect={(id) => {
                setSelectedMaqama(id);
                setSelectedSentence(null);
                setAnalysis(null);
                setError(null);
                setShowSidebar(false);
              }}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentences list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-[var(--color-gold-dark)]">
                  نص المقامة
                </h2>
                {maqama && (
                  <span className="text-sm text-[var(--color-ink-light)]/60">
                    {maqama.sentences.length} جملة
                  </span>
                )}
              </div>

              {maqama && maqama.sentences.length > 0 ? (
                <div className="space-y-2 max-h-[75vh] overflow-y-auto pl-2">
                  {maqama.sentences.map((sentence) => (
                    <SentenceCard
                      key={sentence.id}
                      sentence={sentence}
                      isActive={selectedSentence === sentence.id}
                      onClick={() => analyzeSentence(sentence.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-[var(--color-ink-light)]/50">
                  <div className="text-5xl mb-4">🚧</div>
                  <p className="text-lg">هذه المقامة قيد الإعداد</p>
                  <p className="text-sm mt-2">ستكون متاحة قريباً إن شاء الله</p>
                </div>
              )}
            </div>

            {/* Analysis panel */}
            <div ref={analysisRef} className="lg:sticky lg:top-24 lg:self-start">
              <div className="bg-[var(--color-parchment-dark)]/50 rounded-2xl p-5 border border-[var(--color-gold)]/20 min-h-[400px]">
                {/* Nav arrows */}
                {selectedSentence && maqama && (
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={goToNext}
                      disabled={
                        !maqama.sentences.length ||
                        selectedSentence === maqama.sentences[maqama.sentences.length - 1].id
                      }
                      className="px-3 py-1 rounded-lg bg-[var(--color-gold)]/20 text-[var(--color-gold-dark)] hover:bg-[var(--color-gold)]/40 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all text-sm"
                    >
                      التالية ←
                    </button>
                    <span className="text-sm text-[var(--color-ink-light)]/60">
                      {selectedSentence} / {maqama.sentences.length}
                    </span>
                    <button
                      onClick={goToPrev}
                      disabled={
                        !maqama.sentences.length ||
                        selectedSentence === maqama.sentences[0].id
                      }
                      className="px-3 py-1 rounded-lg bg-[var(--color-gold)]/20 text-[var(--color-gold-dark)] hover:bg-[var(--color-gold)]/40 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all text-sm"
                    >
                      → السابقة
                    </button>
                  </div>
                )}

                <AnalysisPanel
                  analysis={analysis}
                  loading={loading}
                  error={error}
                  sentence={currentSentence}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-[var(--color-ink-light)]/50 border-t border-[var(--color-parchment-dark)]">
        <p>مقامات الحريري — شرح بالذكاء الاصطناعي</p>
        <p className="mt-1">أبو محمد القاسم بن علي الحريري (٤٤٦–٥١٦ هـ)</p>
      </footer>
    </div>
  );
}
