export const getVIPType = (titles?: string[]) => {
  if (!titles || titles.length === 0) return null;
  const titleStr = titles.join(' ');
  if (titleStr.includes('Glitch')) return 'glitch';
  if (titleStr.includes('Gold')) return 'gold';
  if (titleStr.includes('Neon') || titleStr.includes('VIP')) return 'neon';
  return null;
};
