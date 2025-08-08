### PRD: Next.js + BeerCSS (Material 3 Expressive) + Convex “Collink” App

#### 1) Summary
- **Goal**: Build a production-grade Next.js app using BeerCSS for Material 3 expressive UI, Convex for realtime database, and pnpm for package management.
- **Scope**: Auth, profile, link collections (CRUD), realtime updates, responsive navigation, dark/light theming, componentized UI wrappers around BeerCSS.
- **References**: BeerCSS repo and guidelines [beercss on GitHub](https://github.com/beercss/beercss).

#### 2) Objectives
- **Use BeerCSS as the primary design system** following its “elements + helpers” semantic approach and navigation placement rules.
- **Adopt Material 3 expressive** look and feel via BeerCSS components/utilities.
- **Leverage Convex** for schema, queries, mutations, actions, and realtime subscriptions.
- **Follow Next.js best practices**: App Router, Server/Client Components split, colocation, static/dynamic rendering, Route Handlers as needed.
- **Implement component-based architecture** with a small UI kit wrapping BeerCSS primitives.
- **Great DX**: strict TypeScript, ESLint/Prettier, sensible project structure, minimal footguns.

#### 3) Non-goals
- Heavy custom animation system (beyond BeerCSS/MD3 defaults).
- Complex RBAC beyond owner + shared roles (V1).
- Multi-tenant/org features (V1).
- Full offline mode (beyond Convex client caching).

#### 4) Target users and use cases
- **Target users**: Individuals/teams who want to curate and share collections of links/resources quickly.
- **Use cases**
  - Create, tag, and organize links.
  - Search/filter links, see realtime updates across devices.
  - Share link collections as public read-only or with collaborators (V1: simple share).
  - Manage profile and appearance (dark/light theme).

#### 5) Key features and requirements
- **Authentication (Clerk)**
  - Use Clerk for authentication and user management with prebuilt components (`<SignIn/>`, `<SignUp/>`, `<UserButton/>`).
  - Support unauthenticated users: public pages readable without login; creating/editing links/collections requires auth.
  - Minimal UI controls: Login and Logout via Clerk components or `useAuth()` hooks.
  - Convex server functions enforce identity using `ctx.auth.getUserIdentity()` with Clerk-issued JWTs (via Clerk Convex integration/JWT Templates).
- **Links CRUD**
  - Create, read, update, delete with title, URL, description, tags, visibility.
  - Realtime updates via Convex `useQuery`.
- **Collections & sharing**
  - Group links into collections; share via public URL (read-only), private by default. Simple collaborator role optional (V2).
- **Search & filter**
  - Client-side filter by text and tags; server-side query for scalable search (V2).
- **Notifications (Resend)**
  - Email notifications for link/collection changes (create/update/delete) via Resend.
  - Per-user preferences: instant or digest (daily/weekly), enable/disable by collection/link.
  - Subscription model: users can follow a collection or individual link to receive updates.
  - Outbound emails sent from server-side using Convex actions calling Resend API.
- **Responsive navigation**
  - Left nav on L/XL, compact left nav on M, bottom nav on S; follow BeerCSS guidance for nav placement.
- **Theming**
  - Dark/light toggles using `body.dark|light`.
  - Optional `material-dynamic-colors` only if runtime theme palette switching is desired [beercss on GitHub](https://github.com/beercss/beercss).
- **Accessibility**
  - MD3 color contrast, focus-visible styles, keyboard navigation, semantic HTML hierarchy consistent with BeerCSS DOs.

#### 6) Information architecture and routes
- `/` Dashboard (recent links, quick actions)
- `/links` All links (search/filter)
- `/links/[id]` Link detail
- `/collections` Collections list
- `/collections/[id]` Collection detail with contained links
- `/new` Create link (inline or dedicated page)
- `/settings` Profile, theme, preferences
- `/auth/callback` Auth redirect if needed (provider-specific)
- `/share/[slug]` Public read-only view of a collection
- Clerk integrates via provider in root layout (no NextAuth route needed). Optional `middleware.ts` for route protection if desired.

#### 7) Data model (Convex)
- `users`
  - `id` (Convex identity), `displayName`, `email`, `avatarUrl`, `createdAt`, `notificationPrefs` ({ `emailEnabled`: boolean, `frequency`: "instant" | "daily" | "weekly" })
- `links`
  - `id`, `title`, `url`, `description`, `tags` (string[]), `visibility` ("private" | "public"), `ownerId`, `collectionId?`, `createdAt`, `updatedAt`
- `collections`
  - `id`, `name`, `description`, `ownerId`, `isPublic` (bool), `slug` (unique for public read), `createdAt`, `updatedAt`
- `shares` (V2 if collaborator roles needed)
  - `id`, `collectionId`, `userId`, `role` ("viewer" | "editor")
- `subscriptions`
  - `id`, `userId`, `targetType` ("collection" | "link"), `targetId`, `createdAt`
- Indexes: by `ownerId`, `collectionId`, `slug`, `createdAt`

#### 8) Permissions and security
- Server-side authorization in Convex functions:
  - Only `ownerId` can mutate owned links/collections.
  - Public reads allowed for `isPublic` or `visibility === "public"` entities.
  - Guard every mutation/action with identity checks.
- Validate `url`, sanitize `title/description`; consider HTML escaping.
- Email notifications:
  - Only send updates to subscribers with access (owner or public visibility or shared access).
  - Rate limit digests and de-duplicate frequent edits.
  - Store `RESEND_API_KEY` securely in Convex environment variables.

#### 9) UI/UX standards with BeerCSS
- **BeerCSS structure**
  - Follow “1 setting to 1 document”: `body.dark|light`.
  - “1 element to N helpers”: avoid `.element.element`, prefer `.element.helper`.
  - Place nav elements before others; use `.left|right|top|bottom` placements as documented.
  - Write selectors as `.element.helper` or `.element > .helper`; avoid `.element .helper` broad selectors.
  - Reference: [beercss on GitHub](https://github.com/beercss/beercss)
- **MD3 expressive**
  - Use expressive type scale, spacing, and motion durations from BeerCSS defaults.
- **Componentization**
  - Wrap BeerCSS semantics in React components to ensure consistency and reuse.

#### 10) Component inventory (initial)
- `components/ui`
  - `Button`, `Icon`, `Input`, `Textarea`, `Select`, `Card`, `Chip`, `Dialog`, `Sheet`, `Tabs`, `Tooltip`, `Snackbar`, `Avatar`, `Badge`
  - `TopAppBar`, `SideNav`, `BottomNav`, `SearchField`, `TagPicker`
- `components/layout`
  - `AppShell` (responsive nav slots), `PageHeader`, `Section`, `Container`
- `components/link`
  - `LinkCard`, `LinkForm`, `LinkList`, `LinkDetail`
- `components/collection`
  - `CollectionCard`, `CollectionForm`, `CollectionList`, `CollectionDetail`
- `components/theme`
  - `ThemeProvider` (manages `body` class), `ThemeToggle` (and optional dynamic colors integration)

#### 11) Architecture and implementation details
- **Framework**
  - Next.js App Router, TypeScript strict, edge-friendly where appropriate but default Node runtime for Convex compatibility.
- **Data**
  - Convex schema and functions in `/convex`; types generated via codegen.
  - Client access via `ConvexProvider` and hooks `useQuery`, `useMutation`, `useAction`.
- **Authentication**
  - ClerkProvider at the app root; use `ConvexProviderWithClerk` to attach Clerk auth to Convex client requests.
  - Public routes readable by unauthenticated users; protect mutating flows via Convex auth checks and optional Clerk middleware for app sections if needed.
  - Minimal UI: Clerk prebuilt components for sign-in/out and user menu.
- **Rendering strategy**
  - Pages as Server Components by default; isolate interactive parts as Client Components.
  - Use `revalidate` wisely; rely on Convex realtime for dynamic lists.
- **State management**
  - Minimal local state; server state via Convex hooks; form state via local component state or lightweight lib.
- **Styling**
  - Global BeerCSS via npm import or local CDN; prefer pinned versions for stability.
  - Minimal custom CSS; when needed, follow BeerCSS selector rules to avoid specificity traps.
- **Accessibility**
  - Semantic HTML structure; labels and roles on form controls/dialogs; keyboard traps avoided.
- **SEO**
  - Metadata per route; Open Graph tags for public collection pages; `canonical` where needed.
- **Notifications pipeline**
  - Mutations that create/update/delete links or collections enqueue a notification job in Convex (e.g., write to a `notification_events` table or trigger an action).
  - A Convex action fetches subscribers and sends emails via Resend HTTP API.
  - For digests, schedule periodic Convex cron to aggregate changes and send batched emails.
  - Email templates implemented as React email components rendered server-side.
  - Environment variables: `RESEND_API_KEY`, `NEXT_PUBLIC_CONVEX_URL` (client), `CONVEX_DEPLOYMENT` (if needed), `NEXT_PUBLIC_APP_URL` for deep links.
  - Auth env vars (Clerk): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, optional `CLERK_JWT_TEMPLATE_NAME` for Convex.

#### 12) Performance and quality
- **Performance targets**
  - LCP < 2.5s on 4G mid-tier, CLS < 0.1, TBT < 200ms.
- **Practices**
  - Code splitting via route segments; `next/image` for thumbnails; avoid blocking scripts.
- **Tooling**
  - pnpm, ESLint (Next.js config), Prettier, TypeScript strict, Husky + lint-staged (pre-commit).
- **Testing**
  - Vitest + React Testing Library for components; Convex function tests (where practical) with Convex test utilities.

#### 13) Telemetry and logging (optional V1)
- Basic pageview analytics; error boundary + logging to console/server.

#### 14) Risks and mitigations
- Convex auth provider choice: keep pluggable; abstract sign-in UI.
- Theming conflict: keep dynamic colors opt-in and isolated.
- BeerCSS class API drift: pin versions; wrap in components to minimize fallout.

#### 15) Milestones
- **M1: Project scaffold**
  - Next.js (App Router) with pnpm, TypeScript, ESLint/Prettier, BeerCSS wired, base layout and navs.
- **M2: Convex integration**
  - Schema, queries/mutations, provider wiring, generated types.
- **M3: Links CRUD**
  - Forms, lists, detail pages; realtime updates.
- **M4: Collections + sharing**
  - Public read-only pages via `slug`.
- **M5: Theming & polish**
  - Dark/light toggle; optional dynamic colors; a11y/SEO/perf pass.
- **M6: Tests & docs**
  - Critical component tests; README and deployment notes.

#### 16) Acceptance criteria
- BeerCSS-driven UI with responsive left/bottom navs as per docs.
- Convex-backed links and collections with realtime list updates.
- Authenticated user can manage their links and collections; public pages accessible by slug.
- Dark/light theme persists.
- No ESLint/TS errors; meets performance targets on sample data.
- Resend email notifications are sent to subscribed users on link/collection changes (instant and digest modes), respecting visibility and preferences.
- Simple login/logout works via Clerk; unauthenticated users can browse public pages but cannot create/edit.

#### References
- BeerCSS setup, scoped/custom-element variants, and guidance on dynamic colors: [beercss on GitHub](https://github.com/beercss/beercss)
- Convex + Next.js Quickstart (App Router): [docs.convex.dev/quickstart/nextjs](https://docs.convex.dev/quickstart/nextjs?utm_source=openai)
- Convex Next.js Integration (React client): [docs.convex.dev/client/react/nextjs](https://docs.convex.dev/client/react/nextjs/?utm_source=openai)
- Convex Server Rendering with Next.js: [docs.convex.dev/client/react/nextjs/server-rendering](https://docs.convex.dev/client/react/nextjs/server-rendering?utm_source=openai)
- Convex Pages Router Quickstart (if needed): [docs.convex.dev/client/react/nextjs-pages-router/quickstart](https://docs.convex.dev/client/react/nextjs-pages-router/quickstart?utm_source=openai)
- Demo: Convex Next.js App Router: [github.com/get-convex/convex-nextjs-app-router-demo](https://github.com/get-convex/convex-nextjs-app-router-demo?utm_source=openai)
- Resend docs: [resend.com/docs](https://resend.com/docs)
 - Clerk Next.js docs: [clerk.com/docs/nextjs/overview](https://clerk.com/docs/nextjs/overview?utm_source=openai)
 - Clerk Quickstart for Next.js: [clerk.com/docs/quickstarts/nextjs](https://clerk.com/docs/quickstarts/nextjs?utm_source=openai)
 - Clerk + Convex integration: [clerk.com/docs/integrations/databases/convex](https://clerk.com/docs/integrations/databases/convex?utm_source=openai)

#### Success metrics
- <3s cold start to interactive on dashboard (mid-tier device); 0 runtime errors in console during core flows; >90 Lighthouse PWA/SEO/Best Practices (where applicable).


