import { normalizePaletteFile } from "./palette.normalizer"
import { paletteRegistry } from "./palette.registry"
import type { PaletteData } from "./palette.types"

export type PaletteProvider = {
  getPalette: (paletteId: string) => Promise<PaletteData>
  listPalettes: () => Promise<
    {
      id: string
      name: string
      colorCount: number
      brand: string
      version: string
    }[]
  >
}

export function createPaletteProvider(): PaletteProvider {
  const cache = new Map<string, PaletteData>()

  return {
    async getPalette(paletteId: string): Promise<PaletteData> {
      const cached = cache.get(paletteId)
      if (cached) {
        return cached
      }

      const entry = paletteRegistry[paletteId]
      if (!entry) {
        throw new Error(`Palette not found: ${paletteId}`)
      }

      const raw = await entry.loader()
      const normalized = normalizePaletteFile(raw)

      if (normalized.id !== paletteId) {
        throw new Error(
          `Palette id mismatch: requested=${paletteId}, actual=${normalized.id}`
        )
      }

      cache.set(paletteId, normalized)

      return normalized
    },

    async listPalettes() {
      const entries = Object.values(paletteRegistry)

      const palettes = await Promise.all(
        entries.map(async (entry) => {
          const raw = await entry.loader()
          const normalized = normalizePaletteFile(raw)

          return {
            id: normalized.id,
            name: normalized.name,
            colorCount: normalized.meta.colorCount,
            brand: normalized.meta.brand,
            version: normalized.meta.version,
          }
        })
      )

      return palettes.sort((a, b) => a.name.localeCompare(b.name))
    },
  }
}

export const paletteProvider = createPaletteProvider()
