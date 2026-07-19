export const getVIPType = (titles?: string[]) => {
  if (!titles || titles.length === 0) return null;
  const equippedTitle = titles[0];
  if (equippedTitle.includes('Glitch')) return 'glitch';
  if (equippedTitle.includes('Gold')) return 'gold';
  if (equippedTitle.includes('Neon') || equippedTitle.includes('VIP')) return 'neon';
  return null;
};
