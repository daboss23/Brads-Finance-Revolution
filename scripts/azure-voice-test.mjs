#!/usr/bin/env node
/**
 * Audition Azure Speech neural voices for Athena.
 *
 * Renders the same line through several candidate voices so they can be
 * compared side by side, then written to ./voice-samples as mp3.
 *
 *   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=australiaeast \
 *     node scripts/azure-voice-test.mjs
 *
 * Options:
 *   --voice <name>   Render one voice instead of the candidate set.
 *   --text  <line>   Say something else.
 *   --rate  <pct>    Speaking rate, e.g. -8% for a slower, warmer read.
 *   --pitch <pct>    Pitch shift, e.g. +2%.
 *   --out   <dir>    Output directory (default ./voice-samples).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const CANDIDATE_VOICES = [
  "en-AU-NatashaNeural",
  "en-AU-CarlyNeural",
  "en-AU-FreyaNeural",
  "en-AU-TinaNeural",
  "en-AU-AnnetteNeural",
];

const DEFAULT_TEXT =
  "Hi Brad, I'm Athena from Newcastle Financial Services. How's it going? " +
  "What we're doing today is just a Financial Discovery Session. " +
  "We want to get to know and understand your situation so we can best serve you. " +
  "We'll keep it relaxed and have some fun with it!";

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c],
  );
}

function ssml({ voice, text, rate, pitch }) {
  const prosody = `<prosody rate="${rate}" pitch="${pitch}">${escapeXml(text)}</prosody>`;
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-AU"><voice name="${voice}">${prosody}</voice></speak>`;
}

async function synthesize({ key, region, voice, text, rate, pitch }) {
  const res = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-160kbitrate-mono-mp3",
        "User-Agent": "bmk-crm-voice-audition",
      },
      body: ssml({ voice, text, rate, pitch }),
    },
  );

  if (!res.ok) {
    throw new Error(
      `${res.status} ${res.statusText} — ${(await res.text()).slice(0, 300)}`,
    );
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    console.error(
      "Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION first.\n" +
        "Both are on your Speech resource in the Azure portal, under Keys and Endpoint.\n" +
        "Region is the short form, for example australiaeast.",
    );
    process.exit(1);
  }

  const single = arg("--voice", null);
  const voices = single ? [single] : CANDIDATE_VOICES;
  const text = arg("--text", DEFAULT_TEXT);
  const rate = arg("--rate", "0%");
  const pitch = arg("--pitch", "0%");
  const outDir = resolve(arg("--out", "voice-samples"));

  await mkdir(outDir, { recursive: true });
  console.log(`Region ${region}, rate ${rate}, pitch ${pitch}\n`);

  let failures = 0;
  for (const voice of voices) {
    try {
      const audio = await synthesize({ key, region, voice, text, rate, pitch });
      const file = resolve(outDir, `${voice}.mp3`);
      await writeFile(file, audio);
      console.log(`  ok    ${voice}  ${(audio.length / 1024).toFixed(0)} KB`);
    } catch (e) {
      failures += 1;
      console.error(`  fail  ${voice}  ${e.message}`);
    }
  }

  console.log(`\nWrote to ${outDir}`);
  if (failures === voices.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
