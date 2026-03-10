export default function WebringIcon({
  color = "#1C1917",
  size = 20,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width={size}
      height={size}
      fill={color}
    >
      <title>UW Math Webring</title>

      {/* Top horizontal bar */}
      <rect x="60" y="60" width="380" height="52" rx="10" ry="10" />

      {/* Left leg — straight, with bottom serif */}
      <rect x="148" y="112" width="48" height="260" rx="8" ry="8" />
      {/* Left leg bottom serif */}
      <rect x="114" y="352" width="116" height="36" rx="8" ry="8" />

      {/* Right leg — tapers and curls outward at the bottom */}
      <path d="
        M 304,112
        C 304,112 316,112 328,112
        C 340,112 352,120 352,132
        L 352,300
        C 352,340 364,370 390,392
        C 408,408 428,414 440,406
        C 452,398 454,382 444,368
        C 436,357 424,352 416,344
        C 396,324 388,296 388,260
        L 388,132
        C 388,120 376,112 364,112
        Z
      " />
    </svg>
  );
}
