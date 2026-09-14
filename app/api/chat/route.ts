import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  console.count("Analyze API Called");

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

Treat this analysis as verified context generated from the uploaded image.

Unless the user asks you to re-evaluate something, do not contradict this analysis without explaining why.

Use it to answer follow-up questions about:
- Brand
- Model
- Price
- Features
- Description
- Category

Only re-examine the image if the user's question specifically requires it.

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

- Treat the uploaded image as the primary source of truth.
- Use the Initial Image Analysis only as supporting context.
- Remember the full conversation and answer naturally.
- If multiple products share a similar design, explain that the image alone is insufficient to determine the exact model. Never present a single model as certain unless distinctive visual evidence exists.
- If the user asks about specifications, explain which ones are visible and which require confirmation.
- If the user asks about price, provide only an estimate and clearly state that prices vary.
- If you are uncertain, explain why instead of guessing.
- Keep answers concise, accurate and conversational.
- Never invent brands, model names, prices or specifications.
- Never claim that a product does not exist based only on your internal knowledge.
- Your knowledge may not include the newest product releases.
- If the user mentions a newer product than you know, acknowledge the possibility instead of denying it.
- If the image cannot distinguish between visually similar models, explicitly say so.
- When identifying a product model, explain which visible features support your conclusion.

=========================
RESPONSE STYLE
=========================

- Answer like a helpful AI assistant, not a JSON generator.
- Keep answers under 120 words unless the user asks for more detail.
- Use bullet points only when they improve readability.
- If you are uncertain, state your confidence level (High, Medium, or Low) and explain why.
- If the user asks a follow-up question, answer it directly without repeating the entire analysis.
- Never start every reply with "Based on the uploaded image...".
- Use natural language.
- If the user asks something unrelated to the uploaded image, politely explain that your answers are limited to the uploaded image and the current conversation.


=========================
KNOWLEDGE LIMITS
=========================

- Your training knowledge has a cutoff and may not include the latest products or events.
- If the user refers to something newer than your knowledge, never deny it exists.
- Instead, say that it may have been released after your knowledge cutoff.
- Distinguish between:
  1. What you can directly observe in the image.
  2. What you know from prior knowledge.
  3. What you are uncertain about.
- If you cannot verify the latest information, clearly say so instead of guessing.

Now answer the user's latest question.
`;

    console.log("Calling Gemini...");
    const result = await ai.models.generateContent({
      model: "gemini-3.8-flash",

      // Enable later if you have enough quota
      // config: {
      //   tools: [
      //     {
      //       googleSearch: {},
      //     },
      //   ],
      // },

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
      answer: result.text,
    });

    console.log("Gemini responded");
  } catch (error: any) {
  console.error("FULL GEMINI ERROR:");
  console.dir(error, { depth: null });

  return NextResponse.json(
    {
      error: error,
    },
    {
      status: 500,
    }
  );
}
}