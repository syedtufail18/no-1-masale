import React, { useEffect, useState } from 'react'

const ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'explore', label: 'Masalas' },
  { id: 'enquiry', label: 'Enquiry' },
]

export default function Nav({ show, mobileOpen, setMobileOpen }) {
  const [active, setActive] = useState('home')

  useEffect(() => {
    const sections = ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean)
    if (!sections.length) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { threshold: 0.55 }
    )

    sections.forEach((section) => obs.observe(section))
    return () => obs.disconnect()
  }, [])

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6">
        <div className="rounded-[1.75rem] border border-white/60 bg-white/75 px-4 py-3 shadow-[0_20px_60px_rgba(91,33,6,0.12)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4">
            <a href="#home" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-lg font-black text-white shadow-lg shadow-amber-500/25">
                M
              </span>
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.34em] text-stone-500">Masale House</p>
                <p className="text-lg font-semibold text-stone-900">No. 1 Masale</p>
              </div>
            </a>

            <div className="hidden md:flex items-center gap-2 rounded-full bg-stone-100/80 p-1">
              {ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    active === item.id
                      ? 'bg-stone-900 text-white shadow-md'
                      : 'text-stone-600 hover:bg-white hover:text-stone-900'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <button
              className="grid h-11 w-11 place-items-center rounded-2xl border border-stone-200 bg-white/90 text-stone-800 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {mobileOpen && (
            <div className="mt-4 grid gap-2 rounded-3xl bg-stone-50 p-2 md:hidden">
              {ITEMS.map((item) => (
                <a
                  key={item.id}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    active === item.id ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-white'
                  }`}
                  href={`#${item.id}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
