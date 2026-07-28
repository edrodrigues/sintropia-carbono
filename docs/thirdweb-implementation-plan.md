# Thirdweb Stack Implementation Plan — Sintropia

## Status: Approved ✅

Answers to clarifying questions incorporated below.

---

## Architecture

```
User -> Google OAuth -> Thirdweb (wallet created)
                            |
                 /api/auth/thirdweb-callback
                            |
            Does Google email exist in Supabase auth.users?
                |                           |
               YES                         NO
                |                           |
      Link wallet to existing      Create new Supabase user
      Supabase user                with synthetic email
                |                           |
          Return Supabase session    Return Supabase session
```

- **Supabase stays** as the app's session/database layer (middleware, RLS, profiles all unchanged)
- **Thirdweb is the auth mechanism** (wallet creation, social login, gasless tx sponsorship)
- **Synthetic email format**: `wallet_<short_address>@sintropia.space`
- **Existing users**: Google email matched automatically, wallet linked to existing profile
- **Account abstraction**: EIP-4337 with `sponsorGas: true` for gasless user transactions

---

## Token Design: SINT

| Feature | Purpose |
|---------|---------|
| Mintable | Admin mints to reward community actions (posts, comments, referrals) |
| Burnable | Optional deflation; admin burns from reward pool |
| Ownable / Role-based | Admin controls minting, transfer roles |
| Snapshot / Voting | Future governance — token holders vote on decisions |
| Permit (gasless) | Users approve via signature without spending gas |
| No sale config | Pure utility token, no built-in buy/sell pool |

**Supply strategy**: Start with `maxSupply = 0` (unlimited). Admin mints on demand as community grows, rather than pre-allocating a fixed amount upfront.

**Contract**: thirdweb Token (standard) via `deployERC20Contract()` — no custom bytecode needed.

---

## Phase 1 — SDK Setup

| # | Step | Details |
|---|------|---------|
| 1.1 | Install package | `npm install thirdweb` |
| 1.2 | Browser client | `src/lib/thirdweb/client.ts` — `createThirdwebClient` with `clientId` from `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` |
| 1.3 | Server client | `src/lib/thirdweb/server.ts` — `createThirdwebClient` with `secretKey` from `THIRDWEB_SECRET_KEY` |
| 1.4 | Chain config | `src/lib/thirdweb/chain.ts` — Celo Sepolia (chain ID: `11142220`, RPC: `https://11142220.rpc.thirdweb.com`) |
| 1.5 | Env vars | Ensure `.env.local` has: `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`, `THIRDWEB_SECRET_KEY`, and add `SUPABASE_SERVICE_ROLE_KEY` (needed for bridge API to create Supabase users via admin API) |

---

## Phase 2 — Thirdweb Provider (Critical)

| # | Step | Details |
|---|------|---------|
| 2.1 | Provider wrapper | `src/components/ThirdwebProviderWrapper.tsx` — Client component wrapping children with `<ThirdwebProvider client={client}>` from `thirdweb/react`. This is **required** for all thirdweb hooks to work. |
| 2.2 | Update root layout | `src/app/[locale]/layout.tsx` — Wrap `<NextIntlClientProvider>` children with `<ThirdwebProviderWrapper>`. Without this, the app will crash on any page using thirdweb hooks. |

---

## Phase 3 — Social Login Component

| # | Step | Details |
|---|------|---------|
| 3.1 | Login button | `src/components/auth/ThirdwebLoginButton.tsx` — Client component using `inAppWallet()` with `strategy: "google"`, EIP-4337 enabled with `sponsorGas: true`. On success: calls `/api/auth/thirdweb-callback` with `{ walletAddress, authToken }` |
| 3.2 | Update login page | `src/app/[locale]/(auth)/login/page.tsx` — Add `ThirdwebLoginButton` below existing form with "or" divider |
| 3.3 | Auth callback API | `src/app/api/auth/thirdweb-callback/route.ts` — (a) verify Thirdweb JWT via `/v1/wallets/me`, (b) extract Google email from linked profiles, (c) check if email exists in Supabase `auth.users`, (d) create user or link, (e) return Supabase session + redirect |

---

## Phase 4 — Automatic Wallet ↔ Profile Linking

| # | Step | Details |
|---|------|---------|
| 4.1 | Profile linking | In callback: if Google email matches existing Supabase user, update `profiles.wallet_address` on that user's row |
| 4.2 | New user creation | Create Supabase auth user with synthetic email `wallet_<short_address>@sintropia.space`, create `profiles` row, set `wallet_address` and `auth_method = 'thirdweb'` |
| 4.3 | Migration | `supabase/migrations/20260611000000_add_thirdweb_columns.sql` — `ALTER TABLE profiles ADD COLUMN wallet_address text UNIQUE; ALTER TABLE profiles ADD COLUMN auth_method text DEFAULT 'supabase';` |

---

## Phase 5 — Account Abstraction (Gasless)

| # | Step | Details |
|---|------|---------|
| 5.1 | Enable AA | Configured in `ThirdwebLoginButton.tsx` via `executionMode: { mode: "EIP4337", smartAccount: { chain: celoSepolia, sponsorGas: true } }` |
| 5.2 | Zero config | Thirdweb handles paymaster/sponsorship on Celo Sepolia automatically — no additional setup |

