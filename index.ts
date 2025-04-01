import { Request, Response } from "express";
import { EdgeTTS } from "edge-tts";
import * as fs from "fs";
import * as path from "path";

// Express handler
export default async (req: Request, res: Response) => {
  const { text } = req.query; // ?text=Hello

  if (!text || typeof text !== "string") {
    return res.status(400).send("Missing or invalid 'text' query parameter");
  }

  try {
    const tts = new EdgeTTS({ voice: "en-US-GuyNeural" });
    const outputFile = path.join(__dirname, "output.mp3");

    // Generate audio
    await tts.synthesize(text, outputFile);

    // Send audio file
    res.setHeader("Content-Type", "audio/mpeg");
    res.sendFile(outputFile, (err) => {
      if (err) {
        console.error("Error sending file:", err);
      }
      // Cleanup
      fs.unlink(outputFile, (err) => {
        if (err) console.error("Cleanup failed:", err);
      });
    });
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).send("Failed to generate audio");
  }
};
