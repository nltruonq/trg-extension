/** Bộ trang trí khung tin nhắn. Nhân vật được vẽ bằng SVG nhúng thẳng trong code
 *  nên không cần file ảnh kèm theo và không vướng bản quyền hình của bên thứ ba. */

export interface SideTheme {
  /** Màu viền khung. */
  frame: string;
  /** Nền bong bóng. */
  background: string;
  /** Màu chữ. */
  text: string;
  /** Nhân vật ngồi ở góc, dạng SVG thô. */
  character: string;
}

export interface BubbleTheme {
  id: string;
  label: string;
  /** Tin nhắn của người khác. */
  in: SideTheme;
  /** Tin nhắn của bạn. */
  out: SideTheme;
}

export const DEFAULT_THEME_ID = "none";

interface Palette {
  body: string;
  dark: string;
  light: string;
  ink: string;
}

const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>`;

const blush = (ink: string) =>
  `<circle cx="16" cy="46" r="3.4" fill="${ink}" opacity=".25"/>` +
  `<circle cx="48" cy="46" r="3.4" fill="${ink}" opacity=".25"/>`;

const cat = (p: Palette) =>
  svg(
    `<path d="M16 31 L13 12 L30 23 Z" fill="${p.dark}"/>` +
      `<path d="M48 31 L51 12 L34 23 Z" fill="${p.dark}"/>` +
      `<ellipse cx="32" cy="42" rx="21" ry="19" fill="${p.body}"/>` +
      `<ellipse cx="32" cy="45" rx="15" ry="12" fill="${p.light}"/>` +
      `<circle cx="25" cy="40" r="2.8" fill="${p.ink}"/>` +
      `<circle cx="39" cy="40" r="2.8" fill="${p.ink}"/>` +
      `<path d="M28 47 q4 4 8 0" stroke="${p.ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
      blush(p.ink),
  );

const dog = (p: Palette) =>
  svg(
    `<ellipse cx="13" cy="33" rx="7.5" ry="13" fill="${p.dark}"/>` +
      `<ellipse cx="51" cy="33" rx="7.5" ry="13" fill="${p.dark}"/>` +
      `<ellipse cx="32" cy="40" rx="21" ry="20" fill="${p.body}"/>` +
      `<ellipse cx="32" cy="47" rx="14" ry="11" fill="${p.light}"/>` +
      `<circle cx="25" cy="37" r="2.8" fill="${p.ink}"/>` +
      `<circle cx="39" cy="37" r="2.8" fill="${p.ink}"/>` +
      `<ellipse cx="32" cy="45" rx="3.6" ry="2.8" fill="${p.ink}"/>` +
      `<path d="M32 48 v3 M27 54 q5 3 10 0" stroke="${p.ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  );

const frog = (p: Palette) =>
  svg(
    `<ellipse cx="32" cy="44" rx="23" ry="18" fill="${p.body}"/>` +
      `<circle cx="19" cy="26" r="10" fill="${p.body}"/>` +
      `<circle cx="45" cy="26" r="10" fill="${p.body}"/>` +
      `<circle cx="19" cy="25" r="6" fill="${p.light}"/>` +
      `<circle cx="45" cy="25" r="6" fill="${p.light}"/>` +
      `<circle cx="20" cy="26" r="3" fill="${p.ink}"/>` +
      `<circle cx="44" cy="26" r="3" fill="${p.ink}"/>` +
      `<path d="M20 45 q12 10 24 0" stroke="${p.ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
      blush(p.ink),
  );

