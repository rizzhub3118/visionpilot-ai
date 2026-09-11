import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided." },
        { status: 400 }
      );
    }

   const prompt = `
You are VisionPilot AI, an advanced visual assistant.

Analyze the uploaded image carefully.

Return ONLY valid JSON in this exact format:

{
  "object": "",
  "brand": "",
  "model": "",
  "category": "",
  "confidence": "",
  "estimated_price": "",
  "description": "",
  "key_features": [],
  "follow_up_questions": []
}

Rules:
- Identify the primary object.
If it is a product:
- Identify the brand with high confidence if possible.
- Only identify the exact model if you are reasonably confident from visible features.
- If you are not confident about the exact model, return "Unknown" instead of guessing.
- Never invent or hallucinate a model name.
- Confidence must be High, Medium, or Low.
- If the price cannot be estimated, return "Unknown".
- Description should be under 50 words.
- key_features should contain 3 short bullet points.
- follow_up_questions should contain 3 useful questions a user might ask next.
- Return ONLY JSON.
`;

    const result = await model.generateContent({
  contents: [
    {
      role: "user",
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: image.replace(/^data:image\/\w+;base64,/, ""),
          },
        },
      ],
    },
  ],
});

    const text = result.response.text();

    return NextResponse.json({
      result: text,
    });
  } catch (error: any) {
  console.error("FULL ERROR:", error);

  return NextResponse.json(
    {
      error: error?.message || "Analysis failed.",
    },
    { status: 500 }
  );
}
}