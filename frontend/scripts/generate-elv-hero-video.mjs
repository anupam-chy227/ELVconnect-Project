import { mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, "..");
const outputDir = resolve(appRoot, "public", "media");

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 24;
const DURATION_SECONDS = 10;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;
const TAU = Math.PI * 2;

const outWebm = resolve(outputDir, "elv-marketplace-hero.webm");
const outMp4 = resolve(outputDir, "elv-marketplace-hero.mp4");
const outPoster = resolve(outputDir, "elv-marketplace-hero-poster.png");

const palette = {
  black: [2, 6, 14],
  deep: [4, 12, 28],
  cyan: [12, 170, 246],
  blue: [66, 153, 225],
  indigo: [116, 104, 255],
  emerald: [16, 185, 129],
  amber: [245, 158, 11],
  white: [244, 250, 255],
  soft: [166, 224, 255],
};

const font = {
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "11110", "00000", "00000", "00000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "11100"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
};

function clamp(value, min = 0, max = 255) {
  return Math.max(min, Math.min(max, value));
}

function blendPixel(buffer, x, y, color, alpha = 1) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || px >= WIDTH || py < 0 || py >= HEIGHT || alpha <= 0) return;

  const index = (py * WIDTH + px) * 3;
  const inverse = 1 - alpha;
  buffer[index] = clamp(buffer[index] * inverse + color[0] * alpha);
  buffer[index + 1] = clamp(buffer[index + 1] * inverse + color[1] * alpha);
  buffer[index + 2] = clamp(buffer[index + 2] * inverse + color[2] * alpha);
}

function fillRect(buffer, x, y, width, height, color, alpha = 1) {
  const startX = Math.max(0, Math.round(x));
  const startY = Math.max(0, Math.round(y));
  const endX = Math.min(WIDTH, Math.round(x + width));
  const endY = Math.min(HEIGHT, Math.round(y + height));

  for (let py = startY; py < endY; py += 1) {
    let index = (py * WIDTH + startX) * 3;
    for (let px = startX; px < endX; px += 1) {
      const inverse = 1 - alpha;
      buffer[index] = clamp(buffer[index] * inverse + color[0] * alpha);
      buffer[index + 1] = clamp(buffer[index + 1] * inverse + color[1] * alpha);
      buffer[index + 2] = clamp(buffer[index + 2] * inverse + color[2] * alpha);
      index += 3;
    }
  }
}

function strokeRect(buffer, x, y, width, height, color, alpha = 1, thickness = 2) {
  fillRect(buffer, x, y, width, thickness, color, alpha);
  fillRect(buffer, x, y + height - thickness, width, thickness, color, alpha);
  fillRect(buffer, x, y, thickness, height, color, alpha);
  fillRect(buffer, x + width - thickness, y, thickness, height, color, alpha);
}

function fillCircle(buffer, cx, cy, radius, color, alpha = 1) {
  const startX = Math.max(0, Math.floor(cx - radius));
  const endX = Math.min(WIDTH - 1, Math.ceil(cx + radius));
  const startY = Math.max(0, Math.floor(cy - radius));
  const endY = Math.min(HEIGHT - 1, Math.ceil(cy + radius));
  const r2 = radius * radius;

  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) blendPixel(buffer, x, y, color, alpha);
    }
  }
}

function drawLine(buffer, x0, y0, x1, y1, color, alpha = 1, thickness = 1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  for (let step = 0; step <= steps; step += 1) {
    const t = step / Math.max(steps, 1);
    const x = x0 + dx * t;
    const y = y0 + dy * t;
    if (thickness <= 1) blendPixel(buffer, x, y, color, alpha);
    else fillCircle(buffer, x, y, thickness / 2, color, alpha);
  }
}

function drawText(buffer, text, x, y, color, scale = 2, alpha = 1) {
  let cursor = x;
  for (const character of text.toUpperCase()) {
    const glyph = font[character] ?? font[" "];
    for (let gy = 0; gy < glyph.length; gy += 1) {
      for (let gx = 0; gx < glyph[gy].length; gx += 1) {
        if (glyph[gy][gx] === "1") {
          fillRect(buffer, cursor + gx * scale, y + gy * scale, scale, scale, color, alpha);
        }
      }
    }
    cursor += 6 * scale;
  }
}

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

