import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});

export async function POST(req: Request) {
  try {
    const { image, messages } = await req.json();

    if (!image || !messages) {
      return NextResponse.json(
        { error: "Image and messages are required." },
        { status: 400 }
      );
    }

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
  text: `
You are VisionPilot AI, an intelligent visual assistant.

You have access to the uploaded image.

Below is the entire conversation so far.

${messages
  .map(
    (message: { role: string; text: string }) =>
      `${message.role === "user" ? "User" : "Assistant"}: ${message.text}`
  )
  .join("\n")}

Rules:
- Continue the conversation naturally.
- Always use the uploaded image as context.
- Remember previous questions and your previous answers.
- If you don't know something from the image, say "I'm not confident enough to determine that."
- Never invent specifications or product models.
- Keep answers concise but informative.

Now answer the latest user message.
`,
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
      answer: result.response.text(),
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message || "Chat failed.",
      },
      { status: 500 }
    );
  }
}