import { useEffect, useMemo, useRef, useState } from "react"
import type { PatternResultState } from "@/features/pattern/store/pattern.types"
import { usePatternStore } from "@/features/pattern/store/pattern.store"

type PatternCanvasProps = {
  result: PatternResultState | null
}

const EMPTY_CANVAS_SIZE = 320
const MIN_CODE_CELL_SIZE = 18
const MAX_CODE_CELL_SIZE = 28
const TARGET_PREVIEW_SIDE = 960
const ZOOM_STEP = 1.12

type PanOffset = {
  x: number
  y: number
}

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

export function PatternCanvas({ result }: PatternCanvasProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const latestZoomRef = useRef(1)
  const latestResultRef = useRef<PatternResultState | null>(null)
  const dragStateRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const zoom = usePatternStore((state) => state.view.zoom)
  const minZoom = usePatternStore((state) => state.view.minZoom)
  const maxZoom = usePatternStore((state) => state.view.maxZoom)
  const setZoom = usePatternStore((state) => state.setZoom)
  const [pan, setPan] = useState<PanOffset>({ x: 0, y: 0 })

  const metrics = useMemo(() => {
    if (!result) {
      return {
        cellSize: 16,
        contentWidth: EMPTY_CANVAS_SIZE,
        contentHeight: EMPTY_CANVAS_SIZE,
      }
    }

    const longestSide = Math.max(result.width, result.height)
    const cellSize = Math.max(
      MIN_CODE_CELL_SIZE,
      Math.min(MAX_CODE_CELL_SIZE, Math.floor(TARGET_PREVIEW_SIDE / longestSide))
    )
    const displayWidth = result.width * cellSize
    const displayHeight = result.height * cellSize

    return {
      cellSize,
      contentWidth: displayWidth,
      contentHeight: displayHeight,
    }
  }, [result])

  useEffect(() => {
    if (!result) {
      setPan({ x: 0, y: 0 })
    }
  }, [result])

  useEffect(() => {
    latestZoomRef.current = zoom
  }, [zoom])

  useEffect(() => {
    latestResultRef.current = result
  }, [result])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    function handleWheel(event: WheelEvent) {
      if (!latestResultRef.current) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const direction = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP
      const nextZoom = Math.min(
        maxZoom,
        Math.max(minZoom, latestZoomRef.current * direction)
      )
      setZoom(nextZoom)
      latestZoomRef.current = nextZoom
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      viewport.removeEventListener("wheel", handleWheel)
    }
  }, [maxZoom, minZoom, setZoom])

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!result) {
      return
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - dragState.startX
    const deltaY = event.clientY - dragState.startY

    setPan({
      x: dragState.originX + deltaX,
      y: dragState.originY + deltaY,
    })
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const textSize = Math.max(8, Math.floor(metrics.cellSize * 0.4))
  const transform = `translate(${pan.x} ${pan.y}) scale(${zoom})`

  return (
    <div
      ref={viewportRef}
      className="canvas-scroll pattern-viewport"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="pattern-stage">
        <svg
          className="pattern-svg"
          width={metrics.contentWidth}
          height={metrics.contentHeight}
          viewBox={`0 0 ${metrics.contentWidth} ${metrics.contentHeight}`}
          role="img"
          aria-label={result ? "拼豆图纸矢量预览" : "等待生成图纸"}
        >
          {result ? (
            <g transform={transform}>
              {result.cells.map((cell) => {
                const x = cell.x * metrics.cellSize
                const y = cell.y * metrics.cellSize

                return (
                  <g key={`${cell.x}-${cell.y}`}>
                    <rect
                      x={x}
                      y={y}
                      width={metrics.cellSize}
                      height={metrics.cellSize}
                      fill={cell.hex}
                      stroke="rgba(30, 24, 16, 0.18)"
                      strokeWidth={1}
                    />
                    <text
                      x={x + metrics.cellSize / 2}
                      y={y + metrics.cellSize / 2}
                      fill={getTextColor(cell.hex)}
                      fontSize={textSize}
                      fontFamily="Segoe UI, PingFang SC, Microsoft YaHei, sans-serif"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      pointerEvents="none"
                    >
                      {cell.colorCode}
                    </text>
                  </g>
                )
              })}
            </g>
          ) : (
            <g>
              <rect
                x={0}
                y={0}
                width={metrics.contentWidth}
                height={metrics.contentHeight}
                fill="#f4efe6"
                rx={20}
              />
              <text
                x={metrics.contentWidth / 2}
                y={metrics.contentHeight / 2}
                fill="#7a6d5c"
                fontSize={18}
                fontWeight={600}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                上传图片并生成图纸
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}
