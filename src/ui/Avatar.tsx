import type { Avatar as AvatarData } from '../content/schema.ts';

const INK = '#1f2330';

function hairPath(style: AvatarData['hair_style'], color: string) {
  switch (style) {
    case 'long':
      return <path d="M9 26 Q8 9 22 10 Q36 9 35 26 L33 34 L31 20 Q22 15 13 20 L11 34Z" fill={color} />;
    case 'bun':
      return (
        <g fill={color}>
          <circle cx="22" cy="8" r="5" />
          <path d="M9 24 Q10 11 22 11 Q34 11 35 24 L31 18 Q22 15 13 18Z" />
        </g>
      );
    case 'none':
      return null;
    case 'short':
      return <path d="M9 24 Q10 9 22 9 Q34 9 35 24 L31 18 Q22 14 13 18Z" fill={color} />;
  }
}

/** Simple drawn faces from cast data (no image files, no real people). Decorative: the name is shown as text. */
export function Avatar({ avatar }: { avatar: AvatarData }) {
  if (avatar.kind === 'dog') {
    return (
      <svg viewBox="0 0 44 44" aria-hidden="true" focusable="false">
        <rect width="44" height="44" fill="#f3ead6" />
        <ellipse cx="11" cy="20" rx="6" ry="11" fill="#7a5430" />
        <ellipse cx="33" cy="20" rx="6" ry="11" fill="#7a5430" />
        <circle cx="22" cy="25" r="13" fill="#c99a63" />
        <ellipse cx="22" cy="31" rx="7" ry="5" fill="#f3e0c0" />
        <circle cx="22" cy="28" r="2.6" fill={INK} />
        <circle cx="17" cy="22" r="1.8" fill={INK} />
        <circle cx="27" cy="22" r="1.8" fill={INK} />
        <path d="M12 13 L32 13 L30 8 L14 8Z" fill="#2d3f55" />
      </svg>
    );
  }
  if (avatar.kind === 'unknown') {
    return (
      <svg viewBox="0 0 44 44" aria-hidden="true" focusable="false">
        <rect width="44" height="44" fill="#5d6273" />
        <circle cx="22" cy="18" r="8" fill="#c9ccd3" />
        <path d="M8 44 Q8 28 22 28 Q36 28 36 44Z" fill="#c9ccd3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" focusable="false">
      <rect width="44" height="44" fill="#f3ead6" />
      <circle cx="22" cy="26" r="13" fill={avatar.skin} />
      {hairPath(avatar.hair_style, avatar.hair)}
      <circle cx="17" cy="26" r="1.8" fill={INK} />
      <circle cx="27" cy="26" r="1.8" fill={INK} />
      <path d="M18 31 q4 3 8 0" stroke={INK} stroke-width="1.6" fill="none" />
      {avatar.band && <rect x="12" y="10" width="20" height="5" rx="2" fill={avatar.band} />}
    </svg>
  );
}
