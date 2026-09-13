"use client";

import { useEffect, useRef, useState } from "react";

interface AnalysisResult {
  object: string;
  brand: string;
  model: string;
  category: string;
  confidence: string;
  estimated_price: string;
  description: string;
  key_features: string[];
  follow_up_questions: string[];
}

interface ChatPanelProps {
  capturedImage: string | null;
  analysis: AnalysisResult | null;
}

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function ChatPanel({
  capturedImage,
  analysis,
}: ChatPanelProps)  {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
  setMessages([]);
  setQuestion("");
}, [capturedImage]);

  const askAI = async (input?: string) => {
    if (!capturedImage) {
      alert("Please capture and analyze an image first.");
      return;
    }

    const userQuestion = input ?? question;

if (!userQuestion.trim()) return;

    const updatedMessages: Message[] = [
      ...messages,
      {
        role: "user",
        text: userQuestion,
      },
    ];

    setMessages(updatedMessages);
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
  analysis,
  messages: updatedMessages,
}),
      });

      const data = await response.json();

      if (!response.ok) {
        if (!response.ok) {
  if (
    typeof data.error === "string" &&
    data.error.includes("RESOURCE_EXHAUSTED")
  ) {
    throw new Error(
      "Gemini API quota exceeded. Please wait for your quota to reset or upgrade your API plan."
    );
  }

  throw new Error(data.error || "Failed to get AI response.");
}
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
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 ${
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
            <div className="rounded-2xl bg-slate-800 px-4 py-3 text-white animate-pulse">
              🧠 VisionPilot is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      {analysis && analysis.follow_up_questions.length > 0 && (
  <div className="mb-4 flex flex-wrap gap-2">
    {analysis.follow_up_questions.map((q, index) => (
      <button
        key={index}
        onClick={() => {
  askAI(q);
}}
        className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/20"
      >
        {q}
      </button>
    ))}
  </div>
)}

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            askAI();
          }
        }}
        placeholder="Ask anything about the captured image..."
        className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-[#111827] p-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
      />

      <div className="mt-4 flex gap-4">

        <button
          onClick={() => askAI()}
          disabled={loading}
          className="rounded-2xl bg-cyan-400 px-8 py-3 font-semibold text-slate-900 transition hover:scale-105 hover:bg-cyan-300 disabled:opacity-50"
        >
          Send
        </button>

        <button
          onClick={() => setMessages([])}
          className="rounded-2xl border border-white/10 px-8 py-3 transition hover:bg-white/10"
        >
          New Chat
        </button>

      </div>

    </div>
  );
}