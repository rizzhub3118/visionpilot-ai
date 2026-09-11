"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Webcam from "react-webcam";

interface CameraViewProps {
  capturedImage: string | null;
  setCapturedImage: React.Dispatch<React.SetStateAction<string | null>>;
}
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

export default function CameraView({
  capturedImage,
  setCapturedImage,
}: CameraViewProps) {
    
  const webcamRef = useRef<Webcam>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();

    if (imageSrc) {
      setCapturedImage(imageSrc);
      setCameraReady(false);
      setAnalysis(null);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setCameraReady(false);
    setCameraError("");
    setAnalysis(null);
  };

  const analyzeImage = async () => {
  if (!capturedImage) return;

  try {
    setIsAnalyzing(true);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: capturedImage,
      }),
    });

    const data = await response.json();

    console.log("API Response:", data);

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed");
    }

    let text = data.result;

    if (typeof text !== "string") {
      throw new Error("Gemini did not return text.");
    }

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("Cleaned JSON:", text);

    const parsed = JSON.parse(text);

    console.log("Parsed:", parsed);

    setAnalysis(parsed);
  } catch (error) {
    console.error(error);
    alert(error instanceof Error ? error.message : "Analysis failed.");
  } finally {
    setIsAnalyzing(false);
  }
};

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">

        <h2 className="text-lg font-semibold tracking-wide">
          LIVE CAMERA
        </h2>

        <span
          className={`rounded-full px-3 py-1 text-sm ${
            cameraError
              ? "bg-red-500/20 text-red-300"
              : cameraReady
              ? "bg-green-500/20 text-green-300"
              : "bg-yellow-500/20 text-yellow-300"
          }`}
        >
          {cameraError
            ? "Camera Error"
            : cameraReady
            ? "Camera Ready"
            : "Starting Camera..."}
        </span>

      </div>

      {!capturedImage ? (
        <>
          {cameraError && (
            <div className="m-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              {cameraError}
            </div>
          )}

          {cameraError && (
            <div className="flex justify-center pb-6">
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl bg-red-500 px-6 py-2 font-medium text-white transition hover:bg-red-600"
              >
                Retry Camera
              </button>
            </div>
          )}

          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}
            onUserMedia={() => {
              setCameraReady(true);
              setCameraError("");
            }}
            onUserMediaError={() => {
              setCameraReady(false);
              setCameraError(
                "Unable to access your camera. Please allow permission and try again."
              );
            }}
            videoConstraints={{
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              facingMode: "user",
            }}
            className="aspect-video w-full"
          />

          <div className="flex justify-center p-6">
            <button
              onClick={capture}
              disabled={!cameraReady}
              className={`rounded-2xl px-8 py-3 font-semibold transition ${
                cameraReady
                  ? "bg-cyan-400 text-slate-900 hover:scale-105 hover:bg-cyan-300"
                  : "cursor-not-allowed bg-slate-700 text-slate-400"
              }`}
            >
              {cameraReady ? "📸 Capture" : "Starting Camera..."}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="relative aspect-video w-full">
            <Image
              src={capturedImage}
              alt="Captured Image"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex justify-center gap-4 p-6">
            <button
              onClick={retake}
              className="rounded-2xl border border-white/10 px-8 py-3 transition hover:bg-white/10"
            >
              🔄 Retake
            </button>

            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="rounded-2xl bg-cyan-400 px-8 py-3 font-semibold text-slate-900 transition hover:scale-105 hover:bg-cyan-300 disabled:opacity-50"
            >
              {isAnalyzing ? "Analyzing..." : "✨ Analyze with AI"}
            </button>
          </div>

          {analysis && (
            <div className="m-6 rounded-2xl border border-cyan-500/20 bg-[#0B1220] p-6">
              <h2 className="mb-6 text-2xl font-bold text-cyan-300">
                🧠 AI Analysis
              </h2>

              <div className="space-y-4 text-slate-200">

                <p>
                  <span className="font-semibold text-cyan-400">
                    Object:
                  </span>{" "}
                  {analysis.object}
                </p>

                <p>
                  <span className="font-semibold text-cyan-400">
                    Brand:
                  </span>{" "}
                  {analysis.brand}
                </p>

                <p>
                  <span className="font-semibold text-cyan-400">
                    Model:
                  </span>{" "}
                  {analysis.model}
                </p>

                <p>
                  <span className="font-semibold text-cyan-400">
                    Category:
                  </span>{" "}
                  {analysis.category}
                </p>

                <p>
                  <span className="font-semibold text-cyan-400">
                    Confidence:
                  </span>{" "}
                  {analysis.confidence}
                </p>

                <div>
                  <p className="mb-2 font-semibold text-cyan-400">
                    Description
                  </p>

                  <p className="leading-7 text-slate-300">
                    {analysis.description}
                  </p>
                </div>

                <div className="mt-6">
  <p className="mb-2 font-semibold text-cyan-400">
    💰 Estimated Price
  </p>

  <p className="text-slate-300">
    {analysis.estimated_price}
  </p>
</div>

<div className="mt-6">
  <p className="mb-2 font-semibold text-cyan-400">
    ⭐ Key Features
  </p>

  <ul className="list-disc space-y-2 pl-6 text-slate-300">
    {analysis.key_features?.map((feature, index) => (
      <li key={index}>{feature}</li>
    ))}
  </ul>
</div>

<div className="mt-6">
  <p className="mb-3 font-semibold text-cyan-400">
    ❓ Suggested Questions
  </p>

  <div className="flex flex-wrap gap-3">
    {analysis.follow_up_questions?.map((question, index) => (
      <button
        key={index}
        className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/20"
      >
        {question}
      </button>
    ))}
  </div>
</div>

              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}