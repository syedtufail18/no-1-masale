import React from 'react'

export default function SpiceCard({ product, active, onClick, index }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left rounded-2xl border px-5 py-4 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-amber-500/60 ${
        active
          ? 'border-amber-500 bg-white shadow-[0_20px_50px_rgba(120,53,15,0.14)] translate-y-[-2px]'
          : 'border-white/60 bg-white/80 hover:bg-white hover:border-amber-200 hover:shadow-lg'
      }`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-amber-500' : 'bg-amber-300'} transition-colors`} />
            <span className="text-[0.72rem] uppercase tracking-[0.28em] text-stone-500">{product.origin}</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-stone-900">{product.name}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{product.shortDescription}</p>
        </div>

        <div className={`mt-1 rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500'}`}>
          {product.heat}
        </div>
      </div>
    </button>
  )
}
