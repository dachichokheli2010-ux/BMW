# Collector Plus

Collector Plus expands a practical BMW build planner. The free planner includes one cloud project per account, estimated and actual costs, a forecast against a personal budget, research links and notes, milestones, three budget checkpoints, JSON export and a printable report. Guests can try one separate browser draft. Collector Plus provides twenty cloud projects and fifty checkpoints per project. The game’s coin-funded Garage Pass is a separate feature with no cash value.

The proposed introductory price is USD 4 per month or USD 36 per year. Until billing is configured, `/club` labels these as planned prices, states that payments are closed and links to the free planner. No button can grant a membership locally. When enabled, displayed and charged prices come from the configured provider Prices rather than the proposed amounts.

## Connect payments

The optional implementation uses Stripe Checkout and Customer Portal. Confirm that the owner has an eligible payment account for their business country before enabling it. No payment account, product or live charge was created by this code change.

1. Use the owner’s Stripe sandbox and a separate test database. Create two active USD recurring Prices: one billed every month and one every year. Configure the Customer Portal for cancellation and payment-method updates.
2. Set `PUBLIC_ORIGIN` to the exact HTTPS site origin. Set the private server environment values listed in `.env.example`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_COLLECTOR_MONTHLY_PRICE` and `STRIPE_COLLECTOR_ANNUAL_PRICE`. Never put keys in public JavaScript, Git or `vercel.json`.
3. Register `https://YOUR-DOMAIN/api/membership/webhook` for `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated` and `customer.subscription.deleted`. The integration retrieves current subscription state using Stripe API version `2025-06-30.basil`; it does not grant access from a checkout success URL.
4. Set `COLLECTOR_PAYMENTS_ENABLED=true` only when the account and Prices are ready. The page explicitly labels test mode. Exercise purchase, failed payment, duplicate checkout, renewal, cancellation, portal access and webhook retries with the provider’s test tools. The automated suite mocks the provider boundary; it does not prove a live merchant configuration.
5. Review the business’s published billing, cancellation and tax settings before replacing sandbox credentials and Prices with live ones. Keep test and live customer/subscription IDs in separate databases. Do not mix test IDs with a live Stripe key.

New checkout can be paused with `COLLECTOR_PAYMENTS_ENABLED=false`; existing customers can still open their billing portal and signed lifecycle webhooks still update or revoke access while the other settings remain configured.

## Storage and access

The server owns paid entitlements and enforces project/checkpoint limits. Account sessions, same-origin checks and CSRF tokens protect workspace writes and checkout. Every workspace uses a revision to detect another device’s save. A conflict keeps the local draft available for export and requires an explicit choice before replacement.

Cancellation retains existing projects and checkpoints. Users can read, edit, export and remove them; they cannot add records beyond the free limits. Deleting an account cascades its private planner and billing mapping records. Project currencies are personal entered amounts; the planner does not perform exchange conversion or present estimates as verified prices or fitment advice.

SQLite/D1 migration: `drizzle/0006_collector.sql`. The PostgreSQL adapter includes the same tables in its schema inspection/migration flow; the manual Neon setup is in `sql/neon-accounts.sql`. A deployment database role must be allowed to apply missing tables, or an administrator must run `npm run db:migrate` with the appropriate role before serving the new endpoints.

Relevant verification is included in `npm run check`: Collector API tests against SQLite and PostgreSQL, authenticated billing/webhook tests, mounted planner workflows and membership-page behavior. Vercel rewrites and the Worker build include the new endpoints and modules.
