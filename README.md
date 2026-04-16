# CSS Icons Library

This project turns your local SVG set in `Icons/` into a CSS icon library you can host on GitHub and serve through jsDelivr.

## How it works

- Base icon class: `ss`
- Style class format: `ss-<style>-<icon>`
- For `bold` icons, a short alias is also generated: `ss-<icon>`

Examples:

```html
<i class="ss ss-bold-airplane"></i>
<i class="ss ss-airplane"></i>
<i class="ss ss-bold-google-chrome-logo"></i>
```

## Customize color and size

```html
<i class="ss ss-airplane" style="color:#0f172a;font-size:28px"></i>
<i class="ss ss-warning ss-lg" style="color:#ef4444"></i>
<i class="ss ss-circle-notch ss-xl ss-spin"></i>
```

Included size helpers:

- `ss-xs`
- `ss-sm`
- `ss-lg`
- `ss-xl`

## Build

```bash
npm run build
```

Generated files:

- `src/icons.css`
- `dist/icons.css`
- `dist/icons.min.css`
- `dist/icons.json` (icon manifest)

Local preview:

- Open `demo.html` in your browser.

## Use with jsDelivr

After pushing this repo to GitHub, use:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/<github-user>/<repo>@main/dist/icons.min.css">
```

For production, pin a tag/version:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/<github-user>/<repo>@v0.1.0/dist/icons.min.css">
```

## Publish flow

1. Push repo to GitHub.
2. Run `npm run build` and commit generated files.
3. Create a tag (example: `v0.1.0`) and push it.
4. Use the tagged jsDelivr URL on your website.

## Add more icons

1. Drop new SVG files into `Icons/<style>/`.
2. Run `npm run build`.
3. Commit the updated `dist` files.

## License note

Set this package license to match the icon source license if needed.
