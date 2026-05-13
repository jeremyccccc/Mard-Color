import type { LabColor } from "./color-convert"

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

function normalizeHueDegrees(degrees: number): number {
  if (degrees < 0) return degrees + 360
  if (degrees >= 360) return degrees - 360
  return degrees
}

export function ciede2000(lab1: LabColor, lab2: LabColor): number {
  const L1 = lab1.l
  const a1 = lab1.a
  const b1 = lab1.b
  const L2 = lab2.l
  const a2 = lab2.a
  const b2 = lab2.b

  const avgLp = (L1 + L2) / 2
  const C1 = Math.sqrt(a1 * a1 + b1 * b1)
  const C2 = Math.sqrt(a2 * a2 + b2 * b2)
  const avgC = (C1 + C2) / 2

  const pow7 = Math.pow(avgC, 7)
  const G = 0.5 * (1 - Math.sqrt(pow7 / (pow7 + Math.pow(25, 7))))

  const a1p = (1 + G) * a1
  const a2p = (1 + G) * a2
  const C1p = Math.sqrt(a1p * a1p + b1 * b1)
  const C2p = Math.sqrt(a2p * a2p + b2 * b2)
  const avgCp = (C1p + C2p) / 2

  const h1p =
    C1p === 0 ? 0 : normalizeHueDegrees(radiansToDegrees(Math.atan2(b1, a1p)))
  const h2p =
    C2p === 0 ? 0 : normalizeHueDegrees(radiansToDegrees(Math.atan2(b2, a2p)))

  const deltaLp = L2 - L1
  const deltaCp = C2p - C1p

  let deltahp = 0
  if (C1p !== 0 && C2p !== 0) {
    const diff = h2p - h1p
    if (Math.abs(diff) <= 180) {
      deltahp = diff
    } else if (diff > 180) {
      deltahp = diff - 360
    } else {
      deltahp = diff + 360
    }
  }

  const deltaHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(degreesToRadians(deltahp / 2))

  let avgHp = h1p + h2p
  if (C1p === 0 || C2p === 0) {
    avgHp = h1p + h2p
  } else if (Math.abs(h1p - h2p) > 180) {
    avgHp = (h1p + h2p + 360) / 2
  } else {
    avgHp = (h1p + h2p) / 2
  }

  const T =
    1 -
    0.17 * Math.cos(degreesToRadians(avgHp - 30)) +
    0.24 * Math.cos(degreesToRadians(2 * avgHp)) +
    0.32 * Math.cos(degreesToRadians(3 * avgHp + 6)) -
    0.2 * Math.cos(degreesToRadians(4 * avgHp - 63))

  const deltaTheta = 30 * Math.exp(-Math.pow((avgHp - 275) / 25, 2))
  const Rc = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)))

  const Sl =
    1 + (0.015 * Math.pow(avgLp - 50, 2)) / Math.sqrt(20 + Math.pow(avgLp - 50, 2))
  const Sc = 1 + 0.045 * avgCp
  const Sh = 1 + 0.015 * avgCp * T

  const Rt = -Math.sin(degreesToRadians(2 * deltaTheta)) * Rc

  const termL = deltaLp / Sl
  const termC = deltaCp / Sc
  const termH = deltaHp / Sh

  return Math.sqrt(
    termL * termL +
      termC * termC +
      termH * termH +
      Rt * termC * termH
  )
}
