import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export default async (req: Request, res: Response) => {
  const { text } = req.query;

  if (!text || typeof text !== "string") {
    return res.status(400).send("Missing or invalid 'text' query parameter");
  }

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata("en-US-GuyNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const outputFile = path.join(__dirname, "output.mp3");

    await tts.toFile(outputFile, text);

    res.setHeader("Content-Type", "audio/mpeg");
    res.sendFile(outputFile, (err) => {
      if (err) {
        console.error("Error sending file:", err);
      }
      fs.unlink(outputFile, (err) => {
        if (err) console.error("Cleanup failed:", err);
      });
    });
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).send("Failed to generate audio");
  }
};
