# No. 1 Masale

React and Vite website for No. 1 Masale, including the scroll-driven masala box,
packaging collection, enquiry flow, WhatsApp actions, and moderated customer reviews.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

The email and hosted-review features use the separate Express service:

```powershell
npm run start:mailer
```

## GitHub Pages

The `main` branch deploys the frontend through `.github/workflows/deploy-pages.yml`.
The public site is available at:

`https://syedtufail18.github.io/no-1-masale/`

GitHub Pages hosts the frontend only. Set the repository variables
`VITE_API_BASE_URL`, `VITE_BUSINESS_EMAIL`, `VITE_BUSINESS_PHONE`, and
`VITE_WHATSAPP_NUMBER` in **Settings > Secrets and variables > Actions > Variables**.
`VITE_API_BASE_URL` must point to a separately hosted Express backend for enquiry,
review submission, image storage, and moderation email actions to work in production.
