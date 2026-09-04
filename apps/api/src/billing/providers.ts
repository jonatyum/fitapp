import { manualQrProvider } from "./manualQr.js";
import { polarProvider } from "./polar.js";
import type { PaymentProvider, ProviderId } from "./types.js";

/**
 * Every provider the API knows about. Adding one means writing a file next to
 * these two and appending it here — nothing else in the codebase changes.
 *
 * Order matters: the first enabled entry is the default at checkout.
 */
export const PROVIDERS: PaymentProvider[] = [manualQrProvider, polarProvider];

export const providerById = (id: string): PaymentProvider | null =>
  PROVIDERS.find((p) => p.id === id) ?? null;

export const enabledProviders = (): PaymentProvider[] => PROVIDERS.filter((p) => p.enabled);

/** The provider used when the client does not ask for one. */
export const defaultProvider = (): PaymentProvider | null => enabledProviders()[0] ?? null;

/** Shape sent to the web app so it can render (or hide) each pay button. */
export const providerSummary = () =>
  PROVIDERS.map((p) => ({ id: p.id as ProviderId, enabled: p.enabled }));
