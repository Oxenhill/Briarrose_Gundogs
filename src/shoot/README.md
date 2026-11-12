# WGSC Team app (`/shoot`)

Private attendance and contacts app for Westerham Game Shooting Club's beaters and pickers-up.
Served at `shoot.briarrosegundogs.co.uk` (the proxy sends `/` there to `/shoot`, and sends
`briarrosegundogs.co.uk/shoot` to the subdomain). On previews and localhost, use `/shoot`.

- **Data:** its own Neon Postgres database (free plan), kept apart from all Dog Smart data. Env var `SHOOT_DATABASE_DATABASE_URL` (set by the Vercel Neon integration; `SHOOT_DATABASE_URL` for local). It sets itself up on first use (`src/shoot/bootstrap.ts`).
- **Sign-in:** mobile number + 4-digit PIN (older 6-digit PINs still sign in) (scrypt-hashed), 180-day cookie, lock after 5 wrong PINs. No SMS or email is ever sent.
- **Joining:** one-time personal invites, PIN reset links, a shared WhatsApp group link (optional approval), and a one-time owner link.
- **Roles:** keeper, underkeeper, admin, deputy, member, plus `is_owner` (Oliver) — only the owner changes keeper/underkeeper. Checked in every server action.
- **Bag records:** drives (keeper/admins set up, reorder, retire), per-drive or whole-day recording by keepers/admins/deputies, season stats for everyone (`/shoot/stats`).
- **Spec:** the "WGSC Shoot Team App — Spec & Privacy Notice" doc.

Database tool (run with `SHOOT_DATABASE_URL` set):

```
node scripts/shoot-db.mjs migrate        # create/update tables
node scripts/shoot-db.mjs seed-dates     # load season-2026-27.json
node scripts/shoot-db.mjs owner-link     # one-time link to create the system-owner account
```
