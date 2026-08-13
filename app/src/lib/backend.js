import { QUESTIONS, scorePreparedness } from '../../../shared/preparedness.js';
import { ApiError, api } from './api';

/**
 * Where the site gets its answers from.
 *
 * The full application runs against its own API. The portfolio site can also be
 * built as a static bundle — for GitHub Pages, or any host that serves files
 * and nothing else — and then there is no API to call. This module is the one
 * place that difference lives.
 *
 * Two things have to keep working without a server:
 *
 * - **The preparedness check.** Its scoring is a pure function in
 *   `shared/preparedness.js`, imported by the server and, in a static build, by
 *   the browser. Identical scoring either way; the same file, not a copy.
 * - **Enquiries.** A static build posts them to whatever endpoint
 *   `VITE_LEADS_ENDPOINT` names — a form service, or the firm's own API. If
 *   nothing is configured, the form says so instead of pretending to send.
 */

export const isStatic = import.meta.env.VITE_STATIC === 'true';

const LEADS_ENDPOINT = import.meta.env.VITE_LEADS_ENDPOINT ?? '';

/** True when a static build has somewhere to send an enquiry. */
export const canSubmitLeads = !isStatic || Boolean(LEADS_ENDPOINT);

const DISCLAIMER =
  'Six questions, scored in your browser. Nothing you enter here is stored, and the result is an indicative self-assessment rather than advice.';

/** The questions, with the option scores stripped exactly as the API strips them. */
export function localQuestions() {
  return {
    questions: QUESTIONS.map((q) => ({
      key: q.key,
      question: q.question,
      help: q.help ?? null,
      options: q.options.map((o) => ({ value: o.value, label: o.label })),
    })),
    disclaimer: DISCLAIMER,
  };
}

export async function scoreCheck(answers) {
  if (isStatic) return scorePreparedness(answers);
  return api.post('/preparedness/score', answers);
}

export async function submitLead(payload) {
  if (!isStatic) return api.post('/leads', payload);

  if (!LEADS_ENDPOINT) {
    throw new ApiError({
      status: 0,
      code: 'no_endpoint',
      message: 'This site is not yet connected to an inbox, so nothing was sent.',
    });
  }

  const response = await fetch(LEADS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      code: 'lead_failed',
      message: 'That did not reach us. Please try again, or write to us directly.',
    });
  }

  // Form services answer in their own shapes; a reference is nice to have, not
  // something to invent when it is missing.
  const body = await response.json().catch(() => ({}));
  return { ok: true, reference: body.reference ?? body.id ?? null };
}
