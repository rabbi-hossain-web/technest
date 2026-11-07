import { cn } from '@/lib/utils';
import type { ArtKind } from '@/types';

/**
 * Lightweight vector illustrations used as a fallback when a product or category
 * has no uploaded (Cloudinary) image yet.
 */
export function ProductArt({ kind = 'accessories', className }: { kind?: ArtKind | string; className?: string }) {
  // Same-kind gradients are identical, so a shared id per kind is safe even with many instances on a page.
  const g = `tn-grad-${kind}`;
  const common = { viewBox: '0 0 200 160', className: cn('block h-auto w-full', className), 'aria-hidden': true } as const;
  const stroke = '#64748B';

  switch (kind) {
    case 'laptop':
      return (
        <svg {...common}>
          <defs><linearGradient id={g} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#172554" /><stop offset=".5" stopColor="#2563EB" /><stop offset="1" stopColor="#C026D3" /></linearGradient></defs>
          <rect x="36" y="26" width="128" height="86" rx="7" fill="#111827" stroke={stroke} strokeWidth="1.5" />
          <rect x="42" y="32" width="116" height="74" rx="2" fill={`url(#${g})`} />
          <path d="M56 96 C82 62 118 60 150 40" stroke="#93C5FD" strokeOpacity=".55" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M20 114 H180 L172 124 Q170 126 166 126 H34 Q30 126 28 124 Z" fill="#D7DEE8" />
          <rect x="86" y="114" width="28" height="4" rx="2" fill="#A3B1C2" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common}>
          <defs><linearGradient id={g} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1E1B4B" /><stop offset=".55" stopColor="#6D28D9" /><stop offset="1" stopColor="#F0ABFC" /></linearGradient></defs>
          <rect x="50" y="18" width="58" height="128" rx="12" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="56" y="24" width="28" height="30" rx="8" fill="#94A3B8" />
          <circle cx="64" cy="33" r="5" fill="#1F2937" /><circle cx="75" cy="45" r="5" fill="#1F2937" />
          <rect x="92" y="10" width="62" height="136" rx="12" fill="#1F2937" stroke={stroke} strokeWidth="1.5" />
          <rect x="97" y="15" width="52" height="126" rx="8" fill={`url(#${g})`} />
          <rect x="113" y="19" width="20" height="6" rx="3" fill="#0B0F19" />
        </svg>
      );
    case 'headphones':
      return (
        <svg {...common}>
          <path d="M50 98 V80 a50 50 0 0 1 100 0 V98" fill="none" stroke="#1F2937" strokeWidth="12" strokeLinecap="round" />
          <path d="M50 98 V80 a50 50 0 0 1 100 0 V98" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <rect x="32" y="84" width="36" height="60" rx="17" fill="#111827" stroke={stroke} strokeWidth="1.5" />
          <rect x="132" y="84" width="36" height="60" rx="17" fill="#111827" stroke={stroke} strokeWidth="1.5" />
          <rect x="60" y="94" width="10" height="40" rx="5" fill="#374151" />
          <rect x="130" y="94" width="10" height="40" rx="5" fill="#374151" />
        </svg>
      );
    case 'watch':
      return (
        <svg {...common}>
          <rect x="80" y="4" width="40" height="40" rx="8" fill="#1F2937" />
          <rect x="80" y="116" width="40" height="40" rx="8" fill="#1F2937" />
          <rect x="66" y="34" width="68" height="92" rx="19" fill="#111827" stroke={stroke} strokeWidth="2" />
          <rect x="72" y="40" width="56" height="80" rx="14" fill="#000" />
          <text x="100" y="84" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="19" fontWeight="600" fill="#fff">10:09</text>
          <circle cx="88" cy="104" r="5" fill="none" stroke="#22C55E" strokeWidth="2" />
          <circle cx="112" cy="104" r="5" fill="none" stroke="#F97316" strokeWidth="2" />
          <rect x="134" y="66" width="4" height="16" rx="2" fill={stroke} />
        </svg>
      );
    case 'earbuds':
      return (
        <svg {...common}>
          <rect x="50" y="56" width="100" height="80" rx="28" fill="#fff" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M52 84 H148" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="100" cy="108" r="3" fill="#94A3B8" />
          <path d="M74 58 C70 42 74 26 86 26 C96 26 98 36 92 44 L84 58 Z" fill="#fff" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M126 58 C130 42 126 26 114 26 C104 26 102 36 108 44 L116 58 Z" fill="#fff" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="86" cy="34" r="3" fill="#475569" /><circle cx="114" cy="34" r="3" fill="#475569" />
        </svg>
      );
    case 'tablet':
      return (
        <svg {...common}>
          <defs><linearGradient id={g} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1D4ED8" /><stop offset=".6" stopColor="#60A5FA" /><stop offset="1" stopColor="#A78BFA" /></linearGradient></defs>
          <rect x="46" y="12" width="108" height="136" rx="10" fill="#1F2937" stroke={stroke} strokeWidth="1.5" />
          <rect x="52" y="18" width="96" height="124" rx="4" fill={`url(#${g})`} />
        </svg>
      );
    case 'gamepad':
      return (
        <svg {...common}>
          <path d="M58 50 H142 C162 50 172 68 178 94 C184 122 176 136 162 134 C150 132 144 116 134 110 H66 C56 116 50 132 38 134 C24 136 16 122 22 94 C28 68 38 50 58 50 Z" fill="#1F2937" stroke={stroke} strokeWidth="1.5" />
          <path d="M52 78 h8 v-8 h8 v8 h8 v8 h-8 v8 h-8 v-8 h-8 z" fill="#94A3B8" />
          <circle cx="140" cy="70" r="5" fill="#94A3B8" /><circle cx="152" cy="82" r="5" fill="#94A3B8" /><circle cx="128" cy="82" r="5" fill="#94A3B8" /><circle cx="140" cy="94" r="5" fill="#94A3B8" />
          <circle cx="82" cy="104" r="9" fill="#0B0F19" stroke={stroke} strokeWidth="1.5" />
          <circle cx="118" cy="104" r="9" fill="#0B0F19" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case 'console':
      return (
        <svg {...common}>
          <path d="M62 14 Q62 8 70 8 H96 V152 H70 Q62 152 62 144 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M104 8 H130 Q138 8 138 14 V144 Q138 152 130 152 H104 Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="94" y="8" width="12" height="144" fill="#111827" />
          <path d="M120 110 h36 c10 0 16 8 18 20 c2 10-4 14-10 10 c-4-3-6-8-12-8 h-28 c-6 0-8 5-12 8 c-6 4-12 0-10-10 c2-12 8-20 18-20z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
        </svg>
      );
    case 'camera':
      return (
        <svg {...common}>
          <path d="M40 54 H74 L82 40 H118 L126 54 H160 Q170 54 170 64 V128 Q170 138 160 138 H40 Q30 138 30 128 V64 Q30 54 40 54 Z" fill="#1F2937" stroke={stroke} strokeWidth="1.5" />
          <circle cx="100" cy="96" r="33" fill="#0B0F19" stroke={stroke} strokeWidth="3" />
          <circle cx="100" cy="96" r="21" fill="#1E3A8A" />
          <circle cx="100" cy="96" r="9" fill="#0B0F19" />
          <circle cx="92" cy="88" r="4" fill="#93C5FD" opacity=".7" />
          <rect x="42" y="62" width="16" height="8" rx="2" fill="#475569" />
          <circle cx="152" cy="68" r="4" fill="#EF4444" />
        </svg>
      );
    case 'mouse':
      return (
        <svg {...common}>
          <path d="M100 18 C132 18 144 48 144 86 C144 126 124 144 100 144 C76 144 56 126 56 86 C56 48 68 18 100 18 Z" fill="#1F2937" stroke={stroke} strokeWidth="1.5" />
          <path d="M100 18 V62" stroke={stroke} strokeWidth="2" />
          <rect x="96" y="32" width="8" height="18" rx="4" fill="#94A3B8" />
        </svg>
      );
    case 'speaker':
      return (
        <svg {...common}>
          <rect x="58" y="12" width="84" height="136" rx="16" fill="#1F2937" stroke={stroke} strokeWidth="1.5" />
          <circle cx="100" cy="50" r="20" fill="#0B0F19" stroke={stroke} strokeWidth="2" />
          <circle cx="100" cy="104" r="29" fill="#0B0F19" stroke={stroke} strokeWidth="2" />
          <circle cx="100" cy="104" r="10" fill="#334155" />
        </svg>
      );
    case 'keyboard':
      return (
        <svg {...common}>
          <rect x="14" y="50" width="172" height="64" rx="8" fill="#1F2937" stroke={stroke} strokeWidth="1.5" />
          <path d="M26 64 H174 M26 78 H174" stroke={stroke} strokeWidth="9" strokeDasharray="10 4" />
          <path d="M26 96 H60 M140 96 H174" stroke={stroke} strokeWidth="9" strokeDasharray="10 4" />
          <rect x="66" y="91" width="68" height="10" rx="2" fill={stroke} />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="52" y="18" width="58" height="124" rx="12" fill="#1F2937" stroke={stroke} strokeWidth="1.5" />
          <circle cx="81" cy="36" r="3" fill="#38BDF8" /><circle cx="81" cy="46" r="3" fill="#38BDF8" />
          <path d="M136 46 V74 C136 96 152 96 152 118 V146" stroke="#E2E8F0" strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="128" y="34" width="16" height="16" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
        </svg>
      );
  }
}
