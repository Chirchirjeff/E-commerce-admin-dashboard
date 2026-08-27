# Quza Email System — Setup Guide

Everything is built and wired. You only need **two things** to go live:
1. A **Resend account** with a verified sending domain
2. Filling in **four environment variables**

---

## Step 1 — Create a Resend account

1. Go to **[resend.com](https://resend.com)** and sign up (free tier: 3 000 emails/month).
2. In the Resend dashboard, open **Domains** → **Add Domain**.
3. Enter your sending domain, e.g. `quza.app` or `mail.quza.app`.
4. Add the DNS records Resend shows you (SPF, DKIM, DMARC) to your domain registrar.
5. Click **Verify** — this usually takes a few minutes.

> **While you are still testing** you can skip domain verification and send to your
> own email address using Resend's sandbox. Sandbox emails show `onboarding@resend.dev`
> as the sender and only deliver to the address that owns the Resend account.

---

## Step 2 — Get your API key

1. In Resend, go to **API Keys** → **Create API Key**.
2. Give it a name (e.g. `quza-admin`) and set permission to **Sending access**.
3. Copy the key — it starts with `re_`.

---

## Step 3 — Set environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set:

| Variable | Where to find it | Example |
|---|---|---|
| `RESEND_API_KEY` | Resend → API Keys | `re_abc123…` |
| `NEXT_PUBLIC_STOREFRONT_URL` | Your live storefront URL | `https://quza.app` |
| `NEXT_PUBLIC_APP_URL` | This admin dashboard's URL | `https://admin.quza.app` |
| `NEXT_PUBLIC_LOGO_URL` | CDN/public URL of your logo PNG | `https://quza.app/logo.png` |
| `NEXT_PUBLIC_API_URL` | Your backend service URL | `http://localhost:4000` |

> `RESEND_API_KEY` is **server-side only** — never prefix it with `NEXT_PUBLIC_`.
> It is read exclusively inside the Next.js API Route Handler (`/api/email/send`)
> and never exposed to the browser.

---

## Step 4 — Update the "From" address

Open **`src/emails/brand.ts`** and set `fromAddress` to match your verified domain:

```ts
fromAddress: 'Quza <notifications@quza.app>',
```

The local-part (`notifications`) can be anything you like; the domain must
be the one you verified in Resend.

---

## Step 5 — Restart the dev server

```bash
npm run dev
```

---

## How to test

### Option A — Email Dispatch Panel (UI)

1. Log in to the admin dashboard.
2. Click **Email Dispatch** in the sidebar.
3. Choose a template, fill in the fields, enter your own email address as
   the recipient, and click **Send Email**.
4. Check your inbox.

### Option B — cURL / Postman

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_admin_token>" \
  -d '{
    "to": "you@example.com",
    "type": "welcomeUser",
    "props": {
      "recipientName": "Test User",
      "email": "you@example.com",
      "role": "customer"
    }
  }'
```

Expected response:
```json
{ "success": true, "messageId": "re_xxxxxxxx" }
```

---

## Automatic email triggers

These emails fire automatically when an admin performs the corresponding action
— no extra steps needed once your API key is set:

| Admin action | Email sent to | Template |
|---|---|---|
| Approve a vendor KYC | Vendor | Vendor Approval (approved) |
| Reject a vendor KYC | Vendor | Vendor Approval (rejected) |
| Process payouts | Each vendor in the batch | Payout Notification |
| Create a new admin user | New admin | Welcome (admin role) |

All triggers are **fire-and-forget** — a failed email never blocks the admin
action or shows an error to the user. Check the server console for `[emailTrigger]`
warnings if emails are not arriving.

---

## Manual dispatch (programmatic)

Use the trigger helpers anywhere in server or client code:

```ts
import { triggerOrderTrackingEmail } from '@/lib/emailTriggers';

triggerOrderTrackingEmail({
  recipientEmail: 'customer@example.com',
  recipientName: 'Alice',
  orderId: 'QZ-001',
  orderStatus: 'shipped',
  totalAmount: 4500,
  items: [{ name: 'Wireless Earbuds', quantity: 1, price: 4500 }],
  trackingNumber: 'KE123',
  estimatedDelivery: 'Thursday, 28 Aug 2026',
});
```

Or use the low-level `emailService` from a **Server Action or API Route only**:

```ts
import { emailService } from '@/lib/email';

const result = await emailService.sendOrderTracking({
  to: 'customer@example.com',
  props: { /* strongly typed */ },
});
```

---

## File map

```
src/
├── emails/
│   ├── brand.ts                  ← Brand tokens (colours, URLs, from address)
│   ├── BaseLayout.tsx            ← Shared header / footer wrapper
│   ├── index.ts                  ← Barrel export for all templates
│   └── templates/
│       ├── PasswordChanged.tsx
│       ├── OrderTracking.tsx
│       ├── WelcomeUser.tsx
│       ├── KycStatus.tsx
│       ├── PayoutNotification.tsx
│       └── VendorApproval.tsx
├── lib/
│   ├── email.ts                  ← Server-side sendEmail() + emailService
│   └── emailTriggers.ts          ← Client-safe fire-and-forget helpers
├── hooks/
│   └── useEmailDispatch.ts       ← React hook → POST /api/email/send
├── app/
│   ├── api/email/send/route.ts   ← Next.js Route Handler (POST)
│   └── (dashboard)/email/
│       └── page.tsx              ← Email Dispatch UI page
└── components/
    └── email/
        └── EmailDispatchPanel.tsx ← Full composer + dispatch log UI
```

---

## Credentials needed from you

You only need to provide one thing — your **Resend API key** (`RESEND_API_KEY`).
Everything else has sensible defaults that you can update in `brand.ts` and
`.env.local` at any time.
