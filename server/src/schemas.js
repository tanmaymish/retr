import { z } from 'zod';
import { CATEGORY_KEYS } from './engine/categories.js';

/** A calendar date, validated as a real day — 2025-02-30 is rejected. */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD.')
  .refine((value) => {
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  }, 'That is not a real date.');

const optionalDate = isoDate.nullable().optional();
const text = (max) => z.string().trim().min(1).max(max);
const optionalText = (max) => z.string().trim().max(max).nullable().optional();

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address.').max(254);

/**
 * Password policy: length over composition rules, which is what actually
 * resists guessing. Obvious passwords are rejected by name.
 */
export function passwordSchema(minLength = 12) {
  return z
    .string()
    .min(minLength, `Use at least ${minLength} characters.`)
    .max(256, 'That is longer than 256 characters.')
    .refine((value) => !/^(.)\1+$/.test(value), 'That is one character repeated.')
    .refine(
      (value) => !COMMON_PASSWORDS.has(value.toLowerCase().replace(/[^a-z0-9]/g, '')),
      'That password appears in every breach list. Choose another.',
    );
}

const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', 'passwordpassword', '123456789012', '1234567890',
  'qwertyuiop', 'letmein', 'welcome', 'iloveyou', 'administrator', 'heritageledger',
  'changeme', 'secret', 'monkey', 'dragon', 'baseball', 'football', 'qwerty123456',
]);

export const registerSchema = (minLength) =>
  z.object({
    name: text(80),
    email: emailSchema,
    password: passwordSchema(minLength),
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.').max(256),
});

export const mfaChallengeSchema = z.object({
  code: z.string().trim().min(6).max(20),
});

export const changePasswordSchema = (minLength) =>
  z.object({
    currentPassword: z.string().min(1).max(256),
    newPassword: passwordSchema(minLength),
  });

export const onboardingSchema = z.object({
  vaultProfile: z.enum(['me', 'me_partner', 'family', 'parents']).optional(),
  categories: z.array(z.enum(CATEGORY_KEYS)).max(CATEGORY_KEYS.length).optional(),
  step: z.enum(['personalization', 'categories', 'done']).optional(),
});

export const documentFieldSchema = z.object({
  label: text(60),
  value: z.string().trim().max(300),
  confidence: z.enum(['high', 'medium', 'low']).default('medium'),
  evidence: optionalText(300),
  confirmed: z.boolean().default(false),
});

export const documentMetaSchema = z.object({
  title: text(120),
  category: z.enum(CATEGORY_KEYS),
  subject: optionalText(80),
  source: z.enum(['user_uploaded', 'auto_extracted', 'source_verified']).optional(),
  issuedOn: optionalDate,
  expiresOn: optionalDate,
  renewalOn: optionalDate,
  notes: optionalText(2000),
  fields: z.array(documentFieldSchema).max(30).optional(),
});

export const documentPatchSchema = documentMetaSchema.partial();

export const documentQuerySchema = z.object({
  category: z.enum(CATEGORY_KEYS).optional(),
  search: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(200),
});

export const memberSchema = z.object({
  name: text(80),
  email: emailSchema,
  relationship: z.enum([
    'mother', 'father', 'partner', 'child', 'sibling',
    'family_member', 'legal_counsel', 'trusted_friend', 'other',
  ]),
  isTrustee: z.boolean().default(false),
  trusteeCategories: z.array(z.enum(CATEGORY_KEYS)).max(CATEGORY_KEYS.length).default([]),
  message: optionalText(500),
});

export const memberPatchSchema = z.object({
  name: text(80).optional(),
  relationship: memberSchema.shape.relationship.optional(),
  isTrustee: z.boolean().optional(),
  trusteeCategories: z.array(z.enum(CATEGORY_KEYS)).optional(),
});

export const grantSchema = z.object({
  categories: z
    .array(z.object({ category: z.enum(CATEGORY_KEYS), canDownload: z.boolean().default(false) }))
    .max(CATEGORY_KEYS.length),
});

export const shareSchema = z.object({
  memberId: z.uuid('Choose someone to share with.'),
  canDownload: z.boolean().default(false),
  expiresAt: z.iso.datetime().nullable().optional(),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10).max(200),
  // Present when the invitee is creating an account as part of accepting.
  name: text(80).optional(),
  password: z.string().min(1).max(256).optional(),
});

/**
 * Emergency access. All three confirmations are required by the protocol, and
 * the API enforces that rather than trusting the UI to have shown them.
 */
export const emergencyRequestSchema = z.object({
  ownerId: z.uuid(),
  reason: z.string().trim().min(10, 'Say what has happened, in a sentence.').max(1000),
  confirmations: z
    .array(z.enum(['verified_emergency', 'owner_notified', 'actions_audited']))
    .refine(
      (value) =>
        ['verified_emergency', 'owner_notified', 'actions_audited'].every((c) => value.includes(c)),
      'Every confirmation is required before the protocol can start.',
    ),
});

export const reminderStateSchema = z.object({
  state: z.enum(['dismissed', 'snoozed', 'done']),
  snoozedUntil: z.iso.datetime().nullable().optional(),
});

export const securitySettingsSchema = z.object({
  waitingPeriodDays: z.number().int().min(1).max(90),
});

export const activityQuerySchema = z.object({
  category: z.enum(['security', 'documents', 'sharing', 'trustees', 'account']).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  before: z.string().max(40).optional(),
});
