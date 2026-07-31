import React from 'react'

export default function Hero({ product }) {
  if (!product) return null

  return (
    <div className="sticky top-28 rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-[0_30px_80px_rgba(91,33,6,0.14)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-amber-700/80">{product.category}</p>
          <h2 className="mt-2 text-3xl font-semibold text-stone-900">{product.name}</h2>
        </div>
        <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
          {product.heat}
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-stone-600">{product.fullDescription}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-stone-500">Best in</p>
          <p className="mt-2 text-sm font-medium text-stone-800">{product.uses.join(', ')}</p>
        </div>
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-stone-500">Aroma</p>
          <p className="mt-2 text-sm font-medium text-stone-800">{product.flavourProfile}</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5">
        <p className="text-[0.72rem] uppercase tracking-[0.24em] text-stone-500">Signature note</p>
        <p className="mt-2 text-sm leading-7 text-stone-700">{product.signatureNote}</p>
      </div>
    </div>
  )
}
