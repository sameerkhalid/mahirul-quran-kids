# Mahirul Qur’an Kids

A frontend-only, offline-capable Qur’an memorisation game for young children. The current question bank covers 22 surahs, from Ad-Duha through An-Nas.

## Run locally

```sh
corepack pnpm install
corepack pnpm dev
```

## Verify

```sh
corepack pnpm verify
corepack pnpm exec playwright install chromium
corepack pnpm test:e2e
```

Question and Qur’an content is intentionally separate from components. See [`src/content/README.md`](src/content/README.md) before making content changes.

## Generate question narration

Generate all five child-friendly question prompts with OpenAI text-to-speech:

```sh
corepack pnpm generate:narration --api-key "YOUR_OPENAI_API_KEY"
```

The script generates every clip in a staging directory first. It only replaces the source files in `public/narration/` after all five requests succeed and the results pass basic validation. The API key is used only by this development script and is never added to the frontend build.

Do not edit `dist/narration/` directly: `dist/` is generated output. After changing narration, run `corepack pnpm build` to copy the new clips into `dist/` and refresh the PWA cache manifest.

## Deployment

Pushes to `main` are automatically tested, built, and deployed to GitHub Pages at:

<https://sameerkhalid.github.io/mahirul-quran-kids/>

The deployment workflow supplies `BASE_PATH=/mahirul-quran-kids/`; local builds continue to use `/`. Client-side routes use URL hashes so that refreshing a nested screen works on static hosting.

## Prototype sources

- Uthmanic Hafs text/font: King Fahd Glorious Qur’an Printing Complex resources; Surahs 93–104 retrieved through the Quran Foundation/Quran.com content API
- Recitation: Sheikh Ibrahim Al-Akhdar, sourced from EveryAyah for the local prototype

Confirm recording reuse permission and perform a final Qur’an-content review before public deployment.
