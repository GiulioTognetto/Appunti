# 🌿 NotesWebsiteBuilder (GitHub Action)

This repository is both a Nuxt 3 static website engine and a **GitHub Action** that turns any repository of Markdown / Obsidian notes into a fast, static website hosted on GitHub Pages.

---

## 🚀 How to use this Action in your Notes repository

You don't need to fork or clone this repository anymore! You just need to add a single workflow file to your **Notes** repository.

### Step 1: Enable GitHub Pages in your Notes Repository
1. In your **Notes** repository on GitHub, go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.

### Step 2: Add the Deployment Workflow
In your **Notes** repository, create `.github/workflows/deploy.yml` with the following content:

```yaml
name: Deploy Notes Website

on:
  push:
    branches:
      - main # or master
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

      - name: Build Website
        uses: GiulioTognetto/ObsidianNotesWebsite@main
        with:
          # Optional: path to your notes if they are in a subfolder (e.g. 'notes' or 'vault')
          content-dir: '.'

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
| `content-dir` | Path inside the caller repository where Markdown notes are located. | No | `.` |
| `base-url` | Override the site's base URL (e.g. `/my-notes/` or `/`). By default, it is auto-detected. | No | `""` (auto) |
| `upload-pages-artifact` | Upload the build as a GitHub Pages artifact ready for `actions/deploy-pages`. | No | `'true'` |
| `github-token` | Token used to inspect GitHub Pages API for custom domain detection. | No | `${{ github.token }}` |

## 📤 Action Outputs

| Output | Description |
|---|---|
| `output-dir` | Path to the generated static files (`.output/public`). |
| `base-url` | The resolved base URL used to compile the site. |

---

## 🛠️ Local Development

If you want to customize the website theme, components, or plugins:

1. Clone this repository:
   ```bash
   git clone https://github.com/GiulioTognetto/ObsidianNotesWebsite.git
   cd ObsidianNotesWebsite
   ```

2. Place your sample markdown files inside the `content/` folder.

3. Install dependencies and run the dev server:
   ```bash
   bun install
   bun dev
   ```

4. Open `http://localhost:3000` in your browser.
