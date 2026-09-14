import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  console.log("🔥 /api/analyze called");

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
  "detected_text": "",
  "document_type": "",
  "document_summary": "",
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
- If the image contains readable text, extract all important text exactly as it appears.
- Store the extracted text in the "detected_text" field.
- Preserve line breaks where appropriate.
- If the image contains both objects and text, analyze both.
- If no readable text exists, return "No readable text detected."
- Do not summarize the extracted text inside detected_text. Return the raw text.
- key_features should contain 3 short bullet points.
- follow_up_questions should contain 3 useful questions a user might ask next.
- Return ONLY valid JSON.
- reasoning should briefly explain which visible features led to the identification.
- If confidence is Medium or Low, explain why the identification is uncertain.
- Keep reasoning under 40 words.
- Determine whether the uploaded image is primarily:
  - a product
  - a receipt
  - an invoice
  - a medicine label
  - a menu
  - a document
  - a book page
  - a signboard
  - or another document type.

- Store the result in "document_type".

- If it is a document, generate a concise summary in "document_summary".

- If it is not a document, return:
  "Not a document."
`;
    console.log(
  "Using API Key:",
  process.env.GEMINI_API_KEY?.slice(0, 10)
);


    const result = await ai.models.generateContent({
      model: "gemini-3.8-flash",
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