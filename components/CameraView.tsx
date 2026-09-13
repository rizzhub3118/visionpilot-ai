"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Webcam from "react-webcam";

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

interface CameraViewProps {
  capturedImage: string | null;
  setCapturedImage: React.Dispatch<React.SetStateAction<string | null>>;
  analysis: AnalysisResult | null;
  setAnalysis: React.Dispatch<
    React.SetStateAction<AnalysisResult | null>
  >;
}

export default function CameraView({
  capturedImage,
  setCapturedImage,
  analysis,
  setAnalysis,
}: CameraViewProps) {
  const webcamRef = useRef<Webcam>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

      const parsed: AnalysisResult = JSON.parse(text);

      setAnalysis(parsed);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Analysis failed."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">

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

          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}
            mirrored={false}
            onUserMedia={() => {
              setCameraReady(true);
              setCameraError("");
            }}
            onUserMediaError={() => {
              setCameraReady(false);
              setCameraError(
                "Unable to access your camera."
              );
            }}
            videoConstraints={{
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              facingMode: "environment",
            }}
            className="aspect-video w-full"
          />

          <div className="flex justify-center p-6">
            <button
              onClick={capture}
              disabled={!cameraReady}
              className={`rounded-2xl px-8 py-3 font-semibold transition ${
                cameraReady
                  ? "bg-cyan-400 text-slate-900 hover:scale-105"
                  : "cursor-not-allowed bg-slate-700 text-slate-400"
              }`}
            >
              📸 Capture
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="relative aspect-video w-full">
            <Image
              src={capturedImage}
              alt="Captured"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex justify-center gap-4 p-6">
            <button
              onClick={retake}
              className="rounded-2xl border border-white/10 px-8 py-3 hover:bg-white/10"
            >
              🔄 Retake
            </button>

            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="rounded-2xl bg-cyan-400 px-8 py-3 font-semibold text-slate-900 hover:bg-cyan-300 disabled:opacity-50"
            >
              {isAnalyzing
                ? "Analyzing..."
                : "✨ Analyze with AI"}
            </button>
          </div>

          {analysis && (
            <div className="m-6 rounded-2xl border border-cyan-500/20 bg-[#0B1220] p-6">

              <h2 className="mb-6 text-2xl font-bold text-cyan-300">
                🧠 AI Analysis
              </h2>

              <div className="space-y-4 text-slate-200">

                <p><b>Object:</b> {analysis.object}</p>

                <p><b>Brand:</b> {analysis.brand}</p>

                <p><b>Model:</b> {analysis.model}</p>

                <p><b>Category:</b> {analysis.category}</p>

                <p><b>Confidence:</b> {analysis.confidence}</p>

                <p><b>Description:</b><br />{analysis.description}</p>

                <p><b>Estimated Price:</b> {analysis.estimated_price}</p>

                <div>
                  <b>Key Features</b>
                  <ul className="list-disc pl-6">
                    {analysis.key_features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

              

              </div>

            </div>
          )}
        </>
      )}
    </div>
  );
}