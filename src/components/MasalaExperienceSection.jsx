import React, { useCallback, useEffect, useRef, useState } from 'react'
import MasalaBoxScene from './MasalaBoxScene'
import SpiceProductPanel from './SpiceProductPanel'
import { getMasalaSequenceState } from '../utils/masalaSequence.mjs'

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

function useMasalaChangeSound() {
  const audioContextRef = useRef(null)
  const audioReadyRef = useRef(false)

  useEffect(() => {
    const prepareAudio = () => {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return

      if (!audioContextRef.current) audioContextRef.current = new AudioContext()
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume().catch(() => {})
      audioReadyRef.current = true
    }

    window.addEventListener('pointerdown', prepareAudio, { passive: true })
    window.addEventListener('keydown', prepareAudio)
    window.addEventListener('touchstart', prepareAudio, { passive: true })
    window.addEventListener('wheel', prepareAudio, { passive: true })

    return () => {
      window.removeEventListener('pointerdown', prepareAudio)
      window.removeEventListener('keydown', prepareAudio)
      window.removeEventListener('touchstart', prepareAudio)
      window.removeEventListener('wheel', prepareAudio)
      audioContextRef.current?.close().catch(() => {})
    }
  }, [])

  return useCallback(() => {
    const context = audioContextRef.current
    if (!audioReadyRef.current || !context || context.state !== 'running') return

    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const filter = context.createBiquadFilter()

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(330, now)
    oscillator.frequency.exponentialRampToValueAtTime(230, now + 0.11)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1050, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.115)

    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.12)
  }, [])
}

function MobileProductList({ products, onProductChange }) {
  return (
    <div className="masala-mobile-list lg:hidden">
      {products.map((product) => (
        <div key={product.id} onFocus={() => onProductChange(product.id)}>
          <SpiceProductPanel product={product} staticLayout />
        </div>
      ))}
    </div>
  )
}

function ResponsiveMasalaBox({ products, activeIndex = 0, focusProgress = 0, rotation = 0 }) {
  return (
    <div className="masala-mobile-scene">
      <MasalaBoxScene
        products={products}
        activeIndex={activeIndex}
        focusProgress={focusProgress}
        rotation={rotation}
      />
    </div>
  )
}

