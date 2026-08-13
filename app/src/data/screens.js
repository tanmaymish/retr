import data from './screens.json';

export const turns = data.turns;

export function findScreen(id) {
  for (const turn of turns) {
    const screen = turn.screens.find((s) => s.id === id);
    if (screen) return { turn, screen };
  }
  return null;
}

export function flatScreens() {
  return turns.flatMap((t) => t.screens.map((s) => ({ ...s, turn: t })));
}

export function neighbours(id) {
  const all = flatScreens();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

// Pull one panel's raw markup out of a wireframe screen, for reuse inside the
// real app shell (e.g. the Wealth/Vault tabs reuse 2a's panels directly).
export function getPanelHtml(id, panelIndex = 0) {
  const found = findScreen(id);
  return found?.screen.panels[panelIndex]?.html ?? null;
}
