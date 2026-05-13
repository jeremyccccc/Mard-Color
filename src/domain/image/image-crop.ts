import type { CropRect } from "@/features/pattern/store/pattern.types"
import type { ImageCropper } from "@/domain/pattern/pattern-generator"

export const imageCropper: ImageCropper = {
  crop(imageData, crop) {
    if (!crop) {
      return imageData
    }

    const { x, y, width, height } = crop
    const sourceWidth = imageData.width
    const sourceHeight = imageData.height

    const clampedX = Math.max(0, Math.min(Math.floor(x), sourceWidth - 1))
    const clampedY = Math.max(0, Math.min(Math.floor(y), sourceHeight - 1))
    const clampedWidth = Math.max(1, Math.min(Math.floor(width), sourceWidth - clampedX))
    const clampedHeight = Math.max(1, Math.min(Math.floor(height), sourceHeight - clampedY))

    const nextData = new Uint8ClampedArray(clampedWidth * clampedHeight * 4)

    for (let row = 0; row < clampedHeight; row += 1) {
      for (let col = 0; col < clampedWidth; col += 1) {
        const srcIndex = ((clampedY + row) * sourceWidth + (clampedX + col)) * 4
        const dstIndex = (row * clampedWidth + col) * 4

        nextData[dstIndex] = imageData.data[srcIndex]
        nextData[dstIndex + 1] = imageData.data[srcIndex + 1]
        nextData[dstIndex + 2] = imageData.data[srcIndex + 2]
        nextData[dstIndex + 3] = imageData.data[srcIndex + 3]
      }
    }

    return new ImageData(nextData, clampedWidth, clampedHeight)
  },
}
