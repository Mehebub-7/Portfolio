# Portfolio — Mehebub Alli Khan

Static site, deployed by GitHub Pages from the repository root:
<https://mehebub-7.github.io/Portfolio/>

## Which files do I edit?

| Edit these | Don't edit these |
| --- | --- |
| `data/projects.json` — every project's title, summary, role, tech, store links | The 21 `<ProjectName>.html` files in the root |
| `templates/project.html` — the shared detail-page layout | The block between the `build:projects` markers in `index.html` |
| `index.html` — everything *outside* the `build:projects` markers | |
| `style.css`, `project-style.css`, `script.js` | |

The 21 project pages in the root are **build output**, not sources. They are
committed because GitHub Pages serves files straight from the branch — if they
weren't here, the live site would 404. Each one carries a `GENERATED FILE — DO
NOT EDIT` banner; anything you type into them is lost on the next build.

Adding a project means adding one entry to `data/projects.json` and dropping
`icon.png` + `video.mp4` into `Assets/<Slug>/`. Asset paths are derived from the
slug, so nothing else needs touching.

## Commands

```sh
npm start      # preview at http://localhost:8080  (npm start -- 3000 for another port)
npm run build  # regenerate the 21 detail pages + the project grid in index.html
npm run check  # verify the generated files are up to date; exits 1 if not
```

Run `npm run build` and commit the regenerated HTML alongside your data change.
`npm run check` is the CI-friendly guard — it fails if someone edits a generated
file by hand, or if the "21 shipped titles" copy in `index.html` drifts out of
sync with the number of projects in `data/projects.json`.

## Layout

```
data/projects.json      source of truth for all 21 projects
templates/project.html  detail-page template ({{placeholders}})
tools/build.js          renders detail pages + injects the index grid
tools/image-size.js     reads real PNG/JPEG/WebP dimensions at build time
tools/serve.js          local preview server (supports video range requests)
vendor/                 pinned third-party JS (GSAP 3.15.0)
Assets/<Slug>/          icon.png + video.mp4 per project
private/                git-ignored; local-only files, not published
```

Note: several files in `Assets/` named `icon.png` are actually WebP. Browsers
sniff the content so they render fine, and `tools/image-size.js` reads the real
dimensions either way.
