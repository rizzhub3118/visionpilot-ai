"use client";
import ChatPanel from "@/components/ChatPanel";
import { useState } from "react";
import CameraView from "@/components/CameraView";

export default function Home() {
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // NEW
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  return (
    <main className="min-h-screen bg-[#030712] text-white transition-all duration-500">
      {!cameraEnabled ? (
        <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
          <h1 className="font-[family:var(--font-heading)] text-6xl font-bold tracking-tight md:text-8xl">
            VisionPilot
          </h1>

          <h2 className="mt-6 text-3xl font-semibold text-white/90 md:text-5xl">
            See. Understand. Ask.
          </h2>

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400 md:text-xl">
            Point your camera at anything.
            <br />
            VisionPilot identifies it,
            understands it,
            and answers your questions.
          </p>

          <button
            onClick={() => setCameraEnabled(true)}
            className="mt-12 rounded-2xl bg-cyan-400 px-8 py-4 text-lg font-semibold text-slate-900 transition-all duration-300 hover:scale-105 hover:bg-cyan-300"
          >
            Enable Camera
          </button>
        </section>
      ) : (
        <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-[family:var(--font-heading)] text-4xl font-bold">
                VisionPilot
              </h1>

              <p className="mt-1 text-slate-400">
                AI Visual Assistant
              </p>
            </div>

            <button
              onClick={() => setCameraEnabled(false)}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm hover:bg-white/10"
            >
              Close Camera
            </button>
          </header>

          <CameraView
  capturedImage={capturedImage}
  setCapturedImage={setCapturedImage}
  analysis={analysis}
  setAnalysis={setAnalysis}
/>

          <ChatPanel
  capturedImage={capturedImage}
  analysis={analysis}
/>
        </section>
      )}
    </main>
  );
}