import React from 'react'
import { CONTACT } from '../config/contact.mjs'
import { createWhatsAppEnquiryUrl } from '../utils/whatsapp.mjs'

export default function FloatingWhatsApp({ product, quantity }) {
  if (!CONTACT.whatsappNumber || !product) return null

  const href = createWhatsAppEnquiryUrl(CONTACT.whatsappNumber, {
    productName: product.name,
    quantity,
    packagingPreference: quantity,
    city: '',
    businessType: '',
  })

  return (
    <a
      className="whatsapp-float"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Start a WhatsApp enquiry for ${product.name}`}
    >
      <span className="whatsapp-float-mark" aria-hidden="true">WA</span>
      <span>WhatsApp</span>
    </a>
  )
}
