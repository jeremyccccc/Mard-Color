import type { ChangeEvent } from "react"
import { useMemo, useState } from "react"
import { PatternCanvas } from "./PatternCanvas"
import { fileToSourceImageState } from "@/lib/image-file"
import { usePatternStore } from "@/features/pattern/store/pattern.store"
import {
  selectCanGenerate,
  selectCanExport,
  selectPatternResult,
  selectTotalBeads,
  selectUsageList,
  selectUsedColorCount,
} from "@/features/pattern/store/pattern.selectors"

export function PatternWorkbench() {
  const source = usePatternStore((state) => state.source)
  const grid = usePatternStore((state) => state.grid)
  const matcher = usePatternStore((state) => state.matcher)
  const palette = usePatternStore((state) => state.palette)
  const ui = usePatternStore((state) => state.ui)
  const asyncState = usePatternStore((state) => state.async)
  const result = usePatternStore(selectPatternResult)
  const usage = usePatternStore(selectUsageList)
  const totalBeads = usePatternStore(selectTotalBeads)
  const usedColorCount = usePatternStore(selectUsedColorCount)
  const canGenerate = usePatternStore(selectCanGenerate)
  const canExport = usePatternStore(selectCanExport)

  const setSourceImage = usePatternStore((state) => state.setSourceImage)
  const updateGridSettings = usePatternStore((state) => state.updateGridSettings)
  const updatePaletteSettings = usePatternStore((state) => state.updatePaletteSettings)
  const updateMatcherSettings = usePatternStore((state) => state.updateMatcherSettings)
  const generatePattern = usePatternStore((state) => state.generatePattern)
  const exportPattern = usePatternStore((state) => state.exportPattern)
  const clearMessages = usePatternStore((state) => state.clearMessages)

  const [isReadingFile, setIsReadingFile] = useState(false)

  const sortedUsage = useMemo(
    () => [...usage].sort((a, b) => b.count - a.count || a.colorCode.localeCompare(b.colorCode)),
    [usage]
  )

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setIsReadingFile(true)
    clearMessages()

    try {
      const nextSource = await fileToSourceImageState(file)
      setSourceImage(nextSource)
    } catch (error) {
      usePatternStore.getState().setErrors([
        error instanceof Error ? error.message : "Failed to read image file",
      ])
    } finally {
      setIsReadingFile(false)
      event.target.value = ""
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">MARD 221</p>
          <h1>图片转拼豆图纸</h1>
        </div>
        <div className="summary-strip">
          <span>格数 {grid.width} × {grid.height}</span>
          <span>颜色 {usedColorCount}</span>
          <span>颗数 {totalBeads}</span>
        </div>
      </header>

      <main className="workbench">
        <aside className="panel stack">
          <section className="card stack">
            <div className="section-head">
              <h2>图片</h2>
              <span>{source.loaded ? `${source.width} × ${source.height}` : "未上传"}</span>
            </div>
            <label className="upload-field">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <span>{isReadingFile ? "读取中..." : "选择图片"}</span>
            </label>
            {source.fileName ? <p className="muted">{source.fileName}</p> : null}
          </section>

          <section className="card stack">
            <div className="section-head">
              <h2>格数</h2>
              <span>支持自定义</span>
            </div>
            <div className="grid-fields">
              <label>
                宽
                <input
                  type="number"
                  min={1}
                  max={512}
                  value={grid.width}
                  onChange={(event) =>
                    updateGridSettings({
                      mode: "custom",
                      presetKey: undefined,
                      width: Number(event.target.value) || 1,
                    })
                  }
                />
              </label>
              <label>
                高
                <input
                  type="number"
                  min={1}
                  max={512}
                  value={grid.height}
                  onChange={(event) =>
                    updateGridSettings({
                      mode: "custom",
                      presetKey: undefined,
                      height: Number(event.target.value) || 1,
                    })
                  }
                />
              </label>
            </div>
            <div className="preset-row">
              {[
                { label: "29×29", width: 29, height: 29 },
                { label: "48×48", width: 48, height: 48 },
                { label: "58×58", width: 58, height: 58 },
                { label: "80×100", width: 80, height: 100 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="ghost-button"
                  onClick={() =>
                    updateGridSettings({
                      mode: "preset",
                      presetKey: preset.label,
                      width: preset.width,
                      height: preset.height,
                    })
                  }
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>

          <section className="card stack">
            <div className="section-head">
              <h2>算法</h2>
              <span>Lab + CIEDE2000</span>
            </div>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={matcher.noiseReduction}
                onChange={(event) =>
                  updateMatcherSettings({ noiseReduction: event.target.checked })
                }
              />
              <span>启用降噪</span>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={matcher.mergeIsolatedPixels}
                onChange={(event) =>
                  updateMatcherSettings({ mergeIsolatedPixels: event.target.checked })
                }
              />
              <span>合并孤立像素</span>
            </label>
            <label>
              最大颜色数
              <input
                type="number"
                min={1}
                max={221}
                value={palette.maxColors ?? ""}
                placeholder="不限"
                onChange={(event) => {
                  const value = event.target.value.trim()
                  updatePaletteSettings({
                    maxColors: value ? Number(value) : undefined,
                  })
                }}
              />
            </label>
          </section>

          <button
            type="button"
            className="primary-button"
            disabled={!canGenerate || isReadingFile || asyncState.isGenerating}
            onClick={() => void generatePattern()}
          >
            {asyncState.isGenerating ? "生成中..." : "生成图纸"}
          </button>

          <button
            type="button"
            className="ghost-button secondary-action"
            disabled={!canExport || asyncState.isExporting}
            onClick={() => void exportPattern("png")}
          >
            {asyncState.isExporting ? "导出中..." : "导出 PNG"}
          </button>

          {ui.errors.length > 0 ? (
            <section className="card error-card">
              <h2>错误</h2>
              {ui.errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </section>
          ) : null}
        </aside>

        <section className="panel canvas-panel">
          <div className="card canvas-card">
            <div className="section-head">
              <h2>图纸预览</h2>
              <span>
                {result ? `${result.width} × ${result.height}` : "等待生成"}
              </span>
            </div>
            <PatternCanvas result={result} />
          </div>
        </section>

        <aside className="panel stack">
          <section className="card stack">
            <div className="section-head">
              <h2>统计</h2>
              <span>自动汇总</span>
            </div>
            <dl className="stats-list">
              <div>
                <dt>总颗数</dt>
                <dd>{totalBeads}</dd>
              </div>
              <div>
                <dt>使用颜色</dt>
                <dd>{usedColorCount}</dd>
              </div>
              <div>
                <dt>色卡</dt>
                <dd>{palette.paletteId}</dd>
              </div>
            </dl>
          </section>

          <section className="card stack usage-card">
            <div className="section-head">
              <h2>颜色清单</h2>
              <span>{sortedUsage.length} 个</span>
            </div>
            {sortedUsage.length === 0 ? (
              <p className="muted">生成图纸后会在这里显示色号与数量。</p>
            ) : (
              <div className="usage-list">
                {sortedUsage.map((item) => (
                  <div key={item.colorId} className="usage-item">
                    <span
                      className="usage-swatch"
                      style={{ backgroundColor: item.hex }}
                      aria-hidden="true"
                    />
                    <div className="usage-meta">
                      <strong>{item.colorCode}</strong>
                      <span>{item.hex}</span>
                    </div>
                    <div className="usage-count">
                      <strong>{item.count}</strong>
                      <span>{(item.percentage * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </main>
    </div>
  )
}
