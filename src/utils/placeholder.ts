/**
 * Inline SVG used when a listing has no photos of its own.
 * Kept as a data URI so it works without an extra network request.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" role="img" aria-label="No photos provided">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1280" y2="800" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0b1d33"/>
      <stop offset="1" stop-color="#071322"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="800" fill="url(#bg)"/>
  <g opacity="0.18" stroke="#2c7dff" stroke-width="2" fill="none">
    <path d="M0 640h1280M0 560h1280M0 480h1280M0 400h1280"/>
  </g>
  <g transform="translate(640 360)" fill="none" stroke="#5a9bff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-150 40v-56l40-70h220l40 70v56"/>
    <path d="M-170 40h340"/>
    <circle cx="-95" cy="52" r="30" fill="#0b1d33"/>
    <circle cx="95" cy="52" r="30" fill="#0b1d33"/>
    <path d="M-110-16h220"/>
  </g>
  <text x="640" y="540" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="600" fill="#e8f0ff">Photos coming soon</text>
  <text x="640" y="590" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#7d8a9b">The seller has not uploaded photos for this listing yet.</text>
</svg>`;

export const CAR_PLACEHOLDER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
