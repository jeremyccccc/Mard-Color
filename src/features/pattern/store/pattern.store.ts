import { create } from "zustand"
import { generatePatternUseCase } from "@/application/pattern/generate-pattern"
import { paletteProvider } from "@/domain/palette/palette.provider"
import { patternGenerator } from "@/domain/pattern/pattern-services"
import { initialPatternState } from "./pattern.initial"
import type { PatternStoreActions } from "./pattern.actions"
import type { PatternResultState, PatternStoreState } from "./pattern.types"

type PatternStore = PatternStoreState & PatternStoreActions

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function rebuildUsage(result: PatternResultState | null): PatternResultState | null {
  if (!result) {
    return null
  }

  const map = new Map<
    string,
    {
      colorId: string
      colorCode: string
      colorName: string
      colorNameZh?: string
      hex: string
      count: number
    }
  >()

  for (const cell of result.cells) {
    const previous = map.get(cell.colorId)

    if (previous) {
      previous.count += 1
    } else {
      map.set(cell.colorId, {
        colorId: cell.colorId,
        colorCode: cell.colorCode,
        colorName: cell.colorName,
        colorNameZh: cell.colorNameZh,
        hex: cell.hex,
        count: 1,
      })
    }
  }

  const total = result.cells.length || 1
  const usage = Array.from(map.values())
    .map((item) => ({
      ...item,
      percentage: item.count / total,
    }))
    .sort((a, b) => a.colorCode.localeCompare(b.colorCode))

  return {
    ...result,
    totalBeads: result.cells.length,
    usage,
  }
}

