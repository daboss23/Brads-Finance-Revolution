# XPLAN Integration

How Brad's existing XPLAN book connects to this platform, what has to happen
before it can, and exactly which file to edit when it does.

---

## Status: seam built, access pending

The code is in place and does nothing until credentials exist. With no XPLAN
environment variables set, `listXplanClients()` returns `[]` and the platform
behaves exactly as it does today. Nothing is blocked on Iress.

---

## 1. The commercial gate — this is the real blocker

API access is **not** a self-service switch. Iress requires an **API
Agreement** between Iress and the **XPLAN site owner**, requested through the
site owner's Iress account executive. Once signed, Iress configures the API
keys on the site.

**For BMK this almost certainly means Charter, not Brad.** Brad is an
authorised representative of Charter Financial Planning Limited (AFSL 234665),
so the XPLAN site is a licensee asset. The first conversation is with
Charter's XPLAN administrator or Brad's Charter account executive, not with
Iress. Going straight to Iress will most likely be routed back to Charter.

Worth raising in the same conversation, because it gates the whole platform
rather than just this integration:

- Does Charter approve this platform being used with real client data?
- Is the generated SOA acceptable against Charter's own template and wording?
- What are the professional indemnity and cyber implications?

### Integration types

Iress offers two shapes under the **Iress Open** banner:

| Type | How it connects | Notes |
|---|---|---|
| **Standard** | App key against a backend-for-frontend layer, OAuth 2.0 supported | Simplified calls, faster to market |
| **Custom** | App key directly against the XPLAN API layer | Capabilities assigned individually by Iress |

Iress publishes working sample code at
[github.com/iress/iress-xplan-api-examples](https://github.com/iress/iress-xplan-api-examples).
It covers the two API surfaces — **RAPI** (resourceful) and **EDAI** — and
shows authentication with the XPLAN user's credentials plus a time-based
one-time code. **Two-factor must use the Software Token method**, not SMS.

---

## 2. Environment variables

Set these in Vercel once access is granted. All of them are optional; the
integration switches on only when the first three are present.

| Variable | Required | Purpose |
|---|---|---|
| `XPLAN_BASE_URL` | yes | Site URL, e.g. `https://charter.xplan.iress.com.au` |
| `XPLAN_USERNAME` | yes | The XPLAN user the platform authenticates as |
| `XPLAN_PASSWORD` | yes | That user's password |
| `XPLAN_TOTP_SECRET` | if 2FA on | Base32 secret for the software token |
| `XPLAN_APP_KEY` | if issued | App key from Iress for Standard/Custom integrations |

Use a **dedicated XPLAN user** for the platform rather than Brad's own login,
so its access can be scoped and revoked independently and so the audit trail
in XPLAN distinguishes automated reads from Brad's own activity.

---

## 3. What to change when access lands

Two files, in this order.

### `lib/xplan/client.ts` — the endpoints

The `ENDPOINTS` block holds the API paths. They reflect RAPI's documented
shape, but XPLAN sites are heavily configured, so confirm each against the
documentation Iress provides with the agreement.

If the site is provisioned for the **OAuth 2.0 Standard Integration** rather
than credential auth, `authHeaders()` is the single function to replace —
nothing else in the codebase touches XPLAN authentication.

### `lib/xplan/mapping.ts` — the field names

This is where most of the real work is. Every XPLAN field name in this file is
a documented default, and per-site customisation means several will differ on
Brad's site. `pick()` accepts multiple candidate names per field, so adding a
site-specific name is a one-line change and old names keep working.

Verify against a **real entity** before importing any live client. The
mapping is deliberately forgiving — an unknown field maps to an empty string
rather than throwing — which means a wrong field name shows up as silently
missing data rather than an error. Check the numbers, not just that it ran.

---

## 4. Design decisions worth keeping

**Read-only.** The platform pulls from XPLAN and never writes back. XPLAN
remains the practice's system of record, so a mapping mistake can't corrupt
it. Write-back should be a separate, later, deliberate decision.

**Fails soft.** If XPLAN is down, unreachable, or rejects the credentials,
every call returns empty and logs a warning. The platform carries on with the
records it already has. An Iress outage must never take Brad's CRM down.

**Imported records land as in-progress.** Whatever status XPLAN carries, an
imported client enters this platform's own pipeline at the start and advances
only through its compliance gate. XPLAN's status doesn't get to skip checks.

**Completion is recomputed, not trusted.** The percentage comes from counting
fields that actually arrived, so the compliance gate sees an honest picture of
what's missing rather than a number XPLAN asserted.

**Ids are prefixed.** Imported clients get `xplan-<entityId>`, so they can
never collide with locally created records and their origin is obvious in
URLs, logs and the audit trail.

---

## 5. On MCP

There is no XPLAN MCP server, official or community — the connector registry
has nothing in this space.

MCP is also probably not what this integration wants. MCP gives an AI
assistant tools to call conversationally; syncing a client book is a
background job better served by the plain adapter above. An MCP server would
be a reasonable *second* project — so Brad could ask questions about his
book in natural language — and it would wrap this same adapter rather than
replace it.
