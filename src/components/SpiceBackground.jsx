import React, { useEffect, useRef, useState } from 'react'
import spiceImg from "../assets/spice bowl.png";
export default function SpiceBackground({ rotations = 2, sectionId = 'explore', hideAfterId = 'enquiry' }) {
  const rotateRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const lastScrollTop = useRef(0)

  // If parent passes `active` boolean, use that to control visibility.
  // Otherwise fall back to observing the section in the DOM.
  useEffect(() => {
    const target = document.getElementById(sectionId)
    const hideAfter = document.getElementById(hideAfterId)
    if (!target) return

    const updateVisibility = () => {
      const scrollTop = window.scrollY || window.pageYOffset
      const viewportHeight = window.innerHeight
      const targetRect = target.getBoundingClientRect()
      const targetTop = targetRect.top + scrollTop
      const targetBottom = targetTop + targetRect.height
      const hideAfterTop = hideAfter ? hideAfter.getBoundingClientRect().top + scrollTop : Number.POSITIVE_INFINITY

      const start = targetTop + viewportHeight * 0.08
      const end = Math.min(targetBottom - viewportHeight * 0.45, hideAfterTop - viewportHeight * 0.7)
      setVisible(scrollTop >= start && scrollTop <= end)
    }

    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateVisibility)

    return () => {
      window.removeEventListener('scroll', updateVisibility)
      window.removeEventListener('resize', updateVisibility)
    }
  }, [sectionId, hideAfterId])

  // Rotation effect only active while visible
  useEffect(() => {
    const el = rotateRef.current
    if (!el) return

    let ticking = false

    function update() {
      const scrollTop = window.scrollY || window.pageYOffset
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0
      const delta = scrollTop - lastScrollTop.current
      lastScrollTop.current = scrollTop
      const momentum = Math.max(Math.min(delta * 0.6, 24), -24)
      const angle = progress * 360 * rotations + momentum
      el.style.transform = `rotate(${angle}deg)`
      ticking = false
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update)
        ticking = true
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [rotations])
  // Position the semicircle so it aligns vertically with the Explore section center
  const [topPx, setTopPx] = useState('50%')

  // Compute vertical position once when the semicircle becomes visible.
  // This prevents the semicircle from moving up/down on scroll; it will remain at
  // the computed position while visible and hide when not visible.
  useEffect(() => {
    // Fix the semicircle vertically centered in the viewport (left middle)
    if (!visible) return
    setTopPx('50%')
  }, [visible])

  const containerClass = `fixed left-0 overflow-hidden rounded-full pointer-events-none transition-all duration-500 ease-out z-0 ${
    visible ? 'opacity-100' : 'opacity-0'
  }`

  const containerTransform = visible ? 'translate(-50%, -50%)' : 'translate(-130%, -50%)'

  return (
    <div
      aria-hidden="true"
      className={containerClass}
      style={{
        top: topPx,
        width: 'min(100vh, 50vw)',
        height: 'min(100vh, 50vw)',
        zIndex: 0,
        transform: containerTransform,
        willChange: 'transform, opacity',
      }}
    >
      <img
        ref={rotateRef}
        // src="https://img.freepik.com/premium-photo/piquant-curry-masala-sauce-isolated-white-background_787273-54153.jpg?w=1800"
        src={spiceImg}
        alt="Spices"
        className="w-full h-full object-cover transition-transform duration-200 linear"
        style={{ transformOrigin: '50% 50%' }}
      />
    </div>
  )
}
