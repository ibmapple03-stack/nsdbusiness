# Payments architecture (Stage 2 design)

**Status: designed, not yet implemented.** No payment code runs in Stage 1, and no card data is ever collected or stored by this platform.

> **Verify before building.** Paystack's official documentation (paystack.com/docs) could not be fetched automatically on 17 October 2026. The webhook details below come from consistent secondary sources and must be confirmed against the official docs and the Paystack dashboard before Stage 2 starts:
> - Signature: `x-paystack-signature` header = hex HMAC-SHA512 of the **raw** request body, keyed with the account secret key.
> - Amounts are in the currency subunit (kobo for NGN).
> - Verification endpoint: `GET /transaction/verify/:reference`.
> - Webhook source IP addresses and retry schedule.

## Principles

1. **The browser never decides that something is paid.** The return/callback page only shows "we're checking your payment". An invoice is marked paid only after server-side verification.
2. **Verify everything server-side:** transaction status, amount (kobo), currency (`NGN`), our reference, that the reference belongs to the invoice and to the logged-in student, and that it was paid to our merchant account.
3. **Webhook signatures are checked** with a constant-time comparison against the raw body, before parsing JSON.
4. **Idempotency.** Each provider event is stored in `ProviderEvent` with a **unique** provider event id. Processing runs in a transaction that inserts this row first. A duplicate delivery fails the unique constraint and is acknowledged without re-processing. `Receipt` is unique per `Payment`, and `Payment` is unique per provider transaction, so duplicates can never create a second receipt or enrolment.
5. **States are explicit.** A `PaymentAttempt` is `INITIATED → PENDING → SUCCEEDED | FAILED | ABANDONED`, and later `REVERSED` or `REFUNDED`. Only `SUCCEEDED` with full verification creates a `Payment`. Pending and failed attempts leave the invoice unpaid.
6. **Payment ≠ enrolment.** A verified payment updates the invoice balance. Enrolment is confirmed by the admissions workflow once the application is accepted, the terms are accepted and the required amount is verified. Payment alone never admits a student.
7. **Secrets stay on the server.** `PAYSTACK_SECRET_KEY` lives only in server environment variables, never with a `NEXT_PUBLIC_` prefix and never in the client bundle. Test keys (`sk_test_…`) are used in development; live keys only in production.
8. **Manual payments** (cash, bank transfer) are *recorded* by one authorised person (`payments.record`) with evidence and *approved* by another (`payments.verify`), with both actions in the audit log.
9. **Refunds** are *requested* (`refunds.request`), *approved* by a different person (`refunds.approve`), then *processed* through the provider. The provider's refund webhook confirms the outcome.

## Provider adapter

```ts
// src/server/payments/provider.ts
interface PaymentProvider {
  id: "paystack" | "flutterwave";
  initialise(input: { reference: string; amountKobo: number; email: string; callbackUrl: string; metadata: Record<string, string> }): Promise<{ authorizationUrl: string; providerReference: string }>;
  verify(reference: string): Promise<VerifiedTransaction>;            // server-to-server
  parseWebhook(rawBody: string, headers: Headers): ProviderEvent | null; // returns null if the signature is invalid
  refund(input: { providerTransactionId: string; amountKobo?: number; reason: string }): Promise<RefundResult>;
}

type VerifiedTransaction = {
  status: "success" | "pending" | "failed" | "abandoned" | "reversed";
  reference: string; amountKobo: number; currency: string;
  paidAt: Date | null; feesKobo: number | null; channel: string | null;
  providerTransactionId: string; raw: unknown; // raw stored for reconciliation, never shown to users
};
```

Paystack is implemented first. Flutterwave can be added as a second adapter without changing invoice, receipt or enrolment code.

## Flow

```
Student "Pay ₦45,000"  ─▶  server: create PaymentAttempt (our reference, INITIATED)
                        ─▶  provider.initialise() ─▶ redirect to Paystack checkout
Paystack ─▶ callback page (shows "checking…", polls our server; never marks paid)
Paystack ─▶ POST /api/payments/paystack/webhook
              1. verify signature on raw body          (reject 401 if invalid)
              2. INSERT ProviderEvent (unique id)       (duplicate → 200, stop)
              3. provider.verify(reference)             (do not trust webhook body alone)
              4. check amount, currency, reference ↔ invoice ↔ student, merchant
              5. in one transaction: Payment + invoice balance + Receipt number + audit
              6. respond 200 quickly; notifications are queued
Reconciliation job (daily): re-verify PENDING attempts older than N minutes.
```

## Finance reporting

Invoiced amount, collected cash, provider fees, refunds and outstanding balances are tracked separately and exported to CSV for reconciliation. This dashboard does not replace statutory bookkeeping, audited accounts or tax advice.

## Needed from management

- Paystack business account (registered to NSD Business Academy Limited), test keys, then live keys after compliance approval
- Settlement bank account confirmation
- Which channels to offer (card, bank transfer, USSD, etc.)
- Instalment rules, overdue reminder timings, late-payment policy
- Refund policy amounts and deadlines (see the draft enrolment and refund policy)
