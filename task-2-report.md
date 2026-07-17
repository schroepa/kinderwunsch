## Task 2: Mobile header overflow fix

**Status:** Done

**Problem:** At 375px/320px viewport widths, the SiteLayout header clipped the inline ThemeToggle because the brand label and wide nav gaps consumed all horizontal space.

**Changes (`src/layouts/SiteLayout.astro`):**
- Header row: `min-w-0`, `flex-wrap`, tighter mobile gaps (`gap-2` / `sm:gap-2.5`)
- Brand link: `truncate max-w-[9rem] sm:max-w-none` with `min-w-0`
- Nav + toggle group: `shrink-0` so controls stay visible; nav gaps reduced to match
- Inline ThemeToggle retained in header (existing `shrink-0` on component)

**Build:** `npm run build` — success (0 errors, 0 warnings)

**Commit:** (see below)
