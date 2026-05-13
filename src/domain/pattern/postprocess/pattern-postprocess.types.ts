import type { PaletteData } from "@/domain/palette/palette.types"
import type { MatchedCell } from "@/domain/pattern/pattern-generator"

export type PostProcessOptions = {
  maxColors?: number
  noiseReduction?: boolean
  mergeIsolatedPixels?: boolean
}

export type PostProcessContext = {
  width: number
  height: number
  palette: PaletteData
  options?: PostProcessOptions
}

export type PostProcessRule = (
  cells: MatchedCell[],
  context: PostProcessContext
) => MatchedCell[]
