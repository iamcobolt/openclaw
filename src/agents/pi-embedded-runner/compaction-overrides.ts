import type { ThinkLevel } from "../../auto-reply/thinking.js";
import type { OpenClawConfig } from "../../config/config.js";
import { splitTrailingAuthProfile } from "../model-ref-profile.js";
import { type ModelAliasIndex, resolveModelRefFromString } from "../model-selection.js";

export type ResolvedCompactionModelOverride = {
  provider: string;
  modelId: string;
  authProfileId?: string;
  originalProvider: string;
  originalModelId: string;
  overrideRaw?: string;
  overrideApplied: boolean;
  overrideInvalid: boolean;
};

export function resolveCompactionModelOverride(params: {
  provider: string;
  modelId: string;
  authProfileId?: string;
  cfg?: OpenClawConfig;
  aliasIndex?: ModelAliasIndex;
}): ResolvedCompactionModelOverride {
  const originalProvider = params.provider;
  const originalModelId = params.modelId;
  let provider = originalProvider;
  let modelId = originalModelId;
  let authProfileId = params.authProfileId;

  const overrideRaw = params.cfg?.agents?.defaults?.compaction?.model;
  const overrideTrimmed = typeof overrideRaw === "string" ? overrideRaw.trim() : undefined;

  let overrideApplied = false;
  let overrideInvalid = false;

  if (overrideTrimmed) {
    // Strip optional @profile suffix (e.g. "openai/gpt-4.1-mini@myprofile")
    const { model: modelPart, profile: profileOverride } =
      splitTrailingAuthProfile(overrideTrimmed);
    const resolved = modelPart
      ? resolveModelRefFromString({
          raw: modelPart,
          defaultProvider: originalProvider,
          aliasIndex: params.aliasIndex,
        })
      : null;

    if (resolved) {
      provider = resolved.ref.provider;
      modelId = resolved.ref.model;
      overrideApplied = provider !== originalProvider || modelId !== originalModelId;
      if (profileOverride) {
        // Explicit @profile in override string takes precedence.
        authProfileId = profileOverride;
      } else if (provider !== originalProvider) {
        // Avoid using an auth profile scoped to a different provider.
        authProfileId = undefined;
      }
    } else {
      overrideInvalid = true;
    }
  }

  return {
    provider,
    modelId,
    authProfileId,
    originalProvider,
    originalModelId,
    overrideRaw: overrideTrimmed,
    overrideApplied,
    overrideInvalid,
  };
}

export function resolveCompactionThinkLevel(params: {
  thinkLevel?: ThinkLevel;
  cfg?: OpenClawConfig;
  modelOverrideApplied: boolean;
}): ThinkLevel | undefined {
  const configured = params.cfg?.agents?.defaults?.compaction?.thinking;
  if (configured) {
    return configured;
  }
  if (params.modelOverrideApplied) {
    return "off";
  }
  return params.thinkLevel;
}
