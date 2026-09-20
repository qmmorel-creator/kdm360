export const ROUTES = [
  { id: 'today', label: "Aujourd'hui", num: '01' },
  { id: 'budget', label: 'Budget', num: '02' },
  { id: 'health', label: 'Santé', num: '03' },
  { id: 'sport', label: 'Sport', num: '04' },
  { id: 'social', label: 'Social', num: '05' },
  { id: 'explorer', label: 'Explorer', num: '06' },
  { id: 'settings', label: 'Réglages', num: '07' },
] as const;

export type RouteId = (typeof ROUTES)[number]['id'];
