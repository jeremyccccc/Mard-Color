import type { MatchedCell } from "@/domain/pattern/pattern-generator"

export function buildCellMap(cells: MatchedCell[]): Map<string, MatchedCell> {
  return new Map(cells.map((cell) => [`${cell.x},${cell.y}`, cell]))
}

export function getCellKey(x: number, y: number): string {
  return `${x},${y}`
}

export function getNeighborCoords(
  x: number,
  y: number,
  width: number,
  height: number,
  mode: "4-way" | "8-way" = "8-way"
): Array<{ x: number; y: number }> {
  const offsets =
    mode === "4-way"
      ? [
          { x: 0, y: -1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
        ]
      : [
          { x: -1, y: -1 },
          { x: 0, y: -1 },
          { x: 1, y: -1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
          { x: -1, y: 1 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ]

  return offsets
    .map((offset) => ({ x: x + offset.x, y: y + offset.y }))
    .filter((point) => point.x >= 0 && point.y >= 0 && point.x < width && point.y < height)
}

export function countColorFrequency(cells: MatchedCell[]): Map<string, number> {
  const counts = new Map<string, number>()

  for (const cell of cells) {
    counts.set(cell.colorId, (counts.get(cell.colorId) ?? 0) + 1)
  }

  return counts
}
