import type { PatternStoreState } from "./pattern.types"

const EMPTY_USAGE_LIST: PatternStoreState["result"] extends null
  ? never
  : NonNullable<PatternStoreState["result"]>["usage"] = []

export const selectSourceLoaded = (state: PatternStoreState) => state.source.loaded
export const selectPatternResult = (state: PatternStoreState) => state.result
export const selectUsageList = (state: PatternStoreState) => state.result?.usage ?? EMPTY_USAGE_LIST
export const selectTotalBeads = (state: PatternStoreState) => state.result?.totalBeads ?? 0
export const selectUsedColorCount = (state: PatternStoreState) =>
  state.result?.usage.length ?? 0

export const selectCanGenerate = (state: PatternStoreState) =>
  state.source.loaded && !!state.source.imageData && !state.async.isGenerating

export const selectCanExport = (state: PatternStoreState) =>
  !!state.result && state.result.cells.length > 0 && !state.async.isExporting
