import { rgbToLab } from "@/domain/color/color-convert"
import { ciede2000 } from "@/domain/color/color-difference"
import type { ColorMatcher, PaletteColor } from "@/domain/pattern/pattern-generator"

export const ciede2000Matcher: ColorMatcher = {
  id: "ciede2000",
  match({ pixel, palette }) {
    const targetLab = rgbToLab(pixel.rgb)

    let bestColor: PaletteColor | null = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const color of palette) {
      if (color.available === false) {
        continue
      }

      const distance = ciede2000(targetLab, color.lab)

      if (distance < minDistance) {
        minDistance = distance
        bestColor = color
      }
    }

    if (!bestColor) {
      throw new Error("No available palette color found for matching")
    }

    return bestColor
  },
}