export const usePatternStore = create<PatternStore>((set, get) => ({
  ...initialPatternState,

  resetEditor: () => set(initialPatternState),

  setSourceImage: (payload) =>
    set({
      source: payload,
      result: null,
      crop: null,
      selection: {},
      ui: { ...get().ui, errors: [], warnings: [] },
    }),

  clearSourceImage: () =>
    set({
      source: initialPatternState.source,
      crop: null,
      result: null,
      selection: {},
    }),

  setCropRect: (rect) => set({ crop: rect }),

  updateGridSettings: (patch) =>
    set((state) => ({
      grid: { ...state.grid, ...patch },
    })),

  setGridSize: (width, height) =>
    set((state) => ({
      grid: {
        ...state.grid,
        mode: "custom",
        presetKey: undefined,
        width,
        height,
      },
    })),

  setGridPreset: (presetKey, width, height) =>
    set((state) => ({
      grid: {
        ...state.grid,
        mode: "preset",
        presetKey,
        width,
        height,
      },
    })),

  updatePaletteSettings: (patch) =>
    set((state) => ({
      palette: { ...state.palette, ...patch },
    })),

  setPaletteId: (paletteId) =>
    set((state) => ({
      palette: { ...state.palette, paletteId },
    })),

  updateMatcherSettings: (patch) =>
    set((state) => ({
      matcher: { ...state.matcher, ...patch },
    })),

  setMatcherId: (matcherId) =>
    set((state) => ({
      matcher: { ...state.matcher, matcherId },
    })),

  updateViewSettings: (patch) =>
    set((state) => ({
      view: { ...state.view, ...patch },
    })),

  zoomIn: () =>
    set((state) => ({
      view: {
        ...state.view,
        zoom: clamp(state.view.zoom * 1.2, state.view.minZoom, state.view.maxZoom),
      },
    })),

  zoomOut: () =>
    set((state) => ({
      view: {
        ...state.view,
        zoom: clamp(state.view.zoom / 1.2, state.view.minZoom, state.view.maxZoom),
      },
    })),

  setZoom: (zoom) =>
    set((state) => ({
      view: {
        ...state.view,
        zoom: clamp(zoom, state.view.minZoom, state.view.maxZoom),
      },
    })),

  resetZoom: () =>
    set((state) => ({
      view: { ...state.view, zoom: 1 },
    })),

  setActiveCell: (cell) =>
    set((state) => ({
      selection: { ...state.selection, activeCell: cell },
    })),

  setHoveredCell: (cell) =>
    set((state) => ({
      selection: { ...state.selection, hoveredCell: cell },
    })),

  clearSelection: () => set({ selection: {} }),

  setResult: (result) =>
    set({
      result: rebuildUsage(result),
    }),

  regenerateUsage: () =>
    set((state) => ({
      result: rebuildUsage(state.result),
    })),

  replaceCellColor: (x, y, color) => {
    const state = get()

    if (!state.result) {
      return
    }

    state.pushHistory()

    const nextCells = state.result.cells.map((cell) =>
      cell.x === x && cell.y === y
        ? {
            ...cell,
            ...color,
            manualEdited: true,
          }
        : cell
    )

    set({
      result: rebuildUsage({
        ...state.result,
        cells: nextCells,
        version: state.result.version + 1,
      }),
    })
  },

  replaceColorGlobally: (fromColorId, toColor) => {
    const state = get()

    if (!state.result) {
      return
    }

    state.pushHistory()

    const nextCells = state.result.cells.map((cell) =>
      cell.colorId === fromColorId
        ? {
            ...cell,
            ...toColor,
            manualEdited: true,
          }
        : cell
    )

    set({
      result: rebuildUsage({
        ...state.result,
        cells: nextCells,
        version: state.result.version + 1,
      }),
    })
  },

  pushHistory: () =>
    set((state) => {
      if (!state.history.enabled || !state.result) {
        return state
      }

      const snapshot = {
        result: structuredClone(state.result),
      }

      return {
        history: {
          ...state.history,
          undoStack: [...state.history.undoStack, snapshot].slice(-state.history.limit),
          redoStack: [],
        },
      }
    }),

  undo: () =>
    set((state) => {
      const previous = state.history.undoStack[state.history.undoStack.length - 1]

      if (!previous) {
        return state
      }

      const currentSnapshot = {
        result: state.result ? structuredClone(state.result) : null,
      }

      return {
        result: previous.result,
        history: {
          ...state.history,
          undoStack: state.history.undoStack.slice(0, -1),
          redoStack: [...state.history.redoStack, currentSnapshot],
        },
      }
    }),

  redo: () =>
    set((state) => {
      const next = state.history.redoStack[state.history.redoStack.length - 1]

      if (!next) {
        return state
      }

      const currentSnapshot = {
        result: state.result ? structuredClone(state.result) : null,
      }

      return {
        result: next.result,
        history: {
          ...state.history,
          undoStack: [...state.history.undoStack, currentSnapshot],
          redoStack: state.history.redoStack.slice(0, -1),
        },
      }
    }),

  clearHistory: () =>
    set((state) => ({
      history: {
        ...state.history,
        undoStack: [],
        redoStack: [],
      },
    })),

  setWarnings: (warnings) =>
    set((state) => ({
      ui: { ...state.ui, warnings },
    })),

  setErrors: (errors) =>
    set((state) => ({
      ui: { ...state.ui, errors },
    })),

  addWarning: (warning) =>
    set((state) => ({
      ui: { ...state.ui, warnings: [...state.ui.warnings, warning] },
    })),

  addError: (error) =>
    set((state) => ({
      ui: { ...state.ui, errors: [...state.ui.errors, error] },
    })),

  clearMessages: () =>
    set((state) => ({
      ui: { ...state.ui, warnings: [], errors: [] },
    })),

  setGenerating: (value) =>
    set((state) => ({
      async: { ...state.async, isGenerating: value, lastAction: "generate" },
    })),

  setExporting: (value) =>
    set((state) => ({
      async: { ...state.async, isExporting: value, lastAction: "export" },
    })),

  generatePattern: async () => {
    const state = get()

    if (!state.source.loaded || !state.source.imageData) {
      state.setErrors(["Please upload an image first"])
      return
    }

    set((current) => ({
      async: { ...current.async, isGenerating: true, lastAction: "generate" },
      ui: { ...current.ui, errors: [] },
    }))

    try {
      const result = await generatePatternUseCase(
        {
          source: state.source,
          crop: state.crop,
          grid: state.grid,
          palette: state.palette,
          matcher: state.matcher,
        },
        {
          paletteProvider,
          patternGenerator,
        }
      )

      get().setResult(result)
      get().clearHistory()
      get().clearSelection()

      set((current) => ({
        async: { ...current.async, isGenerating: false },
      }))
    } catch (error) {
      set((current) => ({
        async: { ...current.async, isGenerating: false },
        ui: {
          ...current.ui,
          errors: [error instanceof Error ? error.message : "Pattern generation failed"],
        },
      }))
    }
  },

  exportPattern: async (_format) => {
    set((state) => ({
      async: { ...state.async, isExporting: true, lastAction: "export" },
    }))

    try {
      throw new Error("Export is not implemented yet")
    } catch (error) {
      set((state) => ({
        async: { ...state.async, isExporting: false },
        ui: {
          ...state.ui,
          errors: [error instanceof Error ? error.message : "Export failed"],
        },
      }))
    }
  },
}))
