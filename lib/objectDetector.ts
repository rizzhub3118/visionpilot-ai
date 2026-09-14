import {
  FilesetResolver,
  ObjectDetector,
} from "@mediapipe/tasks-vision";

let detector: ObjectDetector | null = null;

export async function getObjectDetector() {
  if (detector) return detector;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );

  detector = await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite",
    },
    scoreThreshold: 0.5,
    runningMode: "VIDEO",
    maxResults: 5,
  });

  return detector;
}