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

## Production review API

The included `render.yaml` deploys the Express backend as a Render web service.
Create it from the repository with **New + > Blueprint**, provide the prompted
secret values from your local `.env`, and use the resulting `https://...onrender.com`
address for both `REVIEW_ADMIN_BASE_URL` in Render and `VITE_API_BASE_URL` in the
GitHub repository Actions variables. Push or re-run the Pages workflow afterward.

Render's free web services cannot use SMTP ports. For production delivery, add
`RESEND_API_KEY` and `RESEND_FROM_EMAIL` to the Render service instead. The server
uses Resend's HTTPS API when these values are present and retains SMTP for local use.
