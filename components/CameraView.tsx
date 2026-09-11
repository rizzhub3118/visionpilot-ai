"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Webcam from "react-webcam";

export default function CameraView() {
  const webcamRef = useRef<Webcam>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();

    if (imageSrc) {
      setCapturedImage(imageSrc);
      setCameraReady(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setCameraReady(false);
    setCameraError("");
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

          <div className="flex justify-center p-6">
            <button
              onClick={retake}
              className="rounded-2xl border border-white/10 px-8 py-3 transition hover:bg-white/10"
            >
              🔄 Retake
            </button>
          </div>
        </>
      )}
    </div>
  );
}