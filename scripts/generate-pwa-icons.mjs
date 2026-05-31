import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="120" fill="#020617"/>
  <circle cx="384" cy="128" r="92" fill="#2563EB" opacity="0.9"/>
  <circle cx="128" cy="384" r="110" fill="#10B981" opacity="0.85"/>
  <rect x="112" y="128" width="288" height="256" rx="48" fill="white"/>
  <rect x="152" y="180" width="208" height="32" rx="16" fill="#020617"/>
  <rect x="152" y="244" width="150" height="28" rx="14" fill="#2563EB"/>
  <rect x="152" y="304" width="110" height="28" rx="14" fill="#10B981"/>
  <text x="256" y="438" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="800" fill="white">CP</text>
</svg>
`;

await mkdir("public/icons", { recursive: true });

await sharp(Buffer.from(iconSvg))
  .resize(192, 192)
  .png()
  .toFile("public/icons/pwa-192x192.png");

await sharp(Buffer.from(iconSvg))
  .resize(512, 512)
  .png()
  .toFile("public/icons/pwa-512x512.png");

await sharp(Buffer.from(iconSvg))
  .resize(512, 512)
  .png()
  .toFile("public/icons/maskable-512x512.png");

await sharp(Buffer.from(iconSvg))
  .resize(180, 180)
  .png()
  .toFile("public/icons/apple-touch-icon.png");

console.log("PWA icons generated.");