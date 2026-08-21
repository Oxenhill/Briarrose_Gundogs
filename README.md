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

Everything lives under `/studio`, organised into sections. Each section's name in the Studio sidebar matches the page it powers:

- **Site Settings** (singleton, at the top of the sidebar) — everything that isn't tied to a specific class, dog, or post: homepage text, contact details, social links, newsletter copy, footer text, and default SEO. Because this one document covers so much, it's split into tabs across the top of the editing screen — **General**, **Homepage: Hero**, **Homepage: Philosophy**, **Homepage: Booking Banner**, **Contact Details**, **Social Links**, **Newsletter & Footer**, and **Branding & SEO**. Your phone number and email address are under the **Contact Details** tab; your logo is under **Branding & SEO**.
- **About Page (Trainer Profile)** (singleton) — name, job title, photo, bio, credentials — powers `/about`.
- **Classes & Services** — one entry per class or service. Title, slug, summary, full description, stage/age label, price, an optional per-class **booking link** (see below), an optional **location** (see below), photo, display order, and an "active" toggle to hide a class without deleting it. The photo on each entry shows on that class's own page (not the summary list). These automatically appear in the homepage list, the scrolling marquee, the `/classes` page, `llms.txt`, and the sitemap — add, edit, reorder, or retire a class here and it updates everywhere.
- **Locations** — one entry per training venue: name, address, postcode, an optional Google Maps link, and optional notes (parking/access). Pick a location on any Classes & Services entry that runs there — edit the venue once here and it updates on every class held at that venue. Not yet linked from its own page; for now it only shows through the classes that reference it.
- **Dogs** — profiles for `/dogs`. Each dog has a **main photo** (shown on the `/dogs` grid and at the top of its own page) and optional **additional photos** (shown further down that dog's page).
- **Testimonials** — quotes for `/testimonials`, with a "feature on homepage" toggle for the one shown in the pull-quote band.
- **Gallery Photos** — the photo grid for `/gallery`, one entry per photo.
- **Video Hub** — embeds for `/videos` (paste a YouTube/Vimeo embed URL).
- **Journal Posts** — posts for `/journal` (this section is called "Journal" to visitors, "Journal Posts" here).
- **Events** — working days and community events for `/events`.
- **Policy Pages** — long-form pages (training methods, terms & conditions) linked from the footer under "Legal".
- **FAQs** — question/answer pairs for `/faq`, also emitted as structured data so they can surface directly in search results.

Every "Book" button site-wide (nav bar, homepage, contact page) links to the global **Booking link** in Site Settings → General. A class's own page uses that same global link too, *unless* you fill in a **Booking link** on that specific Classes & Services entry — if you do, that class's page and "Book This Class" button use its own Dog Smart share link instead. Leave a class's booking link empty to keep it on the global one.

Every image field in the Studio has a short description under its label explaining exactly which page and position it fills — hover or look just under the field title if you're not sure where a photo will appear. A few optional photo fields (testimonial photos, event photos) are defined but not yet wired into the page design — their descriptions say so explicitly.

Until an entry exists, its section falls back to placeholder content (marked clearly as such) so the site never looks broken or empty.

### Where do I add a photo?

| I want a photo on… | Go to… |
| --- | --- |
| The header/menu logo | **Site Settings** → **Branding & SEO** tab → *Logo* |
| The homepage banner section (top) | Not photo-based by design — text only |
| The homepage "Philosophy" section | **Site Settings** → **Homepage: Philosophy** tab → *Photo (optional)* — leave empty to keep the logo mark shown there |
| The homepage banner near the bottom | **Site Settings** → **Homepage: Booking Banner** tab → *Photo (optional)* |
| A specific class/service page | **Classes & Services** → open that class → *Photo* |
| The Our Dogs page / a dog's page | **Dogs** → open that dog → *Main photo* and *Additional photos* |
| The About page | **About Page (Trainer Profile)** → *Photo* |
| The Gallery page | **Gallery Photos** → add a new entry per photo |
| A Journal post | **Journal Posts** → open that post → *Cover image* |
| Social share previews (link previews) | **Site Settings** → **Branding & SEO** tab → *Default social-share image* |

### Cropping photos, and what shape works best

Every photo slot on the site displays photos at a specific shape (landscape, portrait, or square) — if your photo isn't already that shape, it gets automatically cropped to fit, centred by default. For a photo where the centre crop cuts off something you want kept in frame (a group shot, for example), you can fix it yourself:

1. In the Studio, click the photo thumbnail on the field you want to fix.
2. A crop/hotspot tool opens over the image — drag the circular marker (or resize the crop box) onto the part of the photo you want kept in frame.
3. Close the editor and publish — the live site picks it up within about a minute.

Shooting or selecting photos in roughly the right shape to begin with means less cropping is needed. Rough guide:

| Photo | Shape | Notes |
| --- | --- | --- |
| Logo (Site Settings → Branding & SEO) | Tall portrait (~4:5) | Include the wordmark text — it's shown large, not as a small badge |
| Dog main photo & additional photos | Landscape (4:3) | Group photos work well here — nothing forced to a tight square |
| Class/service photo | Wide landscape (16:9) | |
| Trainer photo (About page) | Tall portrait (~4:5) | |
| Homepage Philosophy / Booking Banner photos | Tall portrait (~4:5) | |
| Gallery photo | Square (1:1) | The one spot on the site that stays square — use the crop tool for group or wide shots |
| Journal cover image | Landscape | Shown a little differently-cropped on the listing vs. the post itself, both landscape |
| Default social-share image | Wide landscape (1200×630px) | Only seen when a page is shared on social media, not on the site itself |

None of this is a hard requirement — any photo can be uploaded and it'll still display — but starting from roughly the right shape (or adjusting the crop tool afterwards) means nothing important gets cropped out.

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
