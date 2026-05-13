import mard221Json from "@/data/palettes/mard-221.json"
import type { PaletteJsonFile } from "./palette.types"

export type PaletteRegistryEntry = {
  id: string
  loader: () => Promise<PaletteJsonFile>
}

export const paletteRegistry: Record<string, PaletteRegistryEntry> = {
  "mard-221": {
    id: "mard-221",
    loader: async () => mard221Json as PaletteJsonFile,
  },
}
