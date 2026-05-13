import type { ImageSampler, SampledPixel } from "@/domain/pattern/pattern-generator"

const WHITE_RGB = 255

function getPixelOffset(x: number, y: number, width: number): number {
  return (y * width + x) * 4
}

export const averageGridSampler: ImageSampler = {
  sampleToGrid(imageData, grid) {
    const { width: sourceWidth, height: sourceHeight, data } = imageData
    const cellWidth = sourceWidth / grid.width
    const cellHeight = sourceHeight / grid.height
    const pixels: SampledPixel[] = []

    for (let gy = 0; gy < grid.height; gy += 1) {
      for (let gx = 0; gx < grid.width; gx += 1) {
        const startX = Math.floor(gx * cellWidth)
        const endX = Math.min(sourceWidth, Math.ceil((gx + 1) * cellWidth))
        const startY = Math.floor(gy * cellHeight)
        const endY = Math.min(sourceHeight, Math.ceil((gy + 1) * cellHeight))

        let r = 0
        let g = 0
        let b = 0
        let alphaTotal = 0
        let count = 0

        for (let y = startY; y < endY; y += 1) {
          for (let x = startX; x < endX; x += 1) {
            const offset = getPixelOffset(x, y, sourceWidth)
            const alpha = data[offset + 3] / 255

            // Composite each source pixel over a white background so transparent
            // PNG regions become white paper instead of accidental black beads.
            r += data[offset] * alpha + WHITE_RGB * (1 - alpha)
            g += data[offset + 1] * alpha + WHITE_RGB * (1 - alpha)
            b += data[offset + 2] * alpha + WHITE_RGB * (1 - alpha)
            alphaTotal += alpha
            count += 1
          }
        }

        const divisor = count || 1

        pixels.push({
          x: gx,
          y: gy,
          rgb: {
            r: Math.round(r / divisor),
            g: Math.round(g / divisor),
            b: Math.round(b / divisor),
          },
          alpha: Math.round((alphaTotal / divisor) * 255),
        })
      }
    }

    return pixels
  },
}
