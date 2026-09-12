import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

export async function POST(req: Request) {
  try {
    const { image, messages, analysis } = await req.json();

    if (!image || !messages) {
      return NextResponse.json(
        {
          error: "Image and messages are required.",
        },
        {
          status: 400,
        }
      );
    }

    const prompt = `
You are VisionPilot AI, an intelligent visual assistant.

You have access to:
1. The uploaded image.
2. An initial AI analysis of the image.
3. The complete conversation history.

=========================
INITIAL IMAGE ANALYSIS
=========================

${analysis ? JSON.stringify(analysis, null, 2) : "No analysis available."}

=========================
CONVERSATION
=========================

${messages
  .map(
    (message: { role: string; text: string }) =>
      `${message.role === "user" ? "User" : "Assistant"}: ${message.text}`
  )
  .join("\n")}

=========================
RULES
=========================

- Always use the uploaded image as the primary source.
- Use the Initial Image Analysis as additional context.
- Remember previous questions and answers.
- Continue the conversation naturally.
- Never invent brands, models or specifications.
- If you are uncertain, clearly say so.
- Never claim that a product does not exist.
- Your knowledge may not include the newest product releases.
- If the image alone cannot confirm an exact model, explicitly say that.
- Keep responses concise, helpful and conversational.

Now answer the user's latest question.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: image.replace(/^data:image\/\w+;base64,/, ""),
        },
      },
    ]);

    const answer = result.response.text();

    return NextResponse.json({
      answer,
    });
  } catch (error: any) {
    console.error("CHAT ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Chat failed.",
      },
      {
        status: 500,
      }
    );
  }
}