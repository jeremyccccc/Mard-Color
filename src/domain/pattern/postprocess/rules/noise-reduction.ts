import type { MatchedCell } from "@/domain/pattern/pattern-generator"
import type { PostProcessRule } from "../pattern-postprocess.types"
import { buildCellMap, countColorFrequency, getCellKey, getNeighborCoords } from "../pattern-grid.utils"

const DOMINANT_NEIGHBOR_THRESHOLD = 5

export const applyNoiseReduction: PostProcessRule = (cells, context) => {
  const cellMap = buildCellMap(cells)

  return cells.map((cell) => {
    const neighbors = getNeighborCoords(cell.x, cell.y, context.width, context.height, "8-way")
      .map((point) => cellMap.get(getCellKey(point.x, point.y)))
      .filter((neighbor): neighbor is MatchedCell => Boolean(neighbor))

    if (neighbors.length === 0) {
      return cell
    }

    const frequency = countColorFrequency(neighbors)
    let dominantColorId = ""
    let dominantCount = 0

    for (const [colorId, count] of frequency.entries()) {
      if (count > dominantCount) {
        dominantColorId = colorId
        dominantCount = count
      }
    }

    if (
      dominantColorId &&
      dominantColorId !== cell.colorId &&
      dominantCount >= DOMINANT_NEIGHBOR_THRESHOLD
    ) {
      const dominantCell = neighbors.find((neighbor) => neighbor.colorId === dominantColorId)
      return dominantCell ? { ...cell, ...dominantCell, x: cell.x, y: cell.y } : cell
    }

    return cell
  })
}
