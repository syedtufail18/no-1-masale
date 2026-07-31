const express = require('express')
const cors = require('cors')
const nodemailer = require('nodemailer')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const requiredSmtpVars = ['SMTP_USER', 'SMTP_PASS']

function getMissingSmtpVars() {
  return requiredSmtpVars.filter((name) => !process.env[name])
}

app.get('/health', (_req, res) => {
  const missing = getMissingSmtpVars()
  res.json({
    ok: true,
    emailReady: missing.length === 0,
    missing,
  })
})

app.post('/send', async (req, res) => {
  const { name, email, phone, message, productId, productName } = req.body || {}
  if (!email || !message) return res.status(400).json({ error: 'Email and message are required' })

  const missing = getMissingSmtpVars()
  if (missing.length) {
    return res.status(500).json({
      error: 'smtp_not_configured',
      message: `Missing SMTP config: ${missing.join(', ')}`,
    })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const from = process.env.FROM_EMAIL || process.env.SMTP_USER
    const to = process.env.TO_EMAIL || 'syed.uck@gmail.com'

    const info = await transporter.sendMail({
      from,
      to,
      subject: `Enquiry from ${name || 'Website visitor'}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nProduct ID: ${productId || 'Not selected'}\nProduct: ${productName || 'Not selected'}\n\nMessage:\n${message}`,
      replyTo: email,
    })

    return res.json({ ok: true, messageId: info.messageId })
  } catch (err) {
    console.error('Mail send error:', err)
    return res.status(500).json({
      error: 'send_failed',
      message: err.message,
    })
  }
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Mail server listening on http://localhost:${port}`))
