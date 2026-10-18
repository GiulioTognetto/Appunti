# 🌿 Obsidian Notes Website



This repository is a **Nuxt 3 + `@nuxt/content`** template designed to turn a repository of Markdown notes (written in Obsidian or any other text editor) into a fast, customizable static website.



Powered by **Bun** and **GitHub Actions**, the website automatically rebuilds and updates whenever you publish or edit a note in your vault.



---



## 🚀 Quick Setup Guide



Setting up your website takes less than 5 minutes and requires zero code modifications.



### Step 1: Create the Website Repository

1. Click the **"Use this template"** button at the top right of this GitHub page and create a new repository (e.g., `my-notes-website`).

2. Go to your new repository's **Settings** on GitHub:

   * In the left sidebar, click **Pages**.

   * Under **Source**, select **GitHub Actions**.



### Step 2: Link Your Notes Repository

1. Copy the full Git URL of your notes repository (e.g., `https://github.com/your-username/my-notes.git`).

2. In your **Website** repository, go to **Settings** > **Secrets and variables** > **Actions** > **Variables** tab.

3. Click **New repository variable** and enter:

   * **Name:** `CONTENT_REPOSITORY_URL`

   * **Value:** Your full notes repository URL (e.g., `https://github.com/your-username/my-notes.git`).



---



## 🔄 Automatic Synchronization (Optional)



If you want the website to **automatically rebuild** every time you `git push` to your notes repository:



1. Open your **Notes** repository on GitHub.

2. Create a file named `.github/workflows/notify-website.yml` and paste the following configuration:



```yaml

name: Trigger Website Build



on:

  push:

    branches:

      - main # or 'master'



jobs:

  notify:

    runs-on: ubuntu-latest

    steps:

      - name: Send Dispatch Event

        uses: peter-evans/repository-dispatch@v3

        with:

          token: ${{ secrets.GITHUB_TOKEN }}

          repository: YOUR-USERNAME/YOUR-WEBSITE-REPO # e.g., john/my-notes-website

          event-type: appunti-updated

```



*(Be sure to replace `YOUR-USERNAME/YOUR-WEBSITE-REPO` with your website's repository path)*.



---



## 🛠️ Local Development



If you want to customize styles, Vue components, or test the website locally using **Bun**:



1. Clone the website repository including the notes submodule:

   ```bash

   git clone --recursive https://github.com/your-username/your-website-repo.git

   cd your-website-repo

   ```



2. If you haven't linked the local submodule into the `content/` folder yet:

   ```bash

   git submodule add https://github.com/your-username/my-notes.git content

   ```



3. Install dependencies and start the development server:

   ```bash

   bun install

   bun dev

   ```



4. Open `http://localhost:3000` in your browser.



---



## 📦 Tech Stack



* **Framework:** [Nuxt 3](https://nuxt.com/)

* **Content Engine:** [`@nuxt/content`](https://content.nuxt.com/) (with built-in support for Wikilinks `[[note]]`)

* **Package Manager & Runtime:** [Bun](https://bun.sh/)

* **Deployment:** GitHub Pages & GitHub Actions