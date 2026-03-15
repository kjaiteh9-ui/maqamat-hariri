"use client";

import { useState, useCallback, useRef, useEffect, use } from "react";
import Link from "next/link";
import { getBook } from "@/data/books";
import SentenceCard from "@/components/SentenceCard";
import AnalysisPanel, { Analysis } from "@/components/AnalysisPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BookPage({ params }: PageProps) {
  const { id } = use(params);
  const book = getBook(id);

  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedSentence, setSelectedSentence] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Record<string, Analysis>>({});

  // Find first chapter with content
  useEffect(() => {
    if (book) {
      const firstAvailable = book.chapters.findIndex(
        (ch) => ch.sentences.length > 0
      );
      if (firstAvailable >= 0) setSelectedChapter(firstAvailable);
    }
  }, [book]);

  const chapter = book?.chapters[selectedChapter];

  const analyzeSentence = useCallback(
    async (sentenceId: number) => {
      if (!book || !chapter) return;
      const sentence = chapter.sentences.find((s) => s.id === sentenceId);
      if (!sentence) return;

      setSelectedSentence(sentenceId);
      setError(null);

      const cacheKey = `${book.id}-${selectedChapter}-${sentenceId}`;
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
            bookTitle: book.title,
            bookType: book.type,
            chapterTitle: chapter.title,
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
    [book, chapter, selectedChapter]
  );

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

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center z-10 relative">
        <div className="text-center space-y-4">
          <div className="text-6xl">📚</div>
          <p className="text-xl">الكتاب غير موجود</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-[var(--color-gold)] text-white rounded-lg"
          >
            العودة للمكتبة
          </Link>
        </div>
      </div>
    );
  }

  const currentSentence =
    chapter?.sentences.find((s) => s.id === selectedSentence)?.text || "";

  const goToPrev = () => {
    if (!chapter || !selectedSentence) return;
    const idx = chapter.sentences.findIndex((s) => s.id === selectedSentence);
    if (idx > 0) analyzeSentence(chapter.sentences[idx - 1].id);
  };

  const goToNext = () => {
    if (!chapter || !selectedSentence) return;
    const idx = chapter.sentences.findIndex((s) => s.id === selectedSentence);
    if (idx < chapter.sentences.length - 1)
      analyzeSentence(chapter.sentences[idx + 1].id);
  };

  return (
    <div className="relative min-h-screen z-10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--color-ink)]/95 backdrop-blur-sm text-white shadow-lg">
        <div
          className="h-1"
          style={{ backgroundColor: book.color }}
        />
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xl hover:text-[var(--color-gold)] transition-colors"
            >
              →
            </Link>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden text-2xl cursor-pointer hover:text-[var(--color-gold)] transition-colors"
            >
              ☰
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: book.color }}>
                {book.icon} {book.title}
              </h1>
              <p className="text-xs text-white/50">{book.author}</p>
            </div>
          </div>
          {chapter && (
            <div className="text-left hidden sm:block">
              <p className="text-sm" style={{ color: book.color }}>
                {chapter.title}
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-0 lg:gap-6 p-4">
        {/* Sidebar — chapter list */}
        <aside
          className={`fixed lg:static inset-0 z-40 lg:z-auto transition-transform duration-300
            ${showSidebar ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
            lg:w-64 lg:flex-shrink-0`}
        >
          {showSidebar && (
            <div
              className="fixed inset-0 bg-black/50 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
          )}
          <div className="relative z-10 h-full lg:h-auto w-72 lg:w-full mr-auto bg-[var(--color-parchment)] lg:bg-transparent p-4 lg:p-0 overflow-y-auto">
            <div className="lg:hidden flex justify-between items-center mb-4">
              <h2
                className="text-lg font-bold"
                style={{ color: book.color }}
              >
                الفهرس
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-2xl cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <h2
                className="text-lg font-bold hidden lg:block"
                style={{ color: book.color }}
              >
                الفهرس
              </h2>
              <div className="max-h-[70vh] overflow-y-auto space-y-1 pl-2">
                {book.chapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setSelectedChapter(idx);
                      setSelectedSentence(null);
                      setAnalysis(null);
                      setError(null);
                      setShowSidebar(false);
                    }}
                    disabled={ch.sentences.length === 0}
                    className={`w-full text-right px-4 py-3 rounded-lg transition-all text-sm cursor-pointer
                      ${
                        selectedChapter === idx
                          ? "text-white font-bold shadow-md"
                          : ch.sentences.length > 0
                          ? "bg-white/60 hover:bg-white hover:shadow-sm text-[var(--color-ink)]"
                          : "bg-white/30 text-[var(--color-ink-light)]/40 cursor-not-allowed"
                      }`}
                    style={
                      selectedChapter === idx
                        ? { backgroundColor: book.color }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0
                          ${
                            selectedChapter === idx
                              ? "bg-white/30 text-white"
                              : "bg-[var(--color-parchment-dark)] text-[var(--color-ink-light)]"
                          }`}
                      >
                        {ch.id}
                      </span>
                      <span className="flex-1">{ch.title}</span>
                      {ch.sentences.length === 0 && (
                        <span className="text-xs opacity-50">قريباً</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentences list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2
                  className="text-lg font-bold"
                  style={{ color: book.color }}
                >
                  {chapter?.title || "اختر فصلاً"}
                </h2>
                {chapter && chapter.sentences.length > 0 && (
                  <span className="text-sm text-[var(--color-ink-light)]/60">
                    {chapter.sentences.length} جملة
                  </span>
                )}
              </div>

              {chapter && chapter.sentences.length > 0 ? (
                <div className="space-y-2 max-h-[75vh] overflow-y-auto pl-2">
                  {chapter.sentences.map((sentence) => (
                    <SentenceCard
                      key={sentence.id}
                      sentence={sentence}
                      isActive={selectedSentence === sentence.id}
                      onClick={() => analyzeSentence(sentence.id)}
                      accentColor={book.color}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-[var(--color-ink-light)]/50">
                  <div className="text-5xl mb-4">🚧</div>
                  <p className="text-lg">هذا الفصل قيد الإعداد</p>
                  <p className="text-sm mt-2">
                    ستكون المادة متاحة قريباً إن شاء الله
                  </p>
                </div>
              )}
            </div>

            {/* Analysis panel */}
            <div ref={analysisRef} className="lg:sticky lg:top-20 lg:self-start">
              <div className="bg-[var(--color-parchment-dark)]/50 rounded-2xl p-5 border border-[var(--color-gold)]/20 min-h-[400px]">
                {selectedSentence && chapter && (
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={goToNext}
                      disabled={
                        !chapter.sentences.length ||
                        selectedSentence ===
                          chapter.sentences[chapter.sentences.length - 1].id
                      }
                      className="px-3 py-1 rounded-lg text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      style={{
                        backgroundColor: `${book.color}33`,
                        color: book.color,
                      }}
                    >
                      التالية ←
                    </button>
                    <span className="text-sm text-[var(--color-ink-light)]/60">
                      {selectedSentence} / {chapter.sentences.length}
                    </span>
                    <button
                      onClick={goToPrev}
                      disabled={
                        !chapter.sentences.length ||
                        selectedSentence === chapter.sentences[0].id
                      }
                      className="px-3 py-1 rounded-lg text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      style={{
                        backgroundColor: `${book.color}33`,
                        color: book.color,
                      }}
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
                  accentColor={book.color}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-[var(--color-ink-light)]/50 border-t border-[var(--color-parchment-dark)]">
        <p>المكتبة العربية — شرح بالذكاء الاصطناعي</p>
      </footer>
    </div>
  );
}
