import React, { useEffect, useMemo, useState } from 'react'
import Nav from './components/Nav'
import MasalaExperienceSection from './components/MasalaExperienceSection'
import PackagingCollection from './components/PackagingCollection'
import WhyChooseUs from './components/WhyChooseUs'
import CustomerReviews from './components/CustomerReviews'
import { PRODUCTS, getProductById } from './data/products.mjs'
import { CONTACT } from './config/contact.mjs'

export default function Home() {
  const [showNav, setShowNav] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [navHeight, setNavHeight] = useState(0)
  const [selectedId, setSelectedId] = useState(PRODUCTS[0].id)
  const [enquiry, setEnquiry] = useState({ name: '', email: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)

  const selectedProduct = useMemo(
    () => getProductById(selectedId) || PRODUCTS[0],
    [selectedId]
  )

  useEffect(() => {
    function onScroll() {
      setShowNav(window.scrollY < 50)
    }

    function onMove(e) {
      if (e.clientY < 80) setShowNav(true)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  useEffect(() => {
    function updateNavHeight() {
      const nav = document.querySelector('nav')
      setNavHeight(nav ? Math.round(nav.getBoundingClientRect().height) : 0)
    }
    updateNavHeight()
    window.addEventListener('resize', updateNavHeight)
    return () => window.removeEventListener('resize', updateNavHeight)
  }, [])

  function handleEnquiryChange(e) {
    const { name, value } = e.target
    setEnquiry((s) => ({ ...s, [name]: value }))
  }

  async function handleEnquirySubmit(e) {
    e.preventDefault()
    if (!enquiry.email || !enquiry.message) {
      alert('Please provide your email and a message.')
      return
    }

    setSending(true)
    try {
      const res = await fetch('http://localhost:3001/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...enquiry,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
        }),
      })

      if (res.ok) {
        alert('Enquiry sent! Thank you.')
        setEnquiry({ name: '', email: '', phone: '', message: '' })
        return
      }

      const data = await res.json().catch(() => ({}))
      console.warn('Email server could not send enquiry:', data.message || data.error || res.statusText)
    } catch (err) {
      console.warn('SMTP server not available, falling back to mailto', err)
    } finally {
      setSending(false)
    }

    if (!CONTACT.businessEmail) {
      alert('Enquiry could not be sent. Please try again later.')
      return
    }

    const subject = encodeURIComponent(`Enquiry from ${enquiry.name || 'Website visitor'}`)
    const body = encodeURIComponent(
      `Name: ${enquiry.name}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone}\nProduct: ${selectedProduct.name}\n\nMessage:\n${enquiry.message}`
    )
    window.location.href = `mailto:${CONTACT.businessEmail}?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-screen relative bg-[radial-gradient(circle_at_top,#fff8ed_0%,#fff5e7_32%,#f7f1ea_70%,#f4efe7_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.8),rgba(255,245,225,0.2),rgba(255,255,255,0.55))] animate-sheen" />
      <Nav show={showNav} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main className="relative z-10">
        <section id="home" className="relative flex min-h-screen items-center overflow-hidden pt-24">
          <img
            src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExY255emJpZ2JoazFzZTFwNTBoZWVldHdwc2NqcXRiMzFvejcwaHQ2MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Z1wEt2GB22CbiRrppJ/giphy.gif"
            alt="Spice animation background"
            className="absolute inset-x-0 w-full object-cover opacity-80"
            style={{ top: `${navHeight}px`, height: `calc(100% - ${navHeight}px)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />

          <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-white/40 bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white backdrop-blur-md">
                Indian spice collection
              </span>
              <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-[1.02] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.5)] sm:text-6xl lg:text-7xl">
                The Taste That Brings Families Together.
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:text-xl">
                Every family has a recipe. Every recipe deserves authentic spices.
              </p>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] sm:text-lg sm:leading-8">
                At No. 1 Masale, we believe the heart of every memorable meal lies in pure, carefully selected spices. Inspired by the traditions that bring families together, we help you recreate the rich flavours and aromas that make every gathering special.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#explore"
                  className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-900/25 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Explore masalas
                </a>
                <a
                  href="#enquiry"
                  className="rounded-full border border-white/40 bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Ask for a quote
                </a>
              </div>
            </div>

            <div className="hidden lg:block" />
          </div>
        </section>

        <section aria-hidden className="h-12 md:h-20" />

        <MasalaExperienceSection products={PRODUCTS} onProductChange={setSelectedId} />

        <PackagingCollection />
        <WhyChooseUs />
        <CustomerReviews />

        <section aria-hidden className="h-16 md:h-24" />

        <section id="enquiry" className="mx-auto flex min-h-screen max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={handleEnquirySubmit}
            className="w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_30px_80px_rgba(91,33,6,0.14)] backdrop-blur-xl md:p-10"
          >
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-stone-500">Enquiry</p>
                <h2 className="mt-3 text-3xl font-semibold text-stone-900 sm:text-4xl">Get a spice brief or pricing response.</h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
                  Send a quick note and we&apos;ll reply with the right product detail, packing info, or supply query follow-up.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Name</label>
                  <input
                    name="name"
                    value={enquiry.name}
                    onChange={handleEnquiryChange}
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">Email</label>
                  <input
                    name="email"
                    value={enquiry.email}
                    onChange={handleEnquiryChange}
                    type="email"
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-stone-700">Phone</label>
                  <input
                    name="phone"
                    value={enquiry.phone}
                    onChange={handleEnquiryChange}
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
                    placeholder="Phone number"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-stone-700">Message</label>
                  <textarea
                    name="message"
                    value={enquiry.message}
                    onChange={handleEnquiryChange}
                    required
                    className="h-32 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-amber-400"
                    placeholder="Write your message..."
                  />
                </div>
                <div className="sm:col-span-2 mt-2 flex items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={sending}
                    className="rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-stone-400"
                  >
                    {sending ? 'Sending...' : 'Enquire'}
                  </button>
                  <p className="text-sm text-stone-500 text-right leading-6">We&apos;ll respond within 1-2 business days.</p>
                </div>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}