export default function MasalaExperienceSection({ products, onProductChange }) {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const panelRef = useRef(null)
  const [sequence, setSequence] = useState(() => getMasalaSequenceState(0, products.length))
  const [connector, setConnector] = useState(null)
  const [isSoundSectionActive, setIsSoundSectionActive] = useState(false)
  const previousSoundIndexRef = useRef(sequence.activeIndex)
  const reducedMotion = usePrefersReducedMotion()
  const playMasalaChangeSound = useMasalaChangeSound()
  const activeProduct = products[sequence.activeIndex] || products[0]
  const rotation = -(sequence.progress * 400)

  useEffect(() => {
    if (reducedMotion) return undefined

    const section = sectionRef.current
    if (!section) return undefined
    let frame = 0

    const update = () => {
      const rect = section.getBoundingClientRect()
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const progress = Math.min(Math.max(-rect.top / travel, 0), 1)
      const next = getMasalaSequenceState(progress, products.length)

      setSequence((current) => (
        current.activeIndex === next.activeIndex
        && Math.abs(current.localProgress - next.localProgress) < 0.008
          ? current
          : next
      ))
      frame = 0
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [products.length, reducedMotion])

  useEffect(() => {
    onProductChange(activeProduct.id)
  }, [activeProduct.id, onProductChange])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setIsSoundSectionActive(entry.isIntersecting),
      { threshold: 0.1 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isSoundSectionActive) {
      previousSoundIndexRef.current = sequence.activeIndex
      return
    }

    if (previousSoundIndexRef.current !== sequence.activeIndex) playMasalaChangeSound()
    previousSoundIndexRef.current = sequence.activeIndex
  }, [isSoundSectionActive, playMasalaChangeSound, sequence.activeIndex])

  useEffect(() => {
    if (reducedMotion) return undefined

    let frame = 0
    const updateConnector = () => {
      frame = 0
      const stage = stageRef.current
      const panel = panelRef.current
      const target = stage?.querySelector(`[data-product-id="${activeProduct.id}"]`)
      if (!stage || !panel || !target || window.innerWidth < 1024) {
        setConnector(null)
        return
      }

      const stageRect = stage.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const startX = panelRect.left - stageRect.left + 16
      const startY = panelRect.top - stageRect.top + panelRect.height * 0.32
      const endX = targetRect.left - stageRect.left + targetRect.width / 2
      const endY = targetRect.top - stageRect.top + targetRect.height / 2
      const elbowX = startX - Math.max(88, Math.min(210, Math.abs(startX - endX) * 0.48))

      setConnector({
        endX,
        endY,
        height: stageRect.height,
        path: `M ${startX} ${startY} L ${elbowX} ${startY} L ${endX} ${endY}`,
        startX,
        startY,
        width: stageRect.width,
      })
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateConnector)
    }

    requestUpdate()
    const settleTimer = window.setTimeout(requestUpdate, 700)
    window.addEventListener('resize', requestUpdate)
    window.addEventListener('scroll', requestUpdate, { passive: true })

    return () => {
      window.clearTimeout(settleTimer)
      window.removeEventListener('resize', requestUpdate)
      window.removeEventListener('scroll', requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [activeProduct.id, reducedMotion, rotation])

  if (reducedMotion) {
    return (
      <section id="explore" className="masala-experience masala-reduced-motion" data-testid="masala-experience">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="masala-kicker">Masala collection</p>
          <h2 className="mt-3 text-4xl font-semibold text-stone-950">Explore each masala at your own pace.</h2>
          <ResponsiveMasalaBox products={products} />
          <MobileProductList products={products} onProductChange={onProductChange} />
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} id="explore" className="masala-experience" data-testid="masala-experience">
      <div className="masala-desktop-track hidden lg:block">
        <div ref={stageRef} className="masala-desktop-stage">
          {connector && (
            <svg className="masala-connector" viewBox={`0 0 ${connector.width} ${connector.height}`} aria-hidden="true">
              <defs>
                <marker id="masala-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 z" />
                </marker>
              </defs>
              <path className="masala-connector-line" d={connector.path} markerEnd="url(#masala-arrowhead)" />
              <circle className="masala-connector-origin" cx={connector.startX} cy={connector.startY} r="4" />
            </svg>
          )}
          <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-8 py-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)]">
            <div className="relative">
              <p className="masala-kicker">Scroll-driven spice selection</p>
              <h2 className="mt-3 max-w-md text-5xl font-semibold leading-tight text-stone-950">The masala box, one blend at a time.</h2>
              <MasalaBoxScene
                products={products}
                activeIndex={sequence.activeIndex}
                focusProgress={0}
                rotation={rotation}
              />
              <div className="masala-progress" role="progressbar" aria-label="Masala collection progress" aria-valuemin="1" aria-valuemax={products.length} aria-valuenow={sequence.activeIndex + 1}>
                <span>{String(sequence.activeIndex + 1).padStart(2, '0')}</span>
                <div><i style={{ transform: `scaleX(${(sequence.activeIndex + 1) / products.length})` }} /></div>
                <span>{String(products.length).padStart(2, '0')}</span>
              </div>
            </div>
            <div ref={panelRef} className={`masala-panel-wrap masala-panel-wrap--${sequence.activeIndex}`}>
              <SpiceProductPanel product={activeProduct} panelProgress={1} />
            </div>
          </div>
        </div>
      </div>
      <div className="lg:hidden">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <p className="masala-kicker">Masala collection</p>
          <h2 className="mt-3 text-4xl font-semibold text-stone-950">A closer look at every masala.</h2>
          <ResponsiveMasalaBox
            products={products}
            activeIndex={sequence.activeIndex}
            focusProgress={sequence.focusProgress}
            rotation={rotation}
          />
          <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">The detailed scroll sequence is available on larger screens. Every product detail remains here for touch-friendly browsing.</p>
          <MobileProductList products={products} onProductChange={onProductChange} />
        </div>
      </div>
    </section>
  )
}
