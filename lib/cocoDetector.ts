import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

let model: cocoSsd.ObjectDetection | null = null;

export async function getCocoModel() {
  if (!model) {
    model = await cocoSsd.load();
    console.log("✅ COCO-SSD model loaded");
  }

  return model;
}