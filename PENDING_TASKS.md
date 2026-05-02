# Pending Tasks

The TORQai MVP is functional, but there are a few items left to execute before full production launch:

1. **Environment Variables Configuration**
   - Insert the `AUTODEV_API_KEY` into `.env.local` to enable live fetching from Auto.dev instead of using mock data.
   - Ensure the `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` point to your production database.

2. **Database Schema Update**
   - Execute the updated schema SQL for the `matches` table in your Supabase SQL Editor to support the new JSONB columns (`recalls`, `photos`) and the `ai_match_score`.
   - Ensure the `db/schema.sql` is fully synced with your live database.

3. **Geospatial Proximity Scoring**
   - Replace the mock 20% proximity score in `src/services/inventoryService.ts` with actual zip code distance calculations (using a Geo API or zip code database) once the Dealer's location profile is established.

4. **Live Webhook Dispatch**
   - Replace the mock responses in `/api/webhooks/resend` and `/api/webhooks/twilio` with real SDK calls to Twilio and Resend using production keys.

5. **Phase 3 Migration (Marketcheck)**
   - Follow the `TODO` in `inventoryService.ts` to swap Auto.dev for Marketcheck API once budget permits for enterprise-level inventory data.
