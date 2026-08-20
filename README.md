# Briarrose Gundogs

The website for Briarrose Gundogs — built with Next.js (App Router) and Sanity CMS, deployed on Vercel.

Almost every word on this site — classes, dog profiles, testimonials, FAQs, journal posts, contact details, even the hero headline — is content you edit yourself in the CMS. Nothing needs a code change or a developer to update. Until you've entered real content, every page falls back to clearly-labelled placeholder text so the site is always complete and presentable.

## Access the CMS

The site is already connected to a live Sanity project ("Briarrose Gundogs", project ID `yss4ld56`), so there's nothing to set up — just log in and start editing.

1. Go to **[briarrose-gundogs.vercel.app/studio](https://briarrose-gundogs.vercel.app/studio)** (once you have a custom domain connected, it'll be `https://yourdomain.co.uk/studio` instead — see step 5 below).
2. Log in with the Sanity account you used to create the project (email, Google, or GitHub — whichever you signed up with at [sanity.io/manage](https://www.sanity.io/manage)).
3. You'll see the content sections listed in the left sidebar — Site Settings, Trainer Profile, Classes, Dogs, Testimonials, and so on (the full list is in "Editing content" below). Click into any of them to edit.
4. Changes you publish in the Studio appear on the live site within about a minute — no redeploy needed.

To edit locally instead (useful for previewing before you publish, or if you're developing further), run `npm run dev` and go to `http://localhost:3000/studio` — this project folder already has a `.env.local` file pointing at the same live project, so it's the same content either way.

If you ever want someone else editing content too, invite them from [sanity.io/manage](https://www.sanity.io/manage) under this project's Members — they'll get their own login to the same Studio.

## 1. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). This already talks to the live Sanity project (via the `.env.local` file already in this folder), so you'll see your real content, not placeholders.

## 2. Sanity project details (reference)

Already configured — you shouldn't need to touch this — but for reference:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=yss4ld56
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
NEXT_PUBLIC_SITE_URL=https://briarrose-gundogs.vercel.app
```

These live in two places, both already set: the `.env.local` file in this folder (for local dev — gitignored, never committed), and the Vercel project's Environment Variables (for the live site). If you ever move to a different Sanity project, update both, plus add the new domain as a CORS origin under the Sanity project's API settings (`sanity.io/manage` → your project → API → CORS origins) — without that, the Studio won't be able to load data from the new origin.

## 3. Editing content

Everything lives under `/studio`, organised into sections:

- **Site Settings** (singleton) — hero text, philosophy section, call-to-action copy, booking link, phone/email, address, coverage area, social links, newsletter copy, footer text, and default SEO title/description. This one document drives most of the copy across every page.
- **Trainer Profile** (singleton) — name, job title, photo, bio, credentials — powers the About page.
- **Classes** — one entry per class or service. Title, slug, summary, full description, stage/age label, price, photo, display order, and an "active" toggle to hide a class without deleting it. These automatically appear in the homepage list, the scrolling marquee, the `/classes` page, `llms.txt`, and the sitemap — add, edit, reorder, or retire a class here and it updates everywhere.
- **Dogs** — profiles for `/dogs`.
- **Testimonials** — quotes, with a "feature on homepage" toggle for the one shown in the pull-quote band.
- **Gallery** — photo grid for `/gallery`, with categories.
- **Videos** — embeds for `/videos` (paste a YouTube/Vimeo embed URL).
- **Journal Posts** — blog posts for `/journal`.
- **Events** — working days and community events for `/events`.
- **Policies** — long-form pages (training methods, terms & conditions) linked from the footer.
- **FAQs** — question/answer pairs for `/faq`, also emitted as structured data so they can surface directly in search results.

Until an entry exists, its section falls back to placeholder content (marked clearly as such) so the site never looks broken or empty.

## 4. SEO & GEO (AI search) foundation

Already wired in and needing no maintenance:

- Per-page metadata, canonical URLs, and Open Graph/Twitter cards, generated from your CMS content.
- Structured data (JSON-LD): `LocalBusiness` site-wide, `Service` per class, `Person` for the trainer, `Article` per journal post, `VideoObject` per video, `Event` per event, and `FAQPage` on the FAQ page.
- `/sitemap.xml` and `/robots.txt`, generated automatically and kept in sync with your content.
- `/llms.txt` — a plain-text summary of the business and its content for AI answer engines (ChatGPT, Claude, Perplexity, etc.), regenerated live from the CMS. `robots.txt` explicitly allows the major AI crawlers alongside standard search bots.

If you change the domain, update `NEXT_PUBLIC_SITE_URL` in both `.env.local` and Vercel's Environment Variables — every canonical URL, sitemap entry, and structured-data reference uses it automatically.

## 5. Deploying

The project is connected to Vercel — pushing to the repository's `main` branch deploys automatically. The live site is currently at [briarrose-gundogs.vercel.app](https://briarrose-gundogs.vercel.app). Once you register a custom domain, add it in the Vercel project's Domains settings, then update `NEXT_PUBLIC_SITE_URL` (both places, as above) and add it as a Sanity CORS origin (also as above) so the Studio keeps working on the new address.

## Tech stack

Next.js (App Router, TypeScript) · Sanity CMS · Tailwind CSS v4 · Vercel
