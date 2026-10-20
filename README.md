# richasaxena.in

Personal website of Richa Saxena, built with [Astro](https://astro.build).

## Run it locally

```
npm install      # first time only
npm run dev      # http://localhost:3000, refreshes as you save
```

`npm run build` makes the production site in `dist/`, and `npm run preview` serves that build on port 3000.

## Where things live

- `src/pages/` one file per page: `index.astro` (home), `photos.astro` (`/photos`), `contact.astro` (`/contact`), `404.astro` ("a dog ate this page")
- `src/layouts/Base.astro` shared page shell: head, share preview, menu, footer, site script
- `src/components/` shared pieces: `Nav.astro` (menu links), `Footer.astro`, `Photo.astro` (optimised photo with placeholder)
- `src/photos/` your photos, resized automatically (see `src/photos/PHOTOS.txt` for names)
- `src/styles/global.css` colours (tokens at the top) and all animations
- `src/scripts/site.js` scroll reveals, easter eggs, contact form
- `public/og.png` the image shown when the site is shared on LinkedIn, WhatsApp etc.

Hosted on Vercel (settings in `vercel.json`). Every push to `main` builds and goes live.
Contact form uses Web3Forms (access key in `src/pages/contact.astro`) and delivers to Gmail.
