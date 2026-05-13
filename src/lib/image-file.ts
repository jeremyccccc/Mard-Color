import type { SourceImageState } from "@/features/pattern/store/pattern.types"

export async function fileToSourceImageState(file: File): Promise<SourceImageState> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const canvas = document.createElement("canvas")
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Canvas 2D context is not available")
    }

    context.drawImage(image, 0, 0)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    return {
      fileName: file.name,
      fileType: file.type,
      objectUrl,
      width: canvas.width,
      height: canvas.height,
      imageData,
      loaded: true,
    }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Failed to load image"))
    image.src = src
  })
}
