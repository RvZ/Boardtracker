export const CHART_COLORS = {
  ice: '#38bdf8',
  iceLight: '#7dd3fc',
  powder: '#a78bfa',
  fire: '#f97316',
  pine: '#34d399',
  snow: '#dce4f5',
  peak: '#1a2235',
};

export const RESORT_COLORS = [
  '#38bdf8',
  '#a78bfa',
  '#f97316',
  '#34d399',
  '#f472b6',
  '#fbbf24',
  '#818cf8',
  '#fb923c',
];

export function getResortColor(index: number): string {
  return RESORT_COLORS[index % RESORT_COLORS.length];
}
