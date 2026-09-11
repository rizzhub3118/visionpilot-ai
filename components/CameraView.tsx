"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import Webcam from "react-webcam";

export default function CameraView() {
  const webcamRef = useRef<Webcam>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();

    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">

      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">

        <h2 className="text-lg font-semibold tracking-wide">
          LIVE CAMERA
        </h2>

        <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-300">
          Camera Ready
        </span>

      </div>

      {!capturedImage ? (
        <>
          <Webcam
  ref={webcamRef}
  audio={false}
  mirrored={false}
  screenshotFormat="image/jpeg"
screenshotQuality={1}
  videoConstraints={{
    width: 1920,
    height: 1080,
    facingMode: "user",
  }}
  className="aspect-video w-full"
/>

          <div className="flex justify-center p-6">

            <button
              onClick={capture}
              className="rounded-2xl bg-cyan-400 px-8 py-3 font-semibold text-slate-900 transition hover:scale-105 hover:bg-cyan-300"
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