const random = seededRandom(4266);
const stars = Array.from({ length: 190 }, () => ({
  x: Math.round(random() * WIDTH),
  y: Math.round(45 + random() * (HEIGHT - 90)),
  size: random() > 0.9 ? 2 : 1,
  alpha: 0.14 + random() * 0.22,
}));

function makeBaseFrame() {
  const buffer = Buffer.alloc(WIDTH * HEIGHT * 3);

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const nx = x / WIDTH;
      const ny = y / HEIGHT;
      const glowA = Math.max(0, 1 - Math.hypot(nx - 0.74, ny - 0.34) / 0.54);
      const glowB = Math.max(0, 1 - Math.hypot(nx - 0.26, ny - 0.7) / 0.46);
      const vignette = Math.max(0, Math.hypot(nx - 0.5, ny - 0.54) - 0.38);
      const index = (y * WIDTH + x) * 3;

      buffer[index] = clamp(3 + glowA * 8 + glowB * 10 - vignette * 20);
      buffer[index + 1] = clamp(9 + glowA * 36 + glowB * 18 - vignette * 18);
      buffer[index + 2] = clamp(20 + glowA * 70 + glowB * 72 - vignette * 16);
    }
  }

  for (const star of stars) {
    fillRect(buffer, star.x, star.y, star.size, star.size, palette.white, star.alpha);
  }

  return buffer;
}

const baseFrame = makeBaseFrame();

function drawGrid(buffer, phase) {
  const shift = Math.sin(phase * TAU) * 18;
  const pulse = 0.06 + (Math.sin(phase * TAU * 2) + 1) * 0.025;

  for (let x = -80; x < WIDTH + 180; x += 80) {
    drawLine(buffer, x + shift, 90, x - 140 + shift, HEIGHT - 28, palette.soft, pulse, 1);
  }

  for (let y = 100; y < HEIGHT - 35; y += 68) {
    drawLine(buffer, 0, y + Math.cos(phase * TAU) * 7, WIDTH, y + Math.sin(phase * TAU) * 5, palette.soft, 0.055, 1);
  }

  for (let x = 48; x < WIDTH; x += 110) {
    for (let y = 90; y < HEIGHT; y += 116) {
      const shimmer = 0.08 + 0.08 * Math.max(0, Math.sin(phase * TAU + x * 0.01 + y * 0.008));
      drawLine(buffer, x - 9, y, x + 9, y, palette.white, shimmer, 1);
      drawLine(buffer, x, y - 9, x, y + 9, palette.white, shimmer, 1);
    }
  }
}

function drawIcon(buffer, icon, x, y, color, alpha) {
  if (icon === "camera") {
    strokeRect(buffer, x, y + 7, 38, 25, color, alpha, 2);
    fillRect(buffer, x + 8, y + 2, 15, 7, color, alpha);
    fillCircle(buffer, x + 19, y + 20, 7, color, alpha * 0.45);
    fillCircle(buffer, x + 19, y + 20, 3, color, alpha);
  }

  if (icon === "fire") {
    drawLine(buffer, x + 18, y + 35, x + 9, y + 20, color, alpha, 2);
    drawLine(buffer, x + 9, y + 20, x + 18, y + 6, color, alpha, 2);
    drawLine(buffer, x + 18, y + 6, x + 28, y + 20, color, alpha, 2);
    drawLine(buffer, x + 28, y + 20, x + 18, y + 35, color, alpha, 2);
    drawLine(buffer, x + 18, y + 30, x + 15, y + 20, palette.amber, alpha * 0.8, 2);
    drawLine(buffer, x + 15, y + 20, x + 21, y + 13, palette.amber, alpha * 0.8, 2);
  }

  if (icon === "access") {
    drawLine(buffer, x + 20, y + 3, x + 35, y + 10, color, alpha, 2);
    drawLine(buffer, x + 35, y + 10, x + 31, y + 29, color, alpha, 2);
    drawLine(buffer, x + 31, y + 29, x + 20, y + 38, color, alpha, 2);
    drawLine(buffer, x + 20, y + 38, x + 9, y + 29, color, alpha, 2);
    drawLine(buffer, x + 9, y + 29, x + 5, y + 10, color, alpha, 2);
    drawLine(buffer, x + 5, y + 10, x + 20, y + 3, color, alpha, 2);
    drawLine(buffer, x + 12, y + 21, x + 18, y + 27, color, alpha, 2);
    drawLine(buffer, x + 18, y + 27, x + 29, y + 15, color, alpha, 2);
  }

  if (icon === "network") {
    const nodes = [
      [x + 6, y + 28],
      [x + 20, y + 10],
      [x + 35, y + 28],
      [x + 20, y + 39],
    ];
    drawLine(buffer, nodes[0][0], nodes[0][1], nodes[1][0], nodes[1][1], color, alpha, 2);
    drawLine(buffer, nodes[1][0], nodes[1][1], nodes[2][0], nodes[2][1], color, alpha, 2);
    drawLine(buffer, nodes[2][0], nodes[2][1], nodes[3][0], nodes[3][1], color, alpha, 2);
    drawLine(buffer, nodes[3][0], nodes[3][1], nodes[0][0], nodes[0][1], color, alpha, 2);
    for (const [nx, ny] of nodes) fillCircle(buffer, nx, ny, 5, color, alpha);
  }

  if (icon === "payment") {
    strokeRect(buffer, x + 1, y + 8, 38, 25, color, alpha, 2);
    fillRect(buffer, x + 5, y + 15, 30, 3, color, alpha * 0.7);
    drawText(buffer, "UPI", x + 9, y + 22, color, 1, alpha);
  }
}

