import { prisma } from "../db.js";
import type { PlanSpec } from "./types.js";

export const FREE = "free";
export const PRO = "pro";
export const PRO_QUARTER = "pro-quarter";
export const PRO_YEAR = "pro-year";

/**
 * The catalog. Prices are in cents of Bolivianos — Bs 49.00/month for Pro.
 * Edit here and the next boot re-seeds; existing subscriptions keep the period
 * they already paid for.
 *
 * The three Pro rows are one product bought for different lengths, not three
 * tiers: everything that asks "is this user Pro?" goes through `isProPlan`.
 */
export const PLANS: PlanSpec[] = [
  { code: FREE, name: "Free", priceCents: 0, currency: "BOB", periodDays: 0 },
  { code: PRO, name: "Pro monthly", priceCents: 4900, currency: "BOB", periodDays: 30 },
  { code: PRO_QUARTER, name: "Pro quarterly", priceCents: 12900, currency: "BOB", periodDays: 90 },
  { code: PRO_YEAR, name: "Pro yearly", priceCents: 39900, currency: "BOB", periodDays: 365 },
];

const PRO_CODES = new Set<string>([PRO, PRO_QUARTER, PRO_YEAR]);

/** Any paid length of Pro. Never compare a plan code against `PRO` directly. */
export const isProPlan = (code: string): boolean => PRO_CODES.has(code);

export const planByCode = (code: string): PlanSpec | null =>
  PLANS.find((p) => p.code === code) ?? null;

/** Bs 49.00 — for the transfer instructions, where a number alone is ambiguous. */
export const formatAmount = (cents: number, currency: string) =>
  `${currency === "BOB" ? "Bs" : currency} ${(cents / 100).toFixed(2)}`;

/** Upsert the catalog. Idempotent; runs from the seed on every boot. */
export async function seedPlans() {
  for (const p of PLANS) {
    await prisma.plan.upsert({
      where: { code: p.code },
      create: { ...p, active: true },
      update: { name: p.name, priceCents: p.priceCents, currency: p.currency, periodDays: p.periodDays },
    });
  }
  console.log(`[seed] ${PLANS.length} plans up to date.`);
}
