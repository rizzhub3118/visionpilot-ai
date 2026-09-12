"use client";

import { useState } from "react";

interface ChatPanelProps {
  capturedImage: string | null;
}

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function ChatPanel({
  capturedImage,
}: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const askAI = async () => {
    if (!capturedImage) {
      alert("Please capture and analyze an image first.");
      return;
    }

    if (!question.trim()) return;

    const userQuestion = question;

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userQuestion,
      },
    ]);

    setQuestion("");

    try {
      setLoading(true);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  image: capturedImage,
  messages: [
    ...messages,
    {
      role: "user",
      text: userQuestion,
    },
  ],
}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

      <h2 className="mb-6 text-2xl font-bold text-cyan-300">
        💬 Ask VisionPilot
      </h2>

      <div className="mb-6 max-h-[400px] space-y-4 overflow-y-auto rounded-2xl bg-[#0B1220] p-4">

        {messages.length === 0 && (
          <p className="text-center text-slate-500">
            Start a conversation about the captured image.
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-cyan-400 text-slate-900"
                  : "bg-slate-800 text-white"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-800 px-4 py-3 text-white">
              🧠 VisionPilot is thinking...
            </div>
          </div>
        )}
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask anything about the captured image..."
        className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-[#111827] p-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
      />

      <button
        onClick={askAI}
        disabled={loading}
        className="mt-4 rounded-2xl bg-cyan-400 px-8 py-3 font-semibold text-slate-900 transition hover:scale-105 hover:bg-cyan-300 disabled:opacity-50"
      >
        Send
      </button>

    </div>
  );
}