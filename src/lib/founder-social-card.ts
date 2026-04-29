import type { Language } from '@/lib/i18n';
import { t } from '@/lib/translations';

export const FOUNDER_SPRINT_SURFACES = ['play', 'start', 'pilot', 'help'] as const;
export type FounderSprintSurface = (typeof FOUNDER_SPRINT_SURFACES)[number];

export function isFounderSprintSurface(value: string | null | undefined): value is FounderSprintSurface {
  return FOUNDER_SPRINT_SURFACES.includes(value as FounderSprintSurface);
}

export function normalizeFounderSprintSurface(value: string | null | undefined): FounderSprintSurface {
  return isFounderSprintSurface(value) ? value : 'pilot';
}

export function getFounderSprintOgImagePath(
  lang: Language,
  surface: FounderSprintSurface,
): string {
  return `/api/og/founder-sprint.svg?lang=${lang}&surface=${surface}`;
}

export function getFounderSprintCardContent(
  lang: Language,
  surface: FounderSprintSurface,
): {
  eyebrow: string;
  title: string;
  description: string;
  label: string;
  chips: string[];
  gradientStart: string;
  gradientEnd: string;
  accent: string;
  accentSoft: string;
} {
  switch (surface) {
    case 'play':
      return {
        eyebrow: t(lang, 'reservations.quickStartEyebrow'),
        title: t(lang, 'reservations.quickStartTitle'),
        description: t(lang, 'reservations.quickStartDescription'),
        label: 'QR + flyer entry',
        chips: [
          t(lang, 'reservations.viewSportsReservations'),
          t(lang, 'reservations.rulesCta'),
          t(lang, 'reservations.viewTransparencyDashboard'),
        ],
        gradientStart: '#eef8fd',
        gradientEnd: '#fff5ea',
        accent: '#0b77a8',
        accentSoft: '#d6eef8',
      };
    case 'start':
      return {
        eyebrow: t(lang, 'community.startEyebrow'),
        title: t(lang, 'community.startTitle'),
        description: t(lang, 'community.startDescription'),
        label: 'Local onboarding',
        chips: [
          t(lang, 'reservations.viewSportsReservations'),
          t(lang, 'community.filterMeetup'),
          t(lang, 'reservations.contactCta'),
        ],
        gradientStart: '#f4fbff',
        gradientEnd: '#fff5ea',
        accent: '#006d9b',
        accentSoft: '#d9f0f8',
      };
    case 'pilot':
    default:
      return {
        eyebrow: t(lang, 'community.pilotUpdateEyebrow'),
        title: t(lang, 'community.pilotUpdateTitle'),
        description: t(lang, 'community.pilotUpdateDescription'),
        label: 'Public status update',
        chips: [
          t(lang, 'community.startCta'),
          t(lang, 'reservations.viewTransparencyDashboard'),
          t(lang, 'reservations.contactCta'),
        ],
        gradientStart: '#eef8fd',
        gradientEnd: '#fff4ec',
        accent: '#0a6f95',
        accentSoft: '#dff2f8',
      };
    case 'help':
      return {
        eyebrow: t(lang, 'community.helpEyebrow'),
        title: t(lang, 'community.helpTitle'),
        description: t(lang, 'community.helpDescription'),
        label: 'Supporter action page',
        chips: [
          t(lang, 'community.startCta'),
          t(lang, 'community.pilotUpdateCta'),
          t(lang, 'reservations.contactCta'),
        ],
        gradientStart: '#f4fbff',
        gradientEnd: '#fff5ea',
        accent: '#0b6f92',
        accentSoft: '#d9eef7',
      };
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function splitText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word);
      current = '';
    }

    if (lines.length === maxLines - 1) {
      const rest = [current, ...words.slice(index + 1)].filter(Boolean).join(' ');
      if (rest) {
        const truncated = rest.length > maxChars ? `${rest.slice(0, maxChars - 1).trimEnd()}…` : rest;
        lines.push(truncated);
      }
      return lines;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, maxLines);
}

function renderChip(label: string, x: number, y: number, accent: string, accentSoft: string): string {
  const width = Math.max(164, 40 + Math.round(label.length * 9.2));

  return `
    <g transform="translate(${x} ${y})">
      <rect width="${width}" height="46" rx="23" fill="${accentSoft}" />
      <text x="22" y="30" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="${accent}">
        ${escapeXml(label)}
      </text>
    </g>
  `;
}

export function renderFounderSprintCardSvg(
  lang: Language,
  surface: FounderSprintSurface,
): string {
  const content = getFounderSprintCardContent(lang, surface);
  const titleLines = splitText(content.title, 22, 3);
  const descriptionLines = splitText(content.description, 52, 3);
  const chipMarkup: string[] = [];
  let x = 84;

  for (const chip of content.chips) {
    chipMarkup.push(renderChip(chip, x, 500, content.accent, content.accentSoft));
    x += Math.max(164, 40 + Math.round(chip.length * 9.2)) + 14;
  }

  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(content.title)}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
          <stop stop-color="${content.gradientStart}" />
          <stop offset="1" stop-color="${content.gradientEnd}" />
        </linearGradient>
        <linearGradient id="panel" x1="0" y1="0" x2="932" y2="0" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF" stop-opacity="0.96" />
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0.84" />
        </linearGradient>
      </defs>

      <rect width="1200" height="630" fill="url(#bg)" />
      <circle cx="1060" cy="116" r="168" fill="${content.accentSoft}" opacity="0.75" />
      <circle cx="108" cy="584" r="132" fill="#ffffff" opacity="0.55" />
      <path d="M0 114C102 74 216 66 330 96C448 128 556 176 714 166C844 158 943 110 1045 84C1114 66 1162 68 1200 80V0H0V114Z" fill="#ffffff" opacity="0.24" />

      <rect x="54" y="50" width="1092" height="530" rx="36" fill="url(#panel)" stroke="#DCE9EF" />

      <rect x="84" y="88" width="294" height="42" rx="21" fill="${content.accentSoft}" />
      <text x="106" y="114" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="${content.accent}">
        ${escapeXml(content.eyebrow)}
      </text>

      <text x="84" y="198" font-family="'DM Serif Display', Georgia, serif" font-size="68" font-weight="400" fill="#083344">
        ${titleLines.map((line, index) => `<tspan x="84" dy="${index === 0 ? 0 : 76}">${escapeXml(line)}</tspan>`).join('')}
      </text>

      <text x="84" y="398" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="500" fill="#4B5563">
        ${descriptionLines.map((line, index) => `<tspan x="84" dy="${index === 0 ? 0 : 40}">${escapeXml(line)}</tspan>`).join('')}
      </text>

      <rect x="876" y="86" width="234" height="44" rx="22" fill="#083344" opacity="0.94" />
      <text x="993" y="113" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="#F8FAFC">
        ${escapeXml(content.label)}
      </text>

      ${chipMarkup.join('')}

      <text x="84" y="572" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="#0F172A">
        znjan.com
      </text>
      <text x="1088" y="572" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="600" fill="#475569">
        Split • Znjan Beach • Founder Sprint
      </text>
    </svg>
  `.trim();
}
