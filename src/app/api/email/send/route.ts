/**
 * POST /api/email/send
 * --------------------
 * Authenticated route handler that renders and dispatches a Quza email.
 * Only accessible to logged-in admins (token validated via the Authorization
 * header that Next.js middleware injects from the access_token cookie).
 *
 * Request body (JSON):
 * {
 *   to:      string | string[],   // recipient address(es)
 *   type:    EmailTemplate['type'],
 *   props:   object,              // template-specific props
 *   subject?: string,             // optional subject override
 *   replyTo?: string,
 * }
 *
 * Responses:
 *   200 { success: true,  messageId: string }
 *   400 { success: false, error: string }     — bad request / validation
 *   401 { success: false, error: string }     — not authenticated
 *   500 { success: false, error: string }     — send failure
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, type EmailTemplate } from '@/lib/email';

// Valid template type keys — kept in sync with the TEMPLATE_REGISTRY in email.ts
const VALID_TYPES: ReadonlySet<EmailTemplate['type']> = new Set([
  'passwordChanged',
  'orderTracking',
  'welcomeUser',
  'kycStatus',
  'payoutNotification',
  'vendorApproval',
]);

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Auth check ────────────────────────────────────────────────────────
  // Middleware injects the Authorization header for authenticated requests.
  // If it's absent the caller is not authenticated.
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Authentication required.' },
      { status: 401 }
    );
  }

  // ── 2. Parse body ────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must be valid JSON.' },
      { status: 400 }
    );
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: 'Request body must be a JSON object.' },
      { status: 400 }
    );
  }

  const { to, type, props, subject, replyTo } = body as Record<string, unknown>;

  // ── 3. Validate required fields ──────────────────────────────────────────
  if (!to || (typeof to !== 'string' && !Array.isArray(to))) {
    return NextResponse.json(
      { success: false, error: '`to` must be a string or array of strings.' },
      { status: 400 }
    );
  }

  if (typeof type !== 'string' || !VALID_TYPES.has(type as EmailTemplate['type'])) {
    return NextResponse.json(
      {
        success: false,
        error: `\`type\` must be one of: ${[...VALID_TYPES].join(', ')}.`,
      },
      { status: 400 }
    );
  }

  if (!props || typeof props !== 'object' || Array.isArray(props)) {
    return NextResponse.json(
      { success: false, error: '`props` must be a JSON object.' },
      { status: 400 }
    );
  }

  // Validate `to` array contents
  const toAddresses = Array.isArray(to) ? to : [to];
  if (toAddresses.some((addr) => typeof addr !== 'string' || !addr.includes('@'))) {
    return NextResponse.json(
      { success: false, error: 'All `to` entries must be valid email addresses.' },
      { status: 400 }
    );
  }

  if (toAddresses.length > 50) {
    return NextResponse.json(
      { success: false, error: 'Maximum 50 recipients per request.' },
      { status: 400 }
    );
  }

  // ── 4. Send ──────────────────────────────────────────────────────────────
  const result = await sendEmail({
    to: toAddresses,
    type: type as EmailTemplate['type'],
    // Props are passed through as-is; the template components handle their
    // own prop validation via TypeScript at build time.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: props as any,
    authorization: authHeader,
    ...(typeof subject === 'string' ? { subjectOverride: subject } : {}),
    ...(typeof replyTo === 'string' ? { replyTo } : {}),
  });

  if (!result.success) {
    console.error('[POST /api/email/send] Send failed:', result.error);
    return NextResponse.json(
      { success: false, error: result.error ?? 'Failed to send email.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, messageId: result.messageId });
}

// Only POST is supported on this route
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
