import type { PatternResultState } from "@/features/pattern/store/pattern.types"

const AXIS_GUTTER = 36
const MIN_CELL_SIZE = 18
const MAX_CELL_SIZE = 28
const TARGET_PREVIEW_SIDE = 960

function hexToRgb(hex: string) {
  const value = hex.replace("#", "")

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

function getTextColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? "#111111" : "#FFFFFF"
}

function getCellSize(result: PatternResultState): number {
  const longestSide = Math.max(result.width, result.height)

  return Math.max(
    MIN_CELL_SIZE,
    Math.min(MAX_CELL_SIZE, Math.floor(TARGET_PREVIEW_SIDE / longestSide))
  )
}

export function exportPatternAsPng(result: PatternResultState, fileName = "pattern.png"): void {
  const cellSize = getCellSize(result)
  const width = result.width * cellSize + AXIS_GUTTER
  const height = result.height * cellSize + AXIS_GUTTER
  const codeFontSize = Math.max(8, Math.floor(cellSize * 0.4))
  const axisFontSize = Math.max(10, Math.floor(cellSize * 0.42))
  const axisLabelOffset = AXIS_GUTTER / 2

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("Failed to create export canvas")
  }

  context.fillStyle = "#f4efe6"
  context.fillRect(0, 0, width, height)

  context.textAlign = "center"
  context.textBaseline = "middle"
  context.font = `700 ${axisFontSize}px "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`
  context.fillStyle = "#6b5b4b"

  for (let index = 0; index < result.width; index += 1) {
    const x = AXIS_GUTTER + index * cellSize + cellSize / 2
    context.fillText(String(index + 1), x, axisLabelOffset)
  }

  for (let index = 0; index < result.height; index += 1) {
    const y = AXIS_GUTTER + index * cellSize + cellSize / 2
    context.fillText(String(index + 1), axisLabelOffset, y)
  }

  context.font = `${codeFontSize}px "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`

  for (const cell of result.cells) {
    const x = AXIS_GUTTER + cell.x * cellSize
    const y = AXIS_GUTTER + cell.y * cellSize

    context.fillStyle = cell.hex
    context.fillRect(x, y, cellSize, cellSize)

    context.strokeStyle = "rgba(30, 24, 16, 0.18)"
    context.strokeRect(x, y, cellSize, cellSize)

    context.fillStyle = getTextColor(cell.hex)
    context.fillText(cell.colorCode, x + cellSize / 2, y + cellSize / 2)
  }

  const link = document.createElement("a")
  link.href = canvas.toDataURL("image/png")
  link.download = fileName
  link.click()
}
