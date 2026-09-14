"use client";
import { getCocoModel } from "@/lib/cocoDetector";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

interface AnalysisResult {
  object: string;
  brand: string;
  model: string;
  category: string;
  confidence: string;
  reasoning: string;
  estimated_price: string;
  description: string;
  detected_text: string;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const detectionsRef = useRef<any[]>([]);
const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

 const detectObjects = async () => {
  console.count("Detection Loop");

  if (!webcamRef.current || !canvasRef.current) return;

  const video = webcamRef.current.video as HTMLVideoElement;

  if (!video || video.readyState < 2) return;

  const detector = await getCocoModel();
  const detections = await detector.detect(video);
  detectionsRef.current = detections;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const detection of detections) {
  const [x, y, width, height] = detection.bbox;

  // Animated dashed border
  ctx.strokeStyle = "#22d3ee";
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 6]);

  // This makes the dashes move
  ctx.lineDashOffset = -(performance.now() / 18);

  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 25;
ctx.shadowColor = "#22d3ee";

  ctx.beginPath();
ctx.rect(x, y, width, height);
ctx.stroke();

// Animated scanning line
const scanY =
  y + ((performance.now() / 8) % height);

ctx.strokeStyle = "#22d3ee";
ctx.lineWidth = 2;
ctx.setLineDash([]);

ctx.beginPath();
ctx.moveTo(x, scanY);
ctx.lineTo(x + width, scanY);
ctx.stroke();
  // Reset shadow
  ctx.shadowBlur = 0;

  // Label background
  ctx.fillStyle = "#22d3ee";
  ctx.fillRect(x, y - 28, 150, 24);

  // Label text
  ctx.fillStyle = "#000";
  ctx.font = "bold 14px Arial";

  ctx.fillText(
    `${detection.class} (${Math.round(detection.score * 100)}%)`,
    x + 6,
    y - 10
  );

  

}

  try {
    const detections = await detector.detect(video);

console.log(
  detections.map((d) => ({
    class: d.class,
    score: d.score,
  }))
);
  } catch (err) {
    console.error("Detection Error:", err);
  }
};
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

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    if (typeof reader.result === "string") {
      setCapturedImage(reader.result);
      setAnalysis(null);
      setCameraReady(false);
    }
  };

  reader.readAsDataURL(file);
};

  const analyzeImage = async (imageToAnalyze = capturedImage) => {
    if (!imageToAnalyze) return;

    try {
      setIsAnalyzing(true);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  image: imageToAnalyze,
}),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
  throw new Error(
    "🤖 VisionPilot AI is temporarily busy. Please try again in a few seconds."
  );
}

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

  const handleCanvasClick = async (
  event: React.MouseEvent<HTMLCanvasElement>
) => {
  if (!canvasRef.current) return;

  const rect = canvasRef.current.getBoundingClientRect();

  const scaleX = canvasRef.current.width / rect.width;
  const scaleY = canvasRef.current.height / rect.height;

  const mouseX = (event.clientX - rect.left) * scaleX;
  const mouseY = (event.clientY - rect.top) * scaleY;

  const clickedObject = detectionsRef.current.find((d) => {
    const [x, y, width, height] = d.bbox;

    return (
      mouseX >= x &&
      mouseX <= x + width &&
      mouseY >= y &&
      mouseY <= y + height
    );
  });

  if (!clickedObject) return;

  const [x, y, width, height] = clickedObject.bbox;

const cropCanvas = cropCanvasRef.current;

if (!cropCanvas || !webcamRef.current) return;

const video = webcamRef.current.video as HTMLVideoElement;

cropCanvas.width = width;
cropCanvas.height = height;

const cropCtx = cropCanvas.getContext("2d");

if (!cropCtx) return;

cropCtx.drawImage(
  video,
  x,
  y,
  width,
  height,
  0,
  0,
  width,
  height
);

const croppedImage = cropCanvas.toDataURL("image/jpeg");


await analyzeImage(croppedImage);
};

  useEffect(() => {
  let animationId: number;

  const runDetection = async () => {
    await detectObjects();
    animationId = requestAnimationFrame(runDetection);
  };

  if (cameraReady) {
    runDetection();
  }

  return () => cancelAnimationFrame(animationId);
}, [cameraReady]);

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

          <div className="relative w-full">
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
      setCameraError("Unable to access your camera.");
    }}
    className="aspect-video w-full"
  />

  <canvas
  ref={canvasRef}
  onClick={handleCanvasClick}
  className="absolute inset-0 h-full w-full cursor-crosshair"
/>
</div>

          <div className="flex justify-center gap-4 p-6">

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

  <button
    onClick={() => fileInputRef.current?.click()}
    className="rounded-2xl border border-cyan-400 px-8 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
  >
    📂 Upload Image
  </button>

  <input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  hidden
  onChange={handleImageUpload}
/>

</div>

</>

) : (
        <>
          <div className="relative aspect-video w-full">
            <Image
              src={capturedImage}
              alt="Captured"
              fill
              className="object-contain bg-black"
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
  onClick={() => analyzeImage()}
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

                <div>
  <b>🧠 Why I think this</b>
  <p className="mt-2 text-slate-300 leading-7">
    {analysis.reasoning}
  </p>
</div>

                <p><b>Description:</b><br />{analysis.description}</p>

                <p><b>Estimated Price:</b> {analysis.estimated_price}</p>
                {analysis.detected_text &&
  analysis.detected_text !== "No readable text detected." && (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <p className="font-semibold text-emerald-400">
        📄 Extracted Text
      </p>

      <pre className="mt-3 whitespace-pre-wrap font-sans leading-7 text-slate-300">
        {analysis.detected_text}
      </pre>
    </div>
)}

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
      <canvas
  ref={cropCanvasRef}
  className="hidden"
/>
    </div>
  );
}