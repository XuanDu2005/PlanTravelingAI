# Travel Workspace

The trip detail route is now a complete travel workspace with seven areas:

1. **Itinerary** — versioned edits, per-activity AI replacement, full replan,
   print/PDF, calendar export and tokenized public sharing.
2. **Map & weather** — keyless OpenStreetMap/Open-Meteo integration and
   weather-aware day replanning.
3. **Budget** — AI estimates, confirmed booking totals and actual expenses.
4. **Packing** — generated and manual packing lists with progress tracking.
5. **Team** — owner/editor/viewer permissions by account email.
6. **Journal** — dated travel memories with optional image URLs.
7. **Booking Vault** — manual reservation tracking without storing card data.

Additional product features include recommendation reviews, in-app
notifications, a public shared-trip page, a Travel Passport dashboard and a
production service worker. Trip details are cached per signed-in user so the
latest loaded itinerary remains readable offline.

## Database upgrade

After configuring `DATABASE_URL`, apply the committed migration:

```bash
pnpm --filter @travelmind/api prisma:deploy
```

Docker deployments already run `prisma migrate deploy` during API startup.

## External services

- Maps use OpenStreetMap embeds and Google Maps deep links; no key is stored.
- Weather uses Open-Meteo and degrades to a clear unavailable state.
- Booking Vault tracks reservations only. A real payment gateway must be
  connected with merchant credentials before accepting charges.
- PWA registration is production-only; Vite development stays uncached.
