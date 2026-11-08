# 🪔 Magical Diwali Celebration – From Ashish

A single-page, interactive Diwali greeting: a cinematic diya intro, canvas fireworks you can tap to launch, an animated rangoli, lanterns, diyas and candles, floating petals and embers, festive music, and a "Send Happiness" share button.

Pure HTML5 + CSS3 + vanilla JavaScript. No libraries, no backend, no external requests (fonts are self-hosted). Total size is about 400 KB.

## Project structure

```
index.html            Page markup + SEO / WhatsApp preview tags
css/style.css         All styling, animations, responsive rules, self-hosted @font-face
js/config.js          ← The settings you edit (share link, optional music file, share text)
js/art.js             SVG generators: diyas, candles, lanterns, rangoli, petals
js/fireworks.js       Canvas fireworks engine (rockets, peony, ring, willow, crackle, heart)
js/music.js           Built-in synthesized raga-style instrumental (Web Audio) + optional file
js/main.js            Intro sequence, decorations, tap-to-launch, Celebrate, Share, music UI
assets/favicon.svg    Diya favicon
assets/apple-touch-icon.png
assets/og-image.jpg   1200×630 preview image for WhatsApp / social links
assets/fonts/         Cinzel Decorative, Cormorant Garamond, Great Vibes, Poppins (SIL OFL)
.github/workflows/pages.yml   Auto-deploy to GitHub Pages
```

## Customising

Edit `js/config.js`:

- `shareUrl`: the link "Send Happiness" shares. Leave it empty to share the page's own URL (right for GitHub Pages and Netlify).
- `musicFile`: optional, e.g. `"assets/music.mp3"`. Leave it empty to use the built-in music. If the file is missing or can't play, the built-in music takes over automatically.
- `shareText` / `shareTitle`: the message sent along with the link.

Music never plays until the visitor taps "Begin the Celebration" or the Music button.

## Run locally

```bash
cd diwali
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy option A: GitHub Pages (free, preferred)

1. Create a new **public** repository on GitHub, e.g. `diwali` (github.com → New repository; don't add a README).
2. Upload the files:
   ```bash
   cd diwali
   git init && git add . && git commit -m "Diwali greeting"
   git branch -M main
   git remote add origin https://github.com/<your-username>/diwali.git
   git push -u origin main
   ```
   (You can also drag-and-drop the unzipped folder's contents on the repo's "uploading an existing file" page.)
3. In the repo, go to **Settings → Pages → Build and deployment → Source: GitHub Actions**. The included workflow publishes the site on every push.
   You can also pick *Deploy from a branch → main → / (root)*.
4. After about 1 minute your site is live at `https://<your-username>.github.io/diwali/`.
5. Optional, for richer WhatsApp previews: in `index.html`, change the two `assets/og-image.jpg` references to the full URL, e.g. `https://<your-username>.github.io/diwali/assets/og-image.jpg`.

## Deploy option B: Netlify (free)

1. Go to https://app.netlify.com/drop.
2. Drag the unzipped `diwali` folder onto the page.
3. You get a public `https://<random-name>.netlify.app` URL instantly. Rename it under Site settings → Change site name.

## Quality checks performed

- Headless Chrome at desktop (1440×900) and mobile (390×844, touch, 2× DPR) sizes
- Zero console errors, zero failed requests
- Tap-to-launch fireworks, Celebrate sequence, music on/off toggle, share sheet + copy link, close button
- No horizontal scrolling on phones; around 60 fps on the mobile profile
- Adaptive particle budget keeps slower phones smooth; respects "reduce motion"; pauses when the tab is hidden
