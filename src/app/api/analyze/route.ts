import { NextRequest, NextResponse } from "next/server";
import { BookType } from "@/data/books";

function getSystemPrompt(bookType: BookType, bookTitle: string): string {
  const base = `أنت عالم لغوي متخصص في تحليل النصوص العربية الكلاسيكية. مهمتك تحليل كل جملة تحليلاً شاملاً.

أجب بصيغة JSON فقط بالشكل التالي:
{
  "meaning": "شرح معنى الجملة في سياقها بأسلوب واضح وسلس",
  "irab": [
    {"word": "الكلمة", "irab": "إعرابها الكامل مع العلامة والمحل"}
  ],
  "sarf": [
    {"word": "الكلمة", "root": "الجذر", "wazn": "الوزن الصرفي", "type": "نوع الكلمة", "details": "تفاصيل صرفية إضافية"}
  ],
  "balagha": [
    {"device": "اسم الأسلوب البلاغي", "explanation": "شرح الصورة البلاغية وأثرها"}
  ],
  "context": "السياق: علاقة الجملة بما قبلها وما بعدها",
  "vocabulary": [
    {"word": "الكلمة الصعبة", "meaning": "معناها"}
  ]
}

مهم جداً:
- أعرب كل كلمة دون استثناء
- اذكر الجذر والوزن الصرفي لكل كلمة مشتقة
- لا تترك أي أسلوب بلاغي دون ذكره
- اشرح الكلمات الغريبة في قسم المفردات
- أجب بالعربية فقط
- أرجع JSON صالح فقط`;

  const specifics: Record<BookType, string> = {
    adab: `أنت متخصص في الأدب العربي وبالذات في "${bookTitle}". ركّز على جمال السجع والتصوير الأدبي وبراعة الأسلوب.`,
    nahw: `أنت متخصص في النحو والصرف وبالذات في "${bookTitle}". ركّز على القواعد النحوية والشواهد والأوزان الصرفية والإعلال والإبدال.`,
    fiqh: `أنت متخصص في الفقه الإسلامي وبالذات في "${bookTitle}". ركّز على المصطلحات الفقهية والأدلة الشرعية وأقوال المذاهب.`,
    shir: `أنت متخصص في الشعر العربي وبالذات في "${bookTitle}". ركّز على الوزن والبحر والقافية والصور الشعرية وعمود الشعر العربي.`,
    quran: `أنت متخصص في علوم القرآن والتفسير. ركّز على أسباب النزول والقراءات ووجوه الإعراب والبلاغة القرآنية ومناسبة الآيات. اذكر أقوال المفسرين المعتبرين.`,
    tazkiya: `أنت متخصص في التزكية والتصوف والسلوك وبالذات في "${bookTitle}". ركّز على المصطلحات الصوفية والمقامات والأحوال والآداب.`,
  };

  return `${specifics[bookType]}\n\n${base}`;
}

export async function POST(req: NextRequest) {
  const { sentence, bookTitle, bookType, chapterTitle, sentenceIndex } =
    await req.json();

  if (!sentence) {
    return NextResponse.json({ error: "لم يتم توفير الجملة" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "مفتاح API غير مُعدّ" },
      { status: 500 }
    );
  }

  const systemPrompt = getSystemPrompt(
    (bookType as BookType) || "adab",
    bookTitle || ""
  );

  const userPrompt = `حلّل هذه الجملة من "${bookTitle}" — ${chapterTitle || ""} (الجملة رقم ${sentenceIndex}):

"${sentence}"`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      return NextResponse.json(
        { error: "خطأ في الاتصال بالذكاء الاصطناعي" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const analysis = JSON.parse(content);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحليل" },
      { status: 500 }
    );
  }
}
