import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { sentence, maqamaTitle, sentenceIndex } = await req.json();

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

  const systemPrompt = `أنت عالم لغوي متخصص في شرح مقامات الحريري. مهمتك تحليل كل جملة تحليلاً شاملاً.

أجب بصيغة JSON فقط بالشكل التالي:
{
  "meaning": "شرح معنى الجملة في سياق القصة بأسلوب واضح وسلس",
  "irab": [
    {"word": "الكلمة", "irab": "إعرابها الكامل مع العلامة والمحل"}
  ],
  "sarf": [
    {"word": "الكلمة", "root": "الجذر الثلاثي أو الرباعي", "wazn": "الوزن الصرفي", "type": "نوع الكلمة (فعل ماضٍ/مضارع/أمر/اسم فاعل/اسم مفعول/مصدر/صفة مشبهة/إلخ)", "details": "أي تفاصيل صرفية إضافية مثل التعدي واللزوم والمجرد والمزيد"}
  ],
  "balagha": [
    {"device": "اسم الأسلوب البلاغي", "explanation": "شرح الصورة البلاغية وأثرها في المعنى"}
  ],
  "context": "السياق القصصي: ما علاقة هذه الجملة بما قبلها وما بعدها في المقامة، ودور أبي زيد السروجي والحارث بن همام",
  "vocabulary": [
    {"word": "الكلمة الصعبة", "meaning": "معناها"}
  ]
}

مهم جداً:
- أعرب كل كلمة في الجملة دون استثناء
- اذكر الجذر والوزن الصرفي لكل كلمة ذات أصل اشتقاقي
- لا تترك أي أسلوب بلاغي دون ذكره (تشبيه، استعارة، كناية، سجع، جناس، طباق، مقابلة، إلخ)
- اشرح الكلمات الغريبة في قسم المفردات
- أجب بالعربية فقط
- أرجع JSON صالح فقط، بدون أي نص إضافي`;

  const userPrompt = `حلّل هذه الجملة من "${maqamaTitle}" (الجملة رقم ${sentenceIndex}):

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
