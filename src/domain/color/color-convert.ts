export type RgbColor = {
  r: number
  g: number
  b: number
}

export type XyzColor = {
  x: number
  y: number
  z: number
}

export type LabColor = {
  l: number
  a: number
  b: number
}

const REF_X = 95.047
const REF_Y = 100
const REF_Z = 108.883

function clampRgbChannel(value: number): number {
  return Math.min(255, Math.max(0, value))
}

function srgbToLinear(channel: number): number {
  const normalized = clampRgbChannel(channel) / 255

  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4)
}

export function rgbToXyz(rgb: RgbColor): XyzColor {
  const r = srgbToLinear(rgb.r)
  const g = srgbToLinear(rgb.g)
  const b = srgbToLinear(rgb.b)

  return {
    x: (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100,
    y: (r * 0.2126729 + g * 0.7151522 + b * 0.072175) * 100,
    z: (r * 0.0193339 + g * 0.119192 + b * 0.9503041) * 100,
  }
}

function pivotXyz(value: number): number {
  return value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116
}

export function xyzToLab(xyz: XyzColor): LabColor {
  const x = pivotXyz(xyz.x / REF_X)
  const y = pivotXyz(xyz.y / REF_Y)
  const z = pivotXyz(xyz.z / REF_Z)

  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  }
}

export function rgbToLab(rgb: RgbColor): LabColor {
  return xyzToLab(rgbToXyz(rgb))
}
