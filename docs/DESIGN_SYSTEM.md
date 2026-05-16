# Maple Design System

> One product, one design language. If you find yourself reaching for a hex code, a custom px value, or an arbitrary transition timing, **stop and reach for a token instead**. Every new screen built from now on uses this system, end-to-end.
>
> Audit reference: the audit flagged "three competing design languages" — editorial beige, glass dashboards, generic blue. This document is how we end that.

---

## Visual identity (v1)

Maple is the **trust machine for African schools**. The design should feel:

- **Clear** — a teacher in a hurry can complete a task without reading instructions.
- **Hopeful** — color and motion serve to encourage, not to perform.
- **Intelligent** — visual hierarchy reveals what matters; the rest gets out of the way.
- **Supportive** — empty states, error messages, and microcopy all sound like a human who's on the user's side.

What we explicitly do **not** do:
- Glassmorphism, neumorphism, or any other 2020s decorative idiom that ages in 18 months.
- Gradients as decoration. (Gradients used to indicate progress/state are fine.)
- Hero shadows, drop shadows on text, neon glow effects, or any other "look at me" visual flourish.
- More than one accent color per screen.

---

## Color

The color system is fully tokenized in `tailwind.config.js` and `src/index.css`. Three layers:

### 1. Semantic shadcn tokens (use these by default)
| Token | Use for |
|---|---|
| `bg-background`, `text-foreground` | Page surfaces and body text |
| `bg-card`, `text-card-foreground` | Card / surface backgrounds |
| `bg-primary`, `text-primary-foreground` | Primary action buttons, focused links |
| `bg-secondary`, `text-secondary-foreground` | Secondary backgrounds, soft tags |
| `bg-muted`, `text-muted-foreground` | De-emphasized fills and helper text |
| `bg-accent`, `text-accent-foreground` | Accent highlights (sparingly) |
| `bg-destructive`, `text-destructive-foreground` | Destructive actions only |
| `border`, `ring` | Borders and focus rings |

These are HSL CSS variables, so they automatically swap under `.dark` mode. Prefer them over `bg-blue-600`, `bg-slate-100`, etc.

### 2. Functional Tailwind palette (when semantic isn't right)
Status colors map to the standard Tailwind hues:
- **Success** — `emerald-*` (e.g. `bg-emerald-500`, `text-emerald-700`)
- **Warning** — `amber-*`
- **Danger** — `red-*`
- **Info** — `sky-*`

### 3. Brand colors
- **Blue scale** — the Maple brand blue, `blue-600 = #0f2a45`. Use sparingly; the brand color is a signature, not a backdrop.
- **Paper scale** — a custom warm-neutral palette (`paper-50` → `paper-900`) reserved for **reading mode** surfaces only: the Academic Library, Lesson Content, marketing/landing pages. **Do not use paper-* in dashboards or task-oriented surfaces** — those stay neutral.

### What's banned
- ❌ Arbitrary hex in className strings (`bg-[#abc123]`). Enforced as ESLint error.
- ❌ Inline `style={{ color: '#...' }}`. Use Tailwind tokens.
- ❌ Mixing the editorial paper theme with the neutral dashboard theme on the same screen.

---

## Typography

Six semantic sizes. Pair the class with weight + color from Tailwind.

| Class | Size | Weight | Use for |
|---|---|---|---|
| `text-display` | 48px / 1.05 | 700 | Hero only — landing page, empty-state illustrations |
| `text-h1` | 32px / 1.2 | 600 | Page title |
| `text-h2` | 24px / 1.2 | 600 | Major section heading |
| `text-h3` | 20px / 1.3 | 600 | Sub-section, card title |
| `text-body-lg` | 18px / 1.5 | 400 | Reading-mode body (library, lessons) |
| `text-body-default` | 16px / 1.5 | 400 | Default body, form labels |
| `text-body-sm` | 14px / 1.5 | 400 | Secondary, dense tables |
| `text-caption` | 12px / 1.3 | 400 | Timestamps, meta, helper text |
| `text-micro` | 11px / 1.3 | 600 uppercase | Badges only |

**Font stack:** Inter, fallback system. Avoid loading multiple typefaces; one type family is part of the trust signal.

**Don't:**
- Don't compose a size from `text-[17px]` or any arbitrary value.
- Don't put `font-bold` on body text — use `font-semibold` for emphasis, `font-bold` for display only.
- Don't use uppercase on anything except `text-micro` badges.

---

## Spacing

Use Tailwind's default spacing scale. Common patterns:

| Pattern | Class |
|---|---|
| Tight inside a card (icon + label) | `gap-2` (8px) |
| Stacked text content | `space-y-3` (12px) |
| Form field stack | `space-y-4` (16px) |
| Card vertical padding | `p-6` (24px) — `p-4` on mobile |
| Section gap | `space-y-8` (32px) |
| Page-level padding (mobile) | `px-4 py-6` |
| Page-level padding (desktop) | `px-8 py-10` |

**Don't** mix arbitrary px values (`p-[17px]`). If a spacing need doesn't fit the scale, the design needs to change, not the value.

---

## Motion

Three durations, three easings. Never reach for a different one.

| Token | CSS var | Duration | Use for |
|---|---|---|---|
| Fast | `--motion-fast` | 150ms | Button press, hover, tooltip |
| Base | `--motion-base` | 250ms | Page transition, modal in/out, toast |
| Slow | `--motion-slow` | 400ms | Drawer, page reveal, emphasized animations |

Easings:
- `var(--ease-standard)` — most UI (cubic-bezier(0.2, 0, 0, 1))
- `var(--ease-out)` — entrances
- `var(--ease-in)` — exits
- `var(--ease-spring)` — celebratory, only on success states

