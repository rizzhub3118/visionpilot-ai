import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
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
  "reasoning": "",
  "estimated_price": "",
  "description": "",
  "key_features": [],
  "follow_up_questions": []
}

Rules:
- Identify the primary object.
- If it is a product:
  - Identify the brand with high confidence if possible.
  - Only identify the exact model if you are reasonably confident from visible features.
  - If you are not confident about the exact model, return "Unknown" instead of guessing.
  - Never invent or hallucinate a model name.
- Confidence must be High, Medium, or Low.
- Return the estimated retail price in Indian Rupees (₹).
- If the exact Indian price is unknown, return a realistic INR price range.
- Never return prices in USD.
- If the price cannot be estimated, return "Unknown".
- Description should be under 50 words.
- key_features should contain 3 short bullet points.
- follow_up_questions should contain 3 useful questions a user might ask next.
- Return ONLY valid JSON.
- reasoning should briefly explain which visible features led to the identification.
- If confidence is Medium or Low, explain why the identification is uncertain.
- Keep reasoning under 40 words.
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
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

    return NextResponse.json({
      result: result.text,
    });
  } catch (error: any) {
    console.error("FULL ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Analysis failed.",
      },
      {
        status: 500,
      }
    );
  }
}