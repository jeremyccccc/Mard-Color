import type { LabColor, RgbColor } from "@/domain/color/color-convert"

export type PaletteRgb = RgbColor
export type PaletteLab = LabColor

export type PaletteColor = {
  id: string
  code: string
  name: string
  nameZh?: string
  hex: string
  rgb: PaletteRgb
  lab: PaletteLab
  category?: string
  available?: boolean
  aliases?: string[]
  sort: number
}

export type PaletteMeta = {
  id: string
  brand: string
  paletteName: string
  version: string
  colorCount: number
  source: string
  updatedAt: string
  notes?: string[]
}

export type PaletteData = {
  id: string
  name: string
  meta: PaletteMeta
  colors: PaletteColor[]
}

export type PaletteJsonColor = PaletteColor

export type PaletteJsonFile = {
  meta: PaletteMeta
  colors: PaletteJsonColor[]
}
