import type {
  MatchedCell,
  PatternPostProcessor,
} from "@/domain/pattern/pattern-generator"
import { applyMaxColorsLimit } from "./postprocess/rules/limit-max-colors"
import { applyMergeIsolatedPixels } from "./postprocess/rules/merge-isolated-pixels"
import { applyNoiseReduction } from "./postprocess/rules/noise-reduction"

export const patternPostProcessor: PatternPostProcessor = {
  process(cells, context) {
    let nextCells: MatchedCell[] = [...cells]

    if (context.options?.noiseReduction) {
      nextCells = applyNoiseReduction(nextCells, context)
    }

    if (context.options?.mergeIsolatedPixels) {
      nextCells = applyMergeIsolatedPixels(nextCells, context)
    }

    if (typeof context.options?.maxColors === "number") {
      nextCells = applyMaxColorsLimit(nextCells, context)
    }

    return nextCells
  },
}
