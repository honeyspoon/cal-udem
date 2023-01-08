import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn:
    SENTRY_DSN ||
    "https://36478142d73a48418ebecf61ac52d391@o4504443850260480.ingest.sentry.io/4504443855831040",
  tracesSampleRate: 1.0,
});
