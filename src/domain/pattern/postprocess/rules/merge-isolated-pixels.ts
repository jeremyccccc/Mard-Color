import type { MatchedCell } from "@/domain/pattern/pattern-generator"
import type { PostProcessRule } from "../pattern-postprocess.types"
import { buildCellMap, countColorFrequency, getCellKey, getNeighborCoords } from "../pattern-grid.utils"

const SAME_COLOR_NEIGHBOR_THRESHOLD = 1

export const applyMergeIsolatedPixels: PostProcessRule = (cells, context) => {
  const cellMap = buildCellMap(cells)

  return cells.map((cell) => {
    const neighbors = getNeighborCoords(cell.x, cell.y, context.width, context.height, "8-way")
      .map((point) => cellMap.get(getCellKey(point.x, point.y)))
      .filter((neighbor): neighbor is MatchedCell => Boolean(neighbor))

    const sameColorNeighbors = neighbors.filter((neighbor) => neighbor.colorId === cell.colorId)

    if (sameColorNeighbors.length > SAME_COLOR_NEIGHBOR_THRESHOLD) {
      return cell
    }

    const frequency = countColorFrequency(neighbors.filter((neighbor) => neighbor.colorId !== cell.colorId))

    let replacementColorId = ""
    let replacementCount = 0

    for (const [colorId, count] of frequency.entries()) {
      if (count > replacementCount) {
        replacementColorId = colorId
        replacementCount = count
      }
    }

    if (!replacementColorId) {
      return cell
    }

    const replacementCell = neighbors.find((neighbor) => neighbor.colorId === replacementColorId)
    return replacementCell ? { ...cell, ...replacementCell, x: cell.x, y: cell.y } : cell
  })
}
