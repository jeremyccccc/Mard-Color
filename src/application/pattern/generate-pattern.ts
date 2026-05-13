import type { PatternResultState } from "@/features/pattern/store/pattern.types"
import type {
  GeneratePatternDependencies,
  GeneratePatternRequest,
} from "./generate-pattern.types"

function mapDomainResultToStoreResult(result: {
  width: number
  height: number
  cells: PatternResultState["cells"]
}): PatternResultState {
  return {
    width: result.width,
    height: result.height,
    totalBeads: 0,
    cells: result.cells.map((cell) => ({
      ...cell,
      manualEdited: false,
    })),
    usage: [],
    generatedAt: new Date().toISOString(),
    version: 1,
  }
}

export async function generatePatternUseCase(
  request: GeneratePatternRequest,
  deps: GeneratePatternDependencies
): Promise<PatternResultState> {
  if (!request.source.loaded || !request.source.imageData) {
    throw new Error("Source image is not ready")
  }

  if (request.grid.width <= 0 || request.grid.height <= 0) {
    throw new Error("Grid size is invalid")
  }

  const palette = await deps.paletteProvider.getPalette(request.palette.paletteId)

  const baseResult = await deps.patternGenerator.generate({
    imageData: request.source.imageData,
    crop: request.crop,
    targetGrid: {
      width: request.grid.width,
      height: request.grid.height,
    },
    palette,
    matcher: {
      id: request.matcher.matcherId,
      dithering: request.matcher.dithering,
    },
    postProcess: {
      maxColors: request.palette.maxColors,
      noiseReduction: request.matcher.noiseReduction,
      mergeIsolatedPixels: request.matcher.mergeIsolatedPixels,
    },
  })

  return mapDomainResultToStoreResult(baseResult)
}