function drawServiceCard(buffer, card, phase) {
  const float = Math.sin(phase * TAU + card.offset) * 9;
  const x = card.x + Math.cos(phase * TAU + card.offset) * 6;
  const y = card.y + float;
  const w = 184;
  const h = 112;
  const active = 0.55 + Math.max(0, Math.sin(phase * TAU + card.offset)) * 0.3;

  fillRect(buffer, x - 10, y - 10, w + 20, h + 20, card.color, 0.035 * active);
  fillRect(buffer, x, y, w, h, palette.white, 0.055);
  strokeRect(buffer, x, y, w, h, card.color, 0.42, 2);
  fillRect(buffer, x + 14, y + 14, 54, 54, card.color, 0.13);
  strokeRect(buffer, x + 14, y + 14, 54, 54, card.color, 0.24, 2);
  drawIcon(buffer, card.icon, x + 23, y + 22, card.color, 0.8);
  drawText(buffer, card.label, x + 78, y + 22, palette.white, 2, 0.86);
  drawText(buffer, card.meta, x + 78, y + 47, palette.soft, 1, 0.68);
  fillRect(buffer, x + 78, y + 74, 82 + active * 42, 4, card.color, 0.7);
  fillRect(buffer, x + 78, y + 86, 58, 3, palette.white, 0.22);
  fillCircle(buffer, x + w - 18, y + 18, 5, card.color, 0.75);
}

function drawMarketplaceLayer(buffer, phase) {
  const center = [390 + Math.sin(phase * TAU) * 16, 425 + Math.cos(phase * TAU) * 10];
  const nodes = [
    [300, 320],
    [360, 256],
    [438, 302],
    [498, 380],
    [426, 494],
    [318, 512],
    [244, 430],
  ];

  fillCircle(buffer, center[0], center[1], 58, palette.cyan, 0.055);
  fillCircle(buffer, center[0], center[1], 10, palette.cyan, 0.72);
  drawText(buffer, "CITY MATCH", center[0] - 62, center[1] + 24, palette.white, 2, 0.6);

  for (const [index, node] of nodes.entries()) {
    const swayX = node[0] + Math.sin(phase * TAU + index) * 10;
    const swayY = node[1] + Math.cos(phase * TAU + index * 0.7) * 8;
    const alpha = 0.28 + Math.max(0, Math.sin(phase * TAU + index)) * 0.35;
    drawLine(buffer, center[0], center[1], swayX, swayY, palette.cyan, 0.16, 2);
    fillCircle(buffer, swayX, swayY, 13, palette.indigo, 0.09);
    fillCircle(buffer, swayX, swayY, 5, palette.cyan, alpha);
  }
}

function drawMilestoneRail(buffer, phase) {
  const x = 585;
  const y = 610 + Math.sin(phase * TAU) * 5;
  fillRect(buffer, x, y, 520, 44, palette.white, 0.045);
  strokeRect(buffer, x, y, 520, 44, palette.cyan, 0.22, 2);
  drawText(buffer, "KYC", x + 24, y + 15, palette.white, 2, 0.72);
  drawText(buffer, "SCOPE", x + 116, y + 15, palette.white, 2, 0.72);
  drawText(buffer, "MILESTONE", x + 236, y + 15, palette.white, 2, 0.72);
  drawText(buffer, "PAID", x + 425, y + 15, palette.white, 2, 0.72);

  const progress = (phase * 520) % 520;
  fillRect(buffer, x, y + 39, progress, 4, palette.emerald, 0.78);
}

