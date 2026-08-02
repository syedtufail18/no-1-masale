# Hosted Review Setup

The review API uses Supabase for hosted Postgres data and private image storage. The React app still talks only to the Express server, so the Supabase service-role key never reaches the browser.

## 1. Create the Supabase project

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run the contents of `server/supabase-schema.sql`.
4. In **Project Settings > API**, copy the project URL and server-only service-role key.

The service-role key bypasses Row Level Security and must remain server-side. The review table and image bucket are private; approved images are exposed only through short-lived signed URLs.

## 2. Add server environment variables

Add these values to the project-root `.env` file, alongside the existing SMTP settings:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_REVIEW_BUCKET=review-images
ADMIN_REVIEW_TOKEN=use-a-long-private-token
REVIEW_ADMIN_EMAIL=your-business-email@example.com
REVIEW_ADMIN_BASE_URL=http://127.0.0.1:3001
```

`REVIEW_ADMIN_EMAIL` is optional. If omitted, the existing `TO_EMAIL` value receives review alerts. `REVIEW_ADMIN_BASE_URL` should be the publicly reachable backend URL in production. For local testing, use `http://127.0.0.1:3001`; for ngrok, use the HTTPS URL for the backend.

## 3. Migrate the existing local review once

Keep the current `server/data/reviews.json` and `server/uploads` until the migration succeeds, then run:

```powershell
npm run migrate:reviews
```

The script uploads existing images to Supabase Storage and inserts the review records into `customer_reviews`. It does not delete the local files, so you can verify first.

## 4. Start and verify

Restart the API after changing `.env`:

```powershell
npm run start:mailer
```

Check:

```powershell
Invoke-RestMethod http://127.0.0.1:3001/health
```

Expected values include:

```text
reviewStorage : supabase
emailReady    : True
```

## 5. Approve reviews

New reviews are saved with `pending` status. The configured admin address receives an email containing the review ID, rating, text, and a temporary image preview link.

To list submissions:

```powershell
$token = "your-admin-review-token"
$headers = @{ Authorization = "Bearer $token" }
$reviews = Invoke-RestMethod -Uri "http://127.0.0.1:3001/admin/reviews" -Headers $headers
$reviews.reviews | Format-List
```

To approve one:

```powershell
$reviewId = "paste-review-id-here"
Invoke-RestMethod -Method Patch `
  -Uri "http://127.0.0.1:3001/admin/reviews/$reviewId" `
  -Headers $headers `
  -ContentType "application/json" `
  -Body '{"status":"approved"}'
```

Approved reviews appear on the website. Rejected review images are removed from Supabase Storage. Email approve/reject links expire after 48 hours and open a confirmation page before changing status. The website refreshes approved reviews every 10 seconds and when the browser tab regains focus.
