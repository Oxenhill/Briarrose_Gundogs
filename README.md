# Briarrose Gundogs

The website for Briarrose Gundogs — built with Next.js (App Router) and Sanity CMS, deployed on Vercel.

Almost every word on this site — classes, dog profiles, testimonials, FAQs, journal posts, contact details, even the hero headline — is content you edit yourself in the CMS. Nothing needs a code change or a developer to update. Until you've entered real content, every page falls back to clearly-labelled placeholder text so the site is always complete and presentable.

## 1. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site works immediately with placeholder content — no setup required to see it running.

## 2. Connect your CMS (Sanity)

The site ships pointed at a placeholder project, so it renders fine without one, but you'll want your own to actually edit content.

1. Create a free account and project at [sanity.io/manage](https://www.sanity.io/manage) (the free tier is enough for a site like this).
2. Note the **Project ID** it gives you.
3. Copy `.env.local.example` to `.env.local` and fill in:

   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
   NEXT_PUBLIC_SITE_URL=https://briarrosegundogs.co.uk
   ```

4. Restart `npm run dev`. The Studio (content editor) is now live at **`/studio`** — e.g. `http://localhost:3000/studio` locally, or `https://yourdomain.co.uk/studio` once deployed. Log in with the same account you used to create the Sanity project.

Add the same three `NEXT_PUBLIC_SANITY_*` variables (plus `NEXT_PUBLIC_SITE_URL`) to your Vercel project's Environment Variables so the live site connects too.

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

If you change the domain, update `NEXT_PUBLIC_SITE_URL` in your environment variables — every canonical URL, sitemap entry, and structured-data reference uses it automatically.

## 5. Deploying

The project is already connected to Vercel. Pushing to the repository's default branch deploys automatically. Set the environment variables from step 2 in the Vercel project settings before the first deploy so the live site can reach your Sanity project.

## Tech stack

Next.js (App Router, TypeScript) · Sanity CMS · Tailwind CSS v4 · Vercel
