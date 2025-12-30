# Celtis POS UI (Frontend-only)

Small POS UI demo focused on **flow + calm UI** (no backend).

## Run locally

```bash
npm install
npm run dev
```

## 3 screens

- **Sell**: product search → add to cart → adjust qty → totals → pay (cash/card)
- **Parked**: park a draft sale and resume it later
- **History**: paid receipts list + receipt details

## Product-thinking bits

- **Sale states** (simple): Draft (active / parked) → Paid (history)
- **Resilience**: refresh-safe via **localStorage** (active sale + drafts + history)
- **Ergonomics**: `/` focuses search, Enter adds first match, Ctrl/Cmd+Enter quick-pay (cash)

## Intentional simplifications

- Mock catalog data (no inventory, no customers, no refunds/voids).
- Simple demo tax (fixed 8%).
