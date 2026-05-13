import type { PatternStoreState } from "./pattern.types"

export const initialPatternState: PatternStoreState = {
  source: {
    width: 0,
    height: 0,
    loaded: false,
  },
  crop: null,
  grid: {
    mode: "preset",
    presetKey: "58x58",
    width: 58,
    height: 58,
    lockAspectRatio: true,
  },
  palette: {
    paletteId: "mard-221",
  },
  matcher: {
    matcherId: "ciede2000",
    dithering: false,
    noiseReduction: true,
    mergeIsolatedPixels: false,
  },
  view: {
    mode: "pattern",
    zoom: 1,
    minZoom: 0.25,
    maxZoom: 20,
    showGrid: true,
    showCode: true,
    codeDisplayMode: "colorCode",
  },
  selection: {},
  result: null,
  async: {
    isGenerating: false,
    isExporting: false,
  },
  ui: {
    leftSidebarCollapsed: false,
    rightSidebarCollapsed: false,
    bottomDrawerOpen: true,
    warnings: [],
    errors: [],
  },
  history: {
    undoStack: [],
    redoStack: [],
    enabled: true,
    limit: 50,
  },
}