const capybara = (p: Palette) =>
  svg(
    `<ellipse cx="19" cy="25" rx="4.5" ry="3.5" fill="${p.dark}"/>` +
      `<ellipse cx="45" cy="25" rx="4.5" ry="3.5" fill="${p.dark}"/>` +
      // Đầu hộp bo góc + mõm vuông lớn là nét nhận ra capybara, khác đầu tròn của gấu.
      `<rect x="10" y="23" width="44" height="35" rx="14" fill="${p.body}"/>` +
      `<rect x="18" y="39" width="28" height="19" rx="9.5" fill="${p.light}"/>` +
      `<path d="M20 34 h7 M37 34 h7" stroke="${p.ink}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<ellipse cx="32" cy="45" rx="3.8" ry="2.4" fill="${p.ink}"/>` +
      `<path d="M32 48 v2.5 M27 53 q5 2.5 10 0" stroke="${p.ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  );

const bear = (p: Palette) =>
  svg(
    `<circle cx="15" cy="22" r="9" fill="${p.dark}"/>` +
      `<circle cx="49" cy="22" r="9" fill="${p.dark}"/>` +
      `<circle cx="15" cy="22" r="5" fill="${p.light}"/>` +
      `<circle cx="49" cy="22" r="5" fill="${p.light}"/>` +
      `<ellipse cx="32" cy="41" rx="21" ry="20" fill="${p.body}"/>` +
      `<ellipse cx="32" cy="47" rx="13" ry="10" fill="${p.light}"/>` +
      `<circle cx="25" cy="38" r="2.8" fill="${p.ink}"/>` +
      `<circle cx="39" cy="38" r="2.8" fill="${p.ink}"/>` +
      `<ellipse cx="32" cy="45" rx="3.4" ry="2.6" fill="${p.ink}"/>` +
      `<path d="M32 48 v2.5 M28 53 q4 2.5 8 0" stroke="${p.ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  );

export const THEMES: BubbleTheme[] = [
  {
    id: "meo-cho",
    label: "Mèo chó",
    in: {
      frame: "#E39A52",
      background: "#FFF8EE",
      text: "#43301F",
      character: cat({ body: "#F2B471", dark: "#E09A52", light: "#FFF6E8", ink: "#4A3426" }),
    },
    out: {
      frame: "#A9784F",
      background: "#F7EEE2",
      text: "#3A2A1C",
      character: dog({ body: "#B9834F", dark: "#8D6342", light: "#F7E4CD", ink: "#3D2A1C" }),
    },
  },
  {
    id: "ech",
    label: "Ếch",
    in: {
      frame: "#6AA84F",
      background: "#F3FAEE",
      text: "#24391B",
      character: frog({ body: "#8CC474", dark: "#6AA84F", light: "#FFFFFF", ink: "#23331F" }),
    },
    out: {
      frame: "#3F8F6B",
      background: "#EAF7F1",
      text: "#17372A",
      character: frog({ body: "#5FB38C", dark: "#3F8F6B", light: "#FFFFFF", ink: "#17312A" }),
    },
  },
  {
    id: "capybara",
    label: "Capybara",
    in: {
      frame: "#B08968",
      background: "#FBF6F0",
      text: "#3E2F22",
      character: capybara({ body: "#C49A72", dark: "#9C7452", light: "#EFDFCC", ink: "#4A3A28" }),
    },
    out: {
      frame: "#8A6B4F",
      background: "#F4EDE4",
      text: "#33261A",
      character: capybara({ body: "#A07B58", dark: "#7C5C40", light: "#E6D4BE", ink: "#3A2C1E" }),
    },
  },
  {
    id: "gau",
    label: "Gấu",
    in: {
      frame: "#C98E5E",
      background: "#FFF7F0",
      text: "#3B2A1E",
      character: bear({ body: "#D2A071", dark: "#B07C4F", light: "#FBECD9", ink: "#3B2A1E" }),
    },
    out: {
      frame: "#6E8BA8",
      background: "#F0F4F8",
      text: "#22384A",
      character: bear({ body: "#8FA9C2", dark: "#6E8BA8", light: "#E7EEF5", ink: "#22384A" }),
    },
  },
];

export function getTheme(id: string | undefined): BubbleTheme | null {
  if (!id || id === DEFAULT_THEME_ID) return null;
  return THEMES.find((theme) => theme.id === id) ?? null;
}

export function toCssUrl(rawSvg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(rawSvg)}")`;
}
