# 🌿 NotesWebsiteBuilder (GitHub Action)

This repository is a **platform-agnostic GitHub Action** and static site generator powered by Nuxt 3 and `@nuxt/content`. It converts a repository of Markdown / Obsidian notes into a ready-to-deploy static website bundle and uploads it as a build artifact.

Because this action is platform-agnostic, you can deploy the generated bundle to any host: **Cloudflare Pages**, **GitHub Pages**, **Vercel**, **Netlify**, **AWS S3**, etc.

---

## ⚡ Deployment Examples for your Notes Repository

### Example 1: Deploy to Cloudflare Pages (Recommended)

1. In your **Notes repository**, add your Cloudflare credentials in **Settings** > **Secrets and variables** > **Actions**:
   - `CLOUDFLARE_API_TOKEN` (API Token with *Cloudflare Pages: Edit* permissions)
   - `CLOUDFLARE_ACCOUNT_ID`
2. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Notes to Cloudflare Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Notes
        uses: actions/checkout@v4

      - name: Build Notes Website
        uses: GiulioTognetto/NotesWebsiteBuilder@main
        with:
          content-dir: '.' # or subfolder like 'notes'
          nitro-preset: 'cloudflare-pages' # base-url automatically defaults to '/'

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=my-notes-site
```

---

### Example 2: Deploy to GitHub Pages

1. In your **Notes repository**, go to **Settings** > **Pages** and set **Source** to **GitHub Actions**.
2. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Notes to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Notes
        uses: actions/checkout@v4

      - name: Build Notes Website
        uses: GiulioTognetto/NotesWebsiteBuilder@main
        with:
          content-dir: '.'
          # nitro-preset defaults to 'static'
          # base-url is auto-detected: '/<repo-name>/' or '/' if custom domain / CNAME

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## ⚙️ Action Inputs

| Input | Description | Required | Default |
|---|---|---|---|
| `content-dir` | Path inside caller repo where notes are stored. | No | `.` |
| `nitro-preset` | Nitro build preset (e.g. `static`, `cloudflare-pages`, `github-pages`, `vercel`). | No | `'static'` |
| `base-url` | Base URL for the website. If omitted: defaults to `'/'` for any non-static preset (like `cloudflare-pages`); auto-detects `/<repo-name>/` or `'/'` for `static`. | No | `""` (auto) |
| `upload-artifact` | Upload standard GitHub Actions build artifact. | No | `'true'` |
| `artifact-name` | Name of the uploaded artifact. | No | `'website-build'` |
| `github-token` | Token used to inspect GitHub Pages API when preset is `static`. | No | `${{ github.token }}` |

## 📤 Action Outputs

| Output | Description |
|---|---|
| `output-dir` | Path to the generated files in the caller workspace (`dist/`). |
| `base-url` | The resolved base URL used to compile the website. |

---

## 🛠️ Local Development

To run or customize the theme locally:

1. Clone this repository:
   ```bash
   git clone https://github.com/GiulioTognetto/NotesWebsiteBuilder.git
   cd NotesWebsiteBuilder
   ```

2. Place sample notes in `content/`.

3. Install dependencies and start the dev server:
   ```bash
   bun install
   bun dev
   ```

4. Open `http://localhost:3000`.
