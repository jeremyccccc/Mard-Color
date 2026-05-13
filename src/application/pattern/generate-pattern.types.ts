import type {
  CropRect,
  GridSettings,
  MatcherSettings,
  PaletteSettings,
  PatternResultState,
  SourceImageState,
} from "@/features/pattern/store/pattern.types"
import type { PaletteProvider } from "@/domain/palette/palette.provider"
import type {
  DomainPatternResult,
  PatternGenerator,
} from "@/domain/pattern/pattern-generator"

export type GeneratePatternRequest = {
  source: SourceImageState
  crop: CropRect | null
  grid: GridSettings
  palette: PaletteSettings
  matcher: MatcherSettings
}

export type GeneratePatternDependencies = {
  paletteProvider: PaletteProvider
  patternGenerator: PatternGenerator
}

export type GeneratePatternUseCase = (
  request: GeneratePatternRequest,
  deps: GeneratePatternDependencies
) => Promise<PatternResultState>

export type GeneratePatternMapper = (result: DomainPatternResult) => PatternResultState
