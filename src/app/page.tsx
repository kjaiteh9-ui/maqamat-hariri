import Link from "next/link";
import { books, getBookTypeLabel } from "@/data/books";

export default function Home() {
  return (
    <div className="relative min-h-screen z-10">
      {/* Header */}
      <header className="bg-[var(--color-ink)]/95 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold text-[var(--color-gold)] mb-3">
            المكتبة العربية
          </h1>
          <p className="text-lg text-white/70">
            شرح تفصيلي جملة بجملة — إعراب · صرف · بلاغة · معنى
          </p>
          <p className="text-sm text-white/40 mt-2">
            بالذكاء الاصطناعي
          </p>
        </div>
      </header>

      {/* Books Grid */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const totalSentences = book.chapters.reduce(
              (sum, ch) => sum + ch.sentences.length,
              0
            );
            const availableChapters = book.chapters.filter(
              (ch) => ch.sentences.length > 0
            ).length;

            return (
              <Link
                key={book.id}
                href={`/book/${book.id}`}
                className="group block bg-white/80 rounded-2xl border-2 border-transparent hover:border-[var(--color-gold)] transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-gold)]/10 overflow-hidden"
              >
                {/* Color bar */}
                <div
                  className="h-2"
                  style={{ backgroundColor: book.color }}
                />

                <div className="p-6">
                  {/* Icon & Type */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{book.icon}</span>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: book.color }}
                    >
                      {getBookTypeLabel(book.type)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-2 group-hover:text-[var(--color-gold-dark)] transition-colors">
                    {book.title}
                  </h2>

                  {/* Author */}
                  <p className="text-sm text-[var(--color-accent)] mb-3">
                    {book.author}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-[var(--color-ink-light)]/70 leading-relaxed mb-4">
                    {book.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-[var(--color-ink-light)]/50 border-t border-[var(--color-parchment-dark)] pt-3">
                    <span>{book.chapters.length} فصل</span>
                    {totalSentences > 0 && (
                      <span>{totalSentences} جملة</span>
                    )}
                    {availableChapters > 0 ? (
                      <span className="mr-auto text-green-700 font-bold">
                        متاح
                      </span>
                    ) : (
                      <span className="mr-auto text-[var(--color-ink-light)]/40">
                        قريباً
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-6 text-center text-sm text-[var(--color-ink-light)]/50 border-t border-[var(--color-parchment-dark)]">
        <p>المكتبة العربية — شرح بالذكاء الاصطناعي</p>
      </footer>
    </div>
  );
}
