import type { CropRect } from "@/features/pattern/store/pattern.types"
import type { PaletteData } from "@/domain/palette/palette.types"
import type { LabColor, RgbColor } from "@/domain/color/color-convert"
import type { PostProcessOptions } from "./postprocess/pattern-postprocess.types"

export type SampledPixel = {
  x: number
  y: number
  rgb: RgbColor
  alpha?: number
}

export type MatcherInput = {
  pixel: SampledPixel
  palette: PaletteColor[]
  matcherId: string
}

export type PaletteColor = {
  id: string
  code: string
  name: string
  nameZh?: string
  hex: string
  rgb: RgbColor
  lab: LabColor
  available?: boolean
}

export type MatchedCell = {
  x: number
  y: number
  colorId: string
  colorCode: string
  colorName: string
  colorNameZh?: string
  hex: string
}

export type DomainGenerateInput = {
  imageData: ImageData
  crop: CropRect | null
  targetGrid: {
    width: number
    height: number
  }
  palette: PaletteData
  matcher: {
    id: string
    dithering: boolean
  }
  postProcess?: PostProcessOptions
}

export type DomainPatternResult = {
  width: number
  height: number
  cells: MatchedCell[]
}

export type ImageCropper = {
  crop: (imageData: ImageData, crop: CropRect | null) => ImageData
}

export type ImageSampler = {
  sampleToGrid: (
    imageData: ImageData,
    grid: { width: number; height: number }
  ) => SampledPixel[]
}

export type ColorMatcher = {
  id: string
  match: (input: MatcherInput) => PaletteColor
}

export type MatcherRegistry = {
  getMatcher: (matcherId: string) => ColorMatcher
}

export type PatternPostProcessor = {
  process: (
    cells: MatchedCell[],
    context: {
      width: number
      height: number
      palette: PaletteData
      options?: PostProcessOptions
    }
  ) => MatchedCell[]
}

export type PatternGeneratorDependencies = {
  cropper: ImageCropper
  sampler: ImageSampler
  matcherRegistry: MatcherRegistry
  postProcessor?: PatternPostProcessor
}

export type PatternGenerator = {
  generate: (input: DomainGenerateInput) => Promise<DomainPatternResult>
}

function validateInput(input: DomainGenerateInput): void {
  if (!input.imageData) {
    throw new Error("Image data is required")
  }

  if (input.targetGrid.width <= 0 || input.targetGrid.height <= 0) {
    throw new Error("Target grid size must be greater than 0")
  }

  if (!input.palette?.colors?.length) {
    throw new Error("Palette colors are required")
  }
}

function buildMatchedCells(
  sampledPixels: SampledPixel[],
  palette: PaletteData,
  matcher: ColorMatcher
): MatchedCell[] {
  return sampledPixels.map((pixel) => {
    const color = matcher.match({
      pixel,
      palette: palette.colors,
      matcherId: matcher.id,
    })

    return {
      x: pixel.x,
      y: pixel.y,
      colorId: color.id,
      colorCode: color.code,
      colorName: color.name,
      colorNameZh: color.nameZh,
      hex: color.hex,
    }
  })
}

function ensureGridIntegrity(cells: MatchedCell[], width: number, height: number): void {
  const expected = width * height

  if (cells.length !== expected) {
    throw new Error(
      `Generated cell count mismatch: expected ${expected}, received ${cells.length}`
    )
  }
}

export function createPatternGenerator(
  deps: PatternGeneratorDependencies
): PatternGenerator {
  return {
    async generate(input: DomainGenerateInput): Promise<DomainPatternResult> {
      validateInput(input)

      const croppedImageData = deps.cropper.crop(input.imageData, input.crop)
      const sampledPixels = deps.sampler.sampleToGrid(croppedImageData, {
        width: input.targetGrid.width,
        height: input.targetGrid.height,
      })
      const matcher = deps.matcherRegistry.getMatcher(input.matcher.id)

      let cells = buildMatchedCells(sampledPixels, input.palette, matcher)

      if (deps.postProcessor) {
        cells = deps.postProcessor.process(cells, {
          width: input.targetGrid.width,
          height: input.targetGrid.height,
          palette: input.palette,
          options: input.postProcess,
        })
      }

      ensureGridIntegrity(cells, input.targetGrid.width, input.targetGrid.height)

      return {
        width: input.targetGrid.width,
        height: input.targetGrid.height,
        cells,
      }
    },
  }
}
