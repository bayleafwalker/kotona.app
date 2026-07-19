import { Buffer } from "node:buffer";
import { mkdir, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

import sharp from "sharp";

import { readContentMetadata } from "./lib/content-metadata.mjs";
import { generatedOgImagePath } from "../src/lib/og-images.js";

const rootDirectory = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = path.join(rootDirectory, "public/og/generated");

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wordWidth(value) {
  return [...value].reduce((width, character) => {
    if ("ilI1.,'’".includes(character)) return width + 0.42;
    if ("mwMW@%".includes(character)) return width + 1.45;
    if (character === " ") return width + 0.52;
    return width + 1;
  }, 0);
}

function wrapTitle(title, maxWidth) {
  const words = title.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (line && wordWidth(candidate) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);

  if (lines.length <= 3) return lines;

  return [lines[0], lines[1], lines.slice(2).join(" ")];
}

function socialCard({ title, label }) {
  const fontSize = title.length > 58 ? 56 : 64;
  const lines = wrapTitle(title, fontSize === 56 ? 29 : 24);
  const lineHeight = fontSize + 13;
  const titleTop = 285 - (lines.length - 1) * 39;
  const titleLines = lines
    .map(
      (line, index) =>
        `<tspan x="146" y="${titleTop + index * lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#f7f4ec" />
      <rect x="74" y="64" width="1052" height="502" rx="30" fill="#fbf8f1" stroke="#d8d0c2" stroke-width="2" />
      <rect x="112" y="116" width="7" height="380" rx="3.5" fill="#31584c" />
      <text x="146" y="150" fill="#31584c" font-size="24" font-weight="700" letter-spacing="2.5" font-family="Arial, Helvetica, sans-serif">${escapeXml(label.toUpperCase())}</text>
      <text fill="#1f2520" font-size="${fontSize}" font-weight="700" font-family="Georgia, 'Times New Roman', serif">${titleLines}</text>
      <line x1="146" y1="465" x2="1054" y2="465" stroke="#d8d0c2" stroke-width="2" />
      <text x="146" y="515" fill="#1f2520" font-size="28" font-weight="700" font-family="Arial, Helvetica, sans-serif">kotona.app</text>
      <text x="1054" y="515" text-anchor="end" fill="#5f675f" font-size="23" font-family="Georgia, 'Times New Roman', serif">systems · decisions · evidence</text>
    </svg>
  `);
}

async function clearGeneratedPngs() {
  await mkdir(outputDirectory, { recursive: true });

  for (const entry of await readdir(outputDirectory, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".png")) {
      await unlink(path.join(outputDirectory, entry.name));
    }
  }
}

const collections = [
  { name: "notes", draftByDefault: false },
  { name: "projects", draftByDefault: true },
];
const cards = collections.flatMap(({ name, draftByDefault }) =>
  readContentMetadata(rootDirectory, name, { draftByDefault })
    .filter((entry) => !entry.draft && !(name === "notes" && entry.data.hero))
    .map((entry) => ({
      collection: name,
      id: entry.id,
      label:
        name === "notes"
          ? `System note · ${entry.data.area}`
          : `Project · ${entry.data.project}`,
      title: entry.data.socialTitle ?? entry.data.title,
    })),
);

await clearGeneratedPngs();

for (const card of cards) {
  const publicPath = generatedOgImagePath(card.collection, card.id);
  const outputPath = path.join(rootDirectory, "public", publicPath);
  await sharp(socialCard(card)).png({ compressionLevel: 9 }).toFile(outputPath);
}

process.stdout.write(`Generated ${cards.length} social cards.\n`);
