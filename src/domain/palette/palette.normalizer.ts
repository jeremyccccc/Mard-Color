import type { PaletteColor, PaletteData, PaletteJsonFile } from "./palette.types"

function isValidRgbChannel(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 255
}

function normalizeHex(hex: string): string {
  return hex.trim().toUpperCase()
}

function validateColor(color: PaletteColor): void {
  if (!color.id) {
    throw new Error("Palette color id is required")
  }

  if (!color.code) {
    throw new Error(`Palette color code is required: ${color.id}`)
  }

  if (!/^#[0-9A-F]{6}$/i.test(color.hex)) {
    throw new Error(`Invalid hex value for color ${color.id}: ${color.hex}`)
  }

  if (
    !isValidRgbChannel(color.rgb.r) ||
    !isValidRgbChannel(color.rgb.g) ||
    !isValidRgbChannel(color.rgb.b)
  ) {
    throw new Error(`Invalid RGB value for color ${color.id}`)
  }
}

export function normalizePaletteFile(input: PaletteJsonFile): PaletteData {
  if (!input.meta?.id) {
    throw new Error("Palette meta.id is required")
  }

  if (!input.meta?.paletteName) {
    throw new Error("Palette meta.paletteName is required")
  }

  if (!Array.isArray(input.colors) || input.colors.length === 0) {
    throw new Error("Palette colors are required")
  }

  if (input.meta.colorCount !== input.colors.length) {
    throw new Error(
      `Palette color count mismatch: meta=${input.meta.colorCount}, actual=${input.colors.length}`
    )
  }

  const seenIds = new Set<string>()
  const seenCodes = new Set<string>()

  const colors = input.colors.map((raw) => {
    const color: PaletteColor = {
      ...raw,
      hex: normalizeHex(raw.hex),
      available: raw.available ?? true,
    }

    validateColor(color)

    if (seenIds.has(color.id)) {
      throw new Error(`Duplicate palette color id: ${color.id}`)
    }

    if (seenCodes.has(color.code)) {
      throw new Error(`Duplicate palette color code: ${color.code}`)
    }

    seenIds.add(color.id)
    seenCodes.add(color.code)

    return color
  })

  colors.sort((a, b) => a.sort - b.sort)

  return {
    id: input.meta.id,
    name: input.meta.paletteName,
    meta: input.meta,
    colors,
  }
}
