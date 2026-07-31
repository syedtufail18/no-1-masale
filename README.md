# Scroll Zoom Demo (React + Tailwind)

This is a minimal demo showing how to animate a hero image on scroll using Tailwind and React.

How it works
- The `Hero` component uses `IntersectionObserver` to detect when the image container is at least 50% visible.
- When visible, we apply `scale-100`; when out of view we apply `scale-110`, creating a zoom-in/zoom-out effect.

Run locally (PowerShell on Windows):

```powershell
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

Adjust the behavior by changing the `threshold` or the Tailwind `scale-` classes and `duration-` utilities.