Utility classes: `.motion-fast`, `.motion-base`, `.motion-slow`. They include `transition-duration` + `transition-timing-function` so you just add `transition-colors` (or similar) alongside.

**Always respect `prefers-reduced-motion`** — already wired in `index.css` to zero out durations when the OS preference is set.

---

## Focus

Focus rings are visible on **keyboard navigation only** (`:focus-visible`). Mouse clicks do not light them up.

```jsx
<button className="focus-ring rounded-lg ...">Submit</button>
```

The `.focus-ring` utility inherits the host's `border-radius`. Width is `2px`, offset `2px`, color is the primary brand.

**Don't:**
- Don't set `outline-none` without re-establishing focus.
- Don't replace the ring with a background-color change — accessibility regression.

---

## Tap targets

Mobile minimum hit area is **44 × 44 px** (WCAG 2.5.5 AA, Apple HIG). Apply `.tap-target` on:

- Icon-only buttons (close X, menu, back arrow)
- Small toggles in dense lists
- Anywhere the visible element is < 44px

Visual size can remain small (icon is 16px); the tap region expands to 44px via flex centering.

---

## Elevation

Four levels. Use the utility class.

| Class | Use for |
|---|---|
| `elevation-1` | Subtle card lift, secondary cards |
| `elevation-2` | Primary cards, hoverable surfaces |
| `elevation-3` | Modals, dropdowns, popovers |
| `elevation-overlay` | Full-screen overlays, dialogs |

**Don't** use Tailwind's `shadow-sm`, `shadow-md`, `shadow-lg` arbitrarily — they produce inconsistent depth across the app. Stick to the four levels.

---

## States — designed, not afterthought

Every screen must design five states:

1. **Default** — content loaded, normal interaction available.
2. **Loading** — skeleton matching the eventual content layout. Not a spinner. Skeleton + animated shimmer.
3. **Empty** — has explanatory copy + a clear next action. Not a blank screen.
4. **Error** — names what went wrong + offers a recovery action (retry, contact, refresh).
5. **Success** — confirmation + what happens next. Optimistic UI when reversible.

Mobile screens additionally design:

6. **Offline** — the screen reads from local cache, shows a small "offline — will sync when reconnected" indicator, and queues writes.

A screen without these states is incomplete. Code review rejects screens that handle only the happy path.

---

## Components

Built on **shadcn/ui** (Radix primitives + Tailwind). Available in `src/components/ui/`:

Core: `button`, `input`, `label`, `card`, `badge`, `dialog`, `dropdown-menu`, `toast`, `sheet`, `tabs`, `tooltip`, `select`, `popover`, `command`, `form`, `checkbox`, `switch`, `radio-group`, `accordion`, `alert`, `alert-dialog`.

Layout: `aspect-ratio`, `separator`, `scroll-area`, `resizable-panels`.

When to add a new component:
- The pattern appears **3+ times** in the codebase.
- The pattern is **not** a one-off composition of existing primitives.
- A designer signed off on the variant set.

When to NOT add a component: never reinvent `button`. If you find yourself wanting a "BetterButton" — fix the existing button.

---

## Microcopy voice

Every string the user sees should pass these tests:

- **Does it sound like a human wrote it?** "Something went wrong" → "We couldn't save Maria's attendance — check your connection and tap Retry."
- **Does it tell them what to do next?** Not "Error 500" — "We're rebuilding the page. Please refresh in a moment."
- **Is it specific?** Not "Saved" — "Attendance saved for P5 East."
- **Is it kind?** Not "You must…" — "Please add a parent phone number so we can send reports."

Words to avoid: *Submit, Failed, Invalid, Error, Required, Click here, Welcome to Maple!*

Words to prefer: *Save, Continue, Try again, Add, Send, Done, See full update.*

---

## Mobile-first

Schools in our target market run on low-end Android. Design for:

- **Thumb reach** — primary actions live in the bottom 1/3 of the screen.
- **One hand** — never require two-handed input for daily tasks.
- **Weak networks** — every screen must work offline for at least its primary action.
- **Cheap displays** — high-contrast text (avoid `text-slate-400` on `bg-white`).
- **Glove use** — large tap targets (44px+) even for "small" toggles.

We design mobile first, then scale up to desktop. Desktop adapts the layout; mobile defines the priority.

---

## What's deliberately out of scope (v1)

- A full Storybook. We have one ground-truth file (this doc) + the live screens.
- Animations beyond the three speeds. Lottie, GIF-heavy onboarding, parallax — not now.
- A separate dark mode visual identity. The current `.dark` class triggers a heavy override layer in `src/index.css` that we'll refactor in Phase 1 once the foundation has settled. New screens should look fine in light mode and tolerable in dark.
- Native-feeling iOS / Android specific gestures (3D Touch, force-touch, etc.). PWA only.

---

## How to consume the system

When you build a new screen:

1. Wire the **layout** with Tailwind defaults + the spacing patterns above.
2. Apply **typography classes** (`text-h1`, `text-body-default`, etc.) rather than raw `text-3xl font-semibold`.
3. Reach for **shadcn components** before composing your own.
4. Use **elevation utilities** (`elevation-2`, etc.) instead of `shadow-md`.
5. Wrap interactive elements in **`focus-ring`** and ensure they meet the tap target minimum.
6. Use **motion utilities** (`motion-fast` etc.) for transitions.
7. Design all **five states** (default / loading / empty / error / success) before code review.
8. Write **microcopy** that passes the voice tests above.

If a screen needs something the system doesn't provide — extend the system in this doc + the tokens. Don't fork the visual language.