function renderFrame(frameIndex) {
  const phase = frameIndex / TOTAL_FRAMES;
  const buffer = Buffer.from(baseFrame);
  const scanX = ((phase * 1.35) % 1) * (WIDTH + 260) - 130;

  drawGrid(buffer, phase);
  drawMarketplaceLayer(buffer, phase);

  const serviceCards = [
    { label: "CCTV", meta: "NVR ANALYTICS", icon: "camera", x: 708, y: 132, color: palette.cyan, offset: 0 },
    { label: "FIRE SAFETY", meta: "NOC READY", icon: "fire", x: 930, y: 178, color: palette.amber, offset: 1.1 },
    { label: "ACCESS", meta: "BIOMETRIC", icon: "access", x: 744, y: 358, color: palette.indigo, offset: 2.2 },
    { label: "NETWORK", meta: "FIBER POE", icon: "network", x: 970, y: 388, color: palette.cyan, offset: 3.3 },
    { label: "UPI ESCROW", meta: "MILESTONE", icon: "payment", x: 512, y: 178, color: palette.emerald, offset: 4.2 },
  ];

  for (const card of serviceCards) drawServiceCard(buffer, card, phase);
  drawMilestoneRail(buffer, phase);

  fillRect(buffer, scanX, 70, 28, HEIGHT - 110, palette.white, 0.025);
  fillRect(buffer, scanX + 28, 70, 2, HEIGHT - 110, palette.cyan, 0.22);
  drawLine(buffer, scanX - 90, 128, scanX + 140, 128, palette.cyan, 0.15, 1);
  drawLine(buffer, scanX - 120, 580, scanX + 120, 580, palette.cyan, 0.12, 1);

  drawText(buffer, "ELV CONNECT MARKETPLACE", 70, 112, palette.soft, 2, 0.18);
  drawText(buffer, "VERIFIED WORK  LIVE CITY DEMAND  TRUSTED PAYOUTS", 70, 644, palette.white, 2, 0.2);

  return buffer;
}

function waitForProcess(child, label) {
  return new Promise((resolvePromise, rejectPromise) => {
    child.once("error", rejectPromise);
    child.once("close", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${label} failed with exit code ${code}`));
    });
  });
}

async function streamFrames(child) {
  for (let frame = 0; frame < TOTAL_FRAMES; frame += 1) {
    const rawFrame = renderFrame(frame);
    if (!child.stdin.write(rawFrame)) await once(child.stdin, "drain");
  }
  child.stdin.end();
}

async function encodeVideo(label, outputPath, codecArgs) {
  console.log(`Encoding ${label} -> ${outputPath}`);
  const child = spawn(
    ffmpegPath,
    [
      "-y",
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgb24",
      "-s:v",
      `${WIDTH}x${HEIGHT}`,
      "-r",
      String(FPS),
      "-i",
      "-",
      "-an",
      ...codecArgs,
      outputPath,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );

  await Promise.all([streamFrames(child), waitForProcess(child, label)]);
}

async function encodePoster() {
  console.log(`Encoding poster -> ${outPoster}`);
  const child = spawn(
    ffmpegPath,
    [
      "-y",
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgb24",
      "-s:v",
      `${WIDTH}x${HEIGHT}`,
      "-i",
      "-",
      "-frames:v",
      "1",
      "-update",
      "1",
      outPoster,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );

  child.stdin.write(renderFrame(0));
  child.stdin.end();
  await waitForProcess(child, "poster");
}

function reportAsset(path) {
  const sizeMb = statSync(path).size / 1024 / 1024;
  console.log(`${path} (${sizeMb.toFixed(2)} MB)`);
}

async function main() {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static did not provide a binary path.");
  }

  mkdirSync(outputDir, { recursive: true });
  await encodePoster();
  await encodeVideo("webm", outWebm, ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "35", "-pix_fmt", "yuv420p"]);
  await encodeVideo("mp4", outMp4, ["-c:v", "libx264", "-preset", "medium", "-crf", "27", "-movflags", "+faststart", "-pix_fmt", "yuv420p"]);

  reportAsset(outPoster);
  reportAsset(outWebm);
  reportAsset(outMp4);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
