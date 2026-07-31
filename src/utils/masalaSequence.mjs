export function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(Math.max(value, minimum), maximum)
}

export function smoothStep(start, end, value) {
  const progress = clamp((value - start) / (end - start))
  return progress * progress * (3 - 2 * progress)
}

/**
 * Turns scroll progress into presentation state. The sequence data stays out of
 * the product catalogue so animation can evolve independently from business data.
 */
export function getMasalaSequenceState(progress, productCount) {
  const safeCount = Math.max(1, productCount)
  const normalizedProgress = clamp(progress)
  const rawStep = normalizedProgress * safeCount
  const activeIndex = Math.min(safeCount - 1, Math.floor(rawStep))
  const localProgress = activeIndex === safeCount - 1
    ? clamp(rawStep - activeIndex)
    : rawStep - activeIndex

  const rotationProgress = smoothStep(0.02, 0.46, localProgress)
  const focusProgress = smoothStep(0.22, 0.48, localProgress) * (1 - smoothStep(0.7, 0.96, localProgress))
  const panelProgress = smoothStep(0.32, 0.56, localProgress) * (1 - smoothStep(0.68, 0.94, localProgress))

  return {
    activeIndex,
    focusProgress,
    isComposed: normalizedProgress > 0.985,
    localProgress,
    panelProgress,
    progress: normalizedProgress,
    rotationProgress,
  }
}
