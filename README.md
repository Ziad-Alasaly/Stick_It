# Stick_Ittt

Custom sticker and poster storefront built with `React`, `Vite`, `Tailwind CSS`, and `Supabase`.

## Store details

- Store name: `Stick_Ittt`
- Email: `mohameda7a1985@gmail.com`
- Instagram: `https://instagram.com/z.asaly`
- Vodafone Cash: `01104597435`

## Local development

1. Install dependencies:
   `npm install`
2. Make sure `.env` contains your current `VITE_SUPABASE_*` and `VITE_IMGBB_API_KEY` values.
3. Start development:
   `npm run dev`

## Production preview

1. Build the app:
   `npm run build`
2. Preview the production build locally:
   `npm run preview`

## Deploy online

This project is prepared for static hosting.

### Vercel

- `vercel.json` is included for SPA routing.
- Build command: `npm run build`
- Output directory: `dist`

### Netlify

- `netlify.toml` and `public/_redirects` are included.
- Build command: `npm run build`
- Publish directory: `dist`

## Notes

- Product images and inspiration images are local project assets under `public/images/`.
- Orders are stored in Supabase.
- Vodafone Cash currently works as the main prepaid payment method, with receipt upload required.
