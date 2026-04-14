// ZIMSEC grading scale

export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'U'

export interface GradeResult {
  letter: GradeLetter
  percentage: number
  points: number // O-Level points: A=1, B=2, C=3, D=4, E=5
  label: string
}

/**
 * Calculate ZIMSEC grade letter from raw score and max marks.
 * Scale: A ≥ 80%, B ≥ 65%, C ≥ 50%, D ≥ 40%, E ≥ 25%, U < 25%
 */
export function calculateGrade(rawScore: number, maxScore: number): GradeResult {
  if (maxScore <= 0) throw new Error('maxScore must be greater than 0')

  const percentage = (rawScore / maxScore) * 100

  let letter: GradeLetter
  let points: number
  let label: string

  if (percentage >= 80) {
    letter = 'A'; points = 1; label = 'Distinction'
  } else if (percentage >= 65) {
    letter = 'B'; points = 2; label = 'Merit'
  } else if (percentage >= 50) {
    letter = 'C'; points = 3; label = 'Credit'
  } else if (percentage >= 40) {
    letter = 'D'; points = 4; label = 'Pass'
  } else if (percentage >= 25) {
    letter = 'E'; points = 5; label = 'Partial Pass'
  } else {
    letter = 'U'; points = 9; label = 'Ungraded'
  }

  return { letter, percentage: Math.round(percentage * 100) / 100, points, label }
}

/**
 * Calculate grade letter string — convenience wrapper for DB storage.
 */
export function calculateGradeLetter(rawScore: number, maxScore: number): string {
  return calculateGrade(rawScore, maxScore).letter
}

/**
 * Get ZIMSEC O-Level aggregate (best 5 subjects, lower is better).
 */
export function calculateAggregate(grades: GradeLetter[]): number {
  const points: Record<GradeLetter, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, U: 9,
  }
  const sorted = grades
    .map(g => points[g])
    .sort((a, b) => a - b)
    .slice(0, 5)

  return sorted.reduce((sum, p) => sum + p, 0)
}

/**
 * Format percentage for display.
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}
