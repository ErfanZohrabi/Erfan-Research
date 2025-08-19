git add .
git commit -m "Initial site"
git branch -M main
git remote add origin git@github.com:yourusername/research-notes.git
git push -u origin main
research — simple static note site

What this is
- A minimal, client-side note-taking site (no backend). Notes are stored in your browser's localStorage. You can export/import JSON. The site title is `research` and there is a separate `Note` page for your article.

Files
- `index.html` — main page (notes) with navigation
- `note.html` — static article page (News-style layout)
- `css/styles.css` — styling
- `js/app.js` — note logic (save/load/search/export/import)

Workflow additions

Rule: after any site update, the README should be updated with a short changelog entry (date and description).

Preview locally
1. In a terminal, start a simple static server from the project root:

```bash
python3 -m http.server 8000
```

2. Open http://localhost:8000 in your browser.

Push to GitHub and publish via GitHub Pages
1. Create a repo on GitHub (for example `YOUR_USERNAME/research`).
2. From the project folder run (replace `YOUR_USERNAME` and `research`):

```bash
git init
git add .
git commit -m "Initial site: research"
git branch -M main
# using SSH
git remote add origin git@github.com:YOUR_USERNAME/research.git
# or HTTPS
# git remote add origin https://github.com/YOUR_USERNAME/research.git
git push -u origin main
```

3. Enable GitHub Pages for the repo:
- Go to the repo Settings -> Pages
- Choose branch `main` and folder `/ (root)` then Save.
- The site will be available at `https://YOUR_USERNAME.github.io/research/` within a minute.

Notes and next steps
- If you want full Markdown rendering on the Note page or in the editor, I can add `marked.js` and wire it up.
- I can also add a `notes/` folder and an export script so your notes are versioned and served as HTML pages.
