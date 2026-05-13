import type {
  CropRect,
  ExportFormat,
  GridSettings,
  MatcherSettings,
  PaletteSettings,
  PatternResultState,
  Point,
  SourceImageState,
  ViewSettings,
} from "./pattern.types"

export type PatternStoreActions = {
  resetEditor: () => void

  setSourceImage: (payload: SourceImageState) => void
  clearSourceImage: () => void
  setCropRect: (rect: CropRect | null) => void

  updateGridSettings: (patch: Partial<GridSettings>) => void
  setGridSize: (width: number, height: number) => void
  setGridPreset: (presetKey: string, width: number, height: number) => void

  updatePaletteSettings: (patch: Partial<PaletteSettings>) => void
  setPaletteId: (paletteId: string) => void

  updateMatcherSettings: (patch: Partial<MatcherSettings>) => void
  setMatcherId: (matcherId: MatcherSettings["matcherId"]) => void

  updateViewSettings: (patch: Partial<ViewSettings>) => void
  zoomIn: () => void
  zoomOut: () => void
  setZoom: (zoom: number) => void
  resetZoom: () => void

  setActiveCell: (cell?: Point) => void
  setHoveredCell: (cell?: Point) => void
  clearSelection: () => void

  setResult: (result: PatternResultState | null) => void
  regenerateUsage: () => void

  replaceCellColor: (x: number, y: number, color: {
    colorId: string
    colorCode: string
    colorName: string
    colorNameZh?: string
    hex: string
  }) => void

  replaceColorGlobally: (
    fromColorId: string,
    toColor: {
      colorId: string
      colorCode: string
      colorName: string
      colorNameZh?: string
      hex: string
    }
  ) => void

  pushHistory: () => void
  undo: () => void
  redo: () => void
  clearHistory: () => void

  setWarnings: (warnings: string[]) => void
  setErrors: (errors: string[]) => void
  addWarning: (warning: string) => void
  addError: (error: string) => void
  clearMessages: () => void

  setGenerating: (value: boolean) => void
  setExporting: (value: boolean) => void

  generatePattern: () => Promise<void>
  exportPattern: (format: ExportFormat) => Promise<void>
}
