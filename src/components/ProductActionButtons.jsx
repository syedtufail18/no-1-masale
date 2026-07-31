import React from 'react'
import { CONTACT } from '../config/contact.mjs'
import { createWhatsAppEnquiryUrl } from '../utils/whatsapp.mjs'

export default function ProductActionButtons({ product }) {
  const whatsappUrl = CONTACT.whatsappNumber
    ? createWhatsAppEnquiryUrl(CONTACT.whatsappNumber, {
        productName: product.name,
        quantity: '',
        packagingPreference: '',
        city: '',
        businessType: '',
      })
    : null

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {product.productUrl ? (
        <a className="masala-action masala-action-secondary" href={product.productUrl}>View product</a>
      ) : (
        <span className="masala-action masala-action-muted" aria-disabled="true" title="Product page coming soon">View product</span>
      )}
      <a className="masala-action masala-action-primary" href="#enquiry">Email enquiry</a>
      {whatsappUrl ? (
        <a className="masala-action masala-action-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp enquiry</a>
      ) : (
        <span className="masala-action masala-action-muted" aria-disabled="true" title="Add VITE_WHATSAPP_NUMBER to enable WhatsApp enquiries">WhatsApp enquiry</span>
      )}
    </div>
  )
}
