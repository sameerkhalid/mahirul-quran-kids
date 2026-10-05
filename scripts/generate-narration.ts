import { mkdir, mkdtemp, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SPEECH_ENDPOINT = "https://api.openai.com/v1/audio/speech";
const MODEL = "gpt-4o-mini-tts";
const VOICE = "coral";

const VOICE_DIRECTION = [
  "Speak as a warm, encouraging early-years Quran teacher talking to a four- or five-year-old child.",
  "Sound natural, gentle, joyful, and reassuring, with a small smile.",
  "Use a calm, unhurried pace and clear phrasing.",
  "Do not sound like an announcer, a cartoon character, or a robot.",
  "Pronounce surah as SOO-rah, ayah as EYE-yah, and ayahs as EYE-yahs.",
  "Keep the delivery playful but not exaggerated.",
].join(" ");

// Edit this list whenever a new reusable question heading is added to the app.
const NARRATION_CLIPS = [
  {
    filename: "choose-next-ayah.mp3",
    text: "What comes next? Choose the next ayah.",
  },
  {
    filename: "identify-surah.mp3",
    text: "Which surah is this?",
  },
  {
    filename: "arrange-ayahs.mp3",
    text: "Arrange the ayahs in the correct order.",
  },
  {
    filename: "recite-next.mp3",
    text: "Recite what comes next.",
  },
  {
    filename: "match-surah-meanings.mp3",
    text: "Match each surah to its meaning.",
  },
] as const;

function readApiKey(args: string[]) {
  const namedIndex = args.indexOf("--api-key");
  const namedValue = namedIndex >= 0 ? args[namedIndex + 1] : undefined;
  const equalsValue = args.find((arg) => arg.startsWith("--api-key="))?.slice("--api-key=".length);
  const positionalValue = args.find((arg) => !arg.startsWith("-"));
  const apiKey = namedValue ?? equalsValue ?? positionalValue;

  if (!apiKey || apiKey.startsWith("--")) {
    throw new Error(
      'Missing API key. Run: corepack pnpm generate:narration --api-key "YOUR_OPENAI_API_KEY"',
    );
  }

  return apiKey;
}

async function generateClip(apiKey: string, text: string, destination: string) {
  const response = await fetch(SPEECH_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      voice: VOICE,
      input: text,
      instructions: VOICE_DIRECTION,
      response_format: "mp3",
      speed: 0.95,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 500);
    throw new Error(`OpenAI returned ${response.status}: ${details}`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  if (audio.byteLength < 1_000) {
    throw new Error(`OpenAI returned an unexpectedly small audio file (${audio.byteLength} bytes).`);
  }

  await writeFile(destination, audio);
}

async function main() {
  const apiKey = readApiKey(process.argv.slice(2));
  const outputDirectory = join(process.cwd(), "public", "narration");
  await mkdir(outputDirectory, { recursive: true });
  const stagingDirectory = await mkdtemp(join(outputDirectory, ".generating-"));

  try {
    for (const [index, clip] of NARRATION_CLIPS.entries()) {
      console.log(`[${index + 1}/${NARRATION_CLIPS.length}] Generating ${clip.filename}…`);
      await generateClip(apiKey, clip.text, join(stagingDirectory, clip.filename));
    }

    for (const clip of NARRATION_CLIPS) {
      const fileInfo = await stat(join(stagingDirectory, clip.filename));
      if (!fileInfo.isFile() || fileInfo.size < 1_000) {
        throw new Error(`Generated file failed validation: ${clip.filename}`);
      }
    }

    for (const clip of NARRATION_CLIPS) {
      await rename(join(stagingDirectory, clip.filename), join(outputDirectory, clip.filename));
    }

    console.log(`Done. Replaced ${NARRATION_CLIPS.length} source clips in public/narration/.`);
    console.log("Development mode will use them immediately. Run `corepack pnpm build` to refresh dist/ and the PWA cache manifest.");
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Narration generation failed: ${message}`);
  process.exitCode = 1;
});
