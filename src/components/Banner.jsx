import React, { useEffect, useRef, useState } from 'react'

export default function Banner({ title, detail }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.5 }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`mb-8 transform transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
    >
      <div className="bg-white/90 backdrop-blur-sm p-8s rounded-lg shadow-md max-w-md">
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{detail}</p>
      </div>
    </div>
  )
}
