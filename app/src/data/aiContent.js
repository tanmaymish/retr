// AI-generated screen content is written to ./ai/*.json by the GitHub Action
// (ai/run-all.mjs, .github/workflows/ai-pipeline.yml) — it does not exist in a
// fresh checkout until that workflow has run at least once. import.meta.glob
// (unlike a static import) does not fail the build when a file is absent, so
// every AI-driven screen falls back to its original wireframe copy until then.
const modules = import.meta.glob('./ai/*.json', { eager: true });

function load(name) {
  const mod = modules[`./ai/${name}.json`];
  return mod ? mod.default ?? mod : null;
}

export const advisorContent = load('advisor');
export const fitExplanationsContent = load('fit-explanations');
export const faqContent = load('faq');