---

## Phase 6 — Token Deployment (SINT)

| # | Step | Details |
|---|------|---------|
| 6.1 | Deploy logic | `src/lib/thirdweb/deploy-token.ts` — Uses `deployERC20Contract` from `thirdweb/deploys`. Name: "SINT", Symbol: "SINT", no fixed max supply (mint-on-demand). Uses `salt: "sintropia-carbon-v1"` for deterministic address. Network: Celo Sepolia |
| 6.2 | Deploy API | `src/app/api/thirdweb/deploy-token/route.ts` — Admin-protected POST endpoint. Calls deploy function, stores result in `deployed_contracts` table |
| 6.3 | Contracts table migration | `supabase/migrations/20260611000001_deployed_contracts.sql` — `CREATE TABLE deployed_contracts (id serial primary key, chain_id text, contract_address text, name text, symbol text, deployed_by uuid references profiles(id), deployed_at timestamptz default now());` |
| 6.4 | Admin UI | `src/app/[locale]/(dashboard)/admin/tokens/page.tsx` — Form with name/symbol/supply fields, "Deploy to Celo Sepolia" button, deployment history list |
| 6.5 | Deploy script (alt.) | `scripts/deploy-token.ts` — Standalone script using `npx tsx scripts/deploy-token.ts`. Useful for CI/CD or manual deploy without the admin UI |
| 6.6 | Fund deployer | Get CELO-S from faucet at `https://thirdweb.com/celo-sepolia-testnet` for the deployer wallet |
| 6.7 | Verify | Check contract on Celo Sepolia explorer (`https://celo-sepolia.blockscout.com`), verify deployer wallet has CELO-S, set up token metadata on thirdweb dashboard |

---

## Phase 7 — UI Wallet Display (Optional)

| # | Step | Details |
|---|------|---------|
| 7.1 | Profile wallet section | Add "My Wallet" section to profile page showing connected wallet address + SINT balance |
| 7.2 | Hooks | Use `useActiveWallet()` and `useActiveAccount()` from `thirdweb/react` to access connected wallet state |
| 7.3 | Balance | Use `useReadContract` to call `balanceOf()` on the SINT contract with the user's wallet address |

---

## Files to Create (11)

| File | Purpose |
|------|---------|
| `src/lib/thirdweb/client.ts` | Browser-side Thirdweb client |
| `src/lib/thirdweb/server.ts` | Server-side Thirdweb client |
| `src/lib/thirdweb/chain.ts` | Celo Sepolia chain definition |
| `src/lib/thirdweb/deploy-token.ts` | Token deployment logic |
| `src/lib/thirdweb/sync-profile.ts` | Server action for manual wallet linking (future use) |
| `src/components/ThirdwebProviderWrapper.tsx` | Provider wrapper wrapping `<ThirdwebProvider>` |
| `src/components/auth/ThirdwebLoginButton.tsx` | Google social login button with AA |
| `src/app/api/auth/thirdweb-callback/route.ts` | Bridges Thirdweb auth to Supabase session |
| `src/app/api/thirdweb/deploy-token/route.ts` | Admin API to deploy SINT |
| `src/app/[locale]/(dashboard)/admin/tokens/page.tsx` | Admin deploy UI |
| `scripts/deploy-token.ts` | Standalone deploy script (alternative to API) |

## Files to Modify (4)

| File | Change |
|------|--------|
| `.env.local` | Rename `Thirdweb_Client_ID` to `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`, add `SUPABASE_SERVICE_ROLE_KEY` |
| `package.json` | Add `"thirdweb": "^x.y.z"` to dependencies |
| `src/app/[locale]/layout.tsx` | Wrap children with `<ThirdwebProviderWrapper>` |
| `src/app/[locale]/(auth)/login/page.tsx` | Import and render `ThirdwebLoginButton` |

## Database Migrations (2)

| Migration | SQL |
|-----------|------|
| `20260611000000_add_thirdweb_columns.sql` | `ALTER TABLE profiles ADD COLUMN wallet_address text UNIQUE; ALTER TABLE profiles ADD COLUMN auth_method text DEFAULT 'supabase';` |
| `20260611000001_deployed_contracts.sql` | `CREATE TABLE deployed_contracts (id serial primary key, chain_id text not null, contract_address text not null, name text not null, symbol text not null, deployed_by uuid references profiles(id), deployed_at timestamptz default now());` |

---

## MCP Supabase Configuration (for development)

Configure `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp?project_ref=tashftatbucseafjlfdw",
      "enabled": true
    }
  }
}
```

Then authenticate:

```bash
opencode mcp auth supabase
npx skills add supabase/agent-skills
```

---

## Celo Sepolia Network Details

| Property | Value |
|----------|-------|
| Chain name | Celo Sepolia Testnet |
| Chain ID | `11142220` |
| Native token | CELO-S |
| RPC | `https://11142220.rpc.thirdweb.com` |
| Explorer | `https://celo-sepolia.blockscout.com` |
| Faucet | `https://thirdweb.com/celo-sepolia-testnet` |
