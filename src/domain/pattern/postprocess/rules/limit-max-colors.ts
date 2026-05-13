import { ciede2000 } from "@/domain/color/color-difference"
import type { PaletteColor } from "@/domain/palette/palette.types"
import type { MatchedCell } from "@/domain/pattern/pattern-generator"
import type { PostProcessRule } from "../pattern-postprocess.types"
import { countColorFrequency } from "../pattern-grid.utils"

function remapToClosestPaletteColor(
  sourceColor: PaletteColor,
  targetColors: PaletteColor[]
): PaletteColor {
  let bestColor = targetColors[0]
  let minDistance = Number.POSITIVE_INFINITY

  for (const target of targetColors) {
    const distance = ciede2000(sourceColor.lab, target.lab)

    if (distance < minDistance) {
      minDistance = distance
      bestColor = target
    }
  }

  return bestColor
}

export const applyMaxColorsLimit: PostProcessRule = (cells, context) => {
  const maxColors = context.options?.maxColors

  if (!maxColors || maxColors <= 0) {
    return cells
  }

  const frequency = countColorFrequency(cells)

  if (frequency.size <= maxColors) {
    return cells
  }

  const paletteById = new Map(context.palette.colors.map((color) => [color.id, color]))

  const keepColorIds = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors)
    .map(([colorId]) => colorId)

  const keepColors = keepColorIds
    .map((colorId) => paletteById.get(colorId))
    .filter((color): color is PaletteColor => Boolean(color))

  return cells.map((cell) => {
    if (keepColorIds.includes(cell.colorId)) {
      return cell
    }

    const sourceColor = paletteById.get(cell.colorId)
    if (!sourceColor || keepColors.length === 0) {
      return cell
    }

    const replacement = remapToClosestPaletteColor(sourceColor, keepColors)

    return {
      ...cell,
      colorId: replacement.id,
      colorCode: replacement.code,
      colorName: replacement.name,
      colorNameZh: replacement.nameZh,
      hex: replacement.hex,
    }
  })
}
