# Link-preview card

`og-card.html` is the source of `public/og-image.png`, the 1200×630 image that Open Graph and Twitter cards show when the site's URL is pasted into LinkedIn, Slack, WhatsApp, iMessage and the like (the tags are in `index.html`). It loads the site's two variable fonts straight from `node_modules`, so run `pnpm install` first.

To regenerate it, from the repo root (macOS Chrome path; adjust for your platform):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=3000 --screenshot="$PWD/public/og-image.png" "file://$PWD/scripts/og/og-card.html"
```

The host serves non-HTML files with a year-long immutable cache, and link-preview services cache images too, so a changed card wants a new file name (and the `og:image` / `twitter:image` URLs updating to match) rather than an overwrite.
