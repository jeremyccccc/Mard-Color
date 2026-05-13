import { ciede2000 } from "@/domain/color/color-difference"
import type { PaletteColor } from "@/domain/palette/palette.types"
import type { MatchedCell } from "@/domain/pattern/pattern-generator"
import type { PostProcessRule } from "../pattern-postprocess.types"
import { countColorFrequency } from "../pattern-grid.utils"

type ColorCandidate = {
  color: PaletteColor
  count: number
  ratio: number
}

const DIVERSITY_DISTANCE = 34
const MIN_DIVERSITY_SCORE = 0.12
const FREQUENCY_POWER = 0.55

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

function getChroma(color: PaletteColor): number {
  return Math.sqrt(color.lab.a ** 2 + color.lab.b ** 2)
}

function getVisualImportance(color: PaletteColor): number {
  const saturationBonus = Math.min(getChroma(color) / 70, 1) * 0.35
  const darkLineBonus = color.lab.l < 28 ? 0.75 : 0
  const lightPaperBonus = color.lab.l > 88 ? 0.22 : 0

  return 1 + saturationBonus + darkLineBonus + lightPaperBonus
}

function getDiversityScore(
  candidate: PaletteColor,
  selectedColors: PaletteColor[]
): number {
  if (selectedColors.length === 0) {
    return 1
  }

  const minDistance = selectedColors.reduce(
    (best, selected) => Math.min(best, ciede2000(candidate.lab, selected.lab)),
    Number.POSITIVE_INFINITY
  )

  return Math.max(
    MIN_DIVERSITY_SCORE,
    Math.min(minDistance / DIVERSITY_DISTANCE, 1)
  )
}

function scoreCandidate(
  candidate: ColorCandidate,
  selectedColors: PaletteColor[]
): number {
  const frequencyScore = Math.pow(candidate.ratio, FREQUENCY_POWER)
  const visualImportance = getVisualImportance(candidate.color)
  const diversityScore = getDiversityScore(candidate.color, selectedColors)

  return frequencyScore * visualImportance * diversityScore
}

function selectDiverseColors(
  candidates: ColorCandidate[],
  maxColors: number
): PaletteColor[] {
  const remaining = [...candidates]
  const selected: PaletteColor[] = []

  while (remaining.length > 0 && selected.length < maxColors) {
    let bestIndex = 0
    let bestScore = Number.NEGATIVE_INFINITY

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index]
      const score = scoreCandidate(candidate, selected)

      if (
        score > bestScore ||
        (score === bestScore && candidate.count > remaining[bestIndex].count)
      ) {
        bestIndex = index
        bestScore = score
      }
    }

    const [nextColor] = remaining.splice(bestIndex, 1)
    selected.push(nextColor.color)
  }

  return selected
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
  const totalCells = cells.length || 1

  const candidates = Array.from(frequency.entries())
    .map(([colorId, count]) => {
      const color = paletteById.get(colorId)

      if (!color) {
        return null
      }

      return {
        color,
        count,
        ratio: count / totalCells,
      }
    })
    .filter((candidate): candidate is ColorCandidate => Boolean(candidate))

  const keepColors = selectDiverseColors(candidates, maxColors)
  const keepColorIds = new Set(keepColors.map((color) => color.id))

  return cells.map((cell) => {
    if (keepColorIds.has(cell.colorId)) {
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
