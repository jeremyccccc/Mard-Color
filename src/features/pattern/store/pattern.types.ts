export type PaletteId = string
export type MatcherId = "ciede2000" | "rgb-distance"
export type ExportFormat = "png" | "pdf" | "json"
export type CodeDisplayMode = "colorCode" | "symbol" | "none"
export type ViewMode = "pattern" | "original" | "split"

export type Point = {
  x: number
  y: number
}

export type CropRect = {
  x: number
  y: number
  width: number
  height: number
}

export type SourceImageState = {
  fileName?: string
  fileType?: string
  objectUrl?: string
  width: number
  height: number
  imageData?: ImageData
  loaded: boolean
}

export type GridSettings = {
  mode: "preset" | "custom"
  presetKey?: string
  width: number
  height: number
  lockAspectRatio: boolean
}

export type PaletteSettings = {
  paletteId: PaletteId
  maxColors?: number
  enabledColorIds?: string[]
  excludedColorIds?: string[]
}

export type MatcherSettings = {
  matcherId: MatcherId
  dithering: boolean
  noiseReduction: boolean
  mergeIsolatedPixels: boolean
}

export type ViewSettings = {
  mode: ViewMode
  zoom: number
  minZoom: number
  maxZoom: number
  showGrid: boolean
  showCode: boolean
  codeDisplayMode: CodeDisplayMode
}

export type SelectionState = {
  activeCell?: Point
  hoveredCell?: Point
}

export type PatternCell = {
  x: number
  y: number
  colorId: string
  colorCode: string
  colorName: string
  colorNameZh?: string
  hex: string
  manualEdited?: boolean
}

export type PatternUsage = {
  colorId: string
  colorCode: string
  colorName: string
  colorNameZh?: string
  hex: string
  count: number
  percentage: number
}

export type PatternResultState = {
  width: number
  height: number
  totalBeads: number
  cells: PatternCell[]
  usage: PatternUsage[]
  generatedAt?: string
  version: number
}

export type AsyncState = {
  isGenerating: boolean
  isExporting: boolean
  lastAction?: string
}

export type UiState = {
  leftSidebarCollapsed: boolean
  rightSidebarCollapsed: boolean
  bottomDrawerOpen: boolean
  warnings: string[]
  errors: string[]
}

export type HistorySnapshot = {
  result: PatternResultState | null
}

export type PatternStoreState = {
  source: SourceImageState
  crop: CropRect | null
  grid: GridSettings
  palette: PaletteSettings
  matcher: MatcherSettings
  view: ViewSettings
  selection: SelectionState
  result: PatternResultState | null
  async: AsyncState
  ui: UiState
  history: {
    undoStack: HistorySnapshot[]
    redoStack: HistorySnapshot[]
    enabled: boolean
    limit: number
  }
}
