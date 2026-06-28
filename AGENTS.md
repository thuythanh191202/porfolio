# Repository Guidelines

## Project Structure & Module Organization
This repository is a static portfolio site. The main page lives in `index.html` and includes inline CSS and JavaScript. Local visual assets are stored in `imgs/`, currently including profile and portfolio images such as `imgs/thanh-thuy.jpg`.

Keep new static assets in `imgs/` and reference them with relative paths, for example `src="imgs/new-image.jpg"`. If the site grows, split large inline code into `css/` and `js/` folders, but avoid introducing a build system unless it is needed.

## Build, Test, and Development Commands
No package manager or build pipeline is required.

- Open locally: double-click `index.html` or open it in a browser.
- Serve locally: `python -m http.server 8000` from the repository root, then visit `http://localhost:8000`.
- Quick file check: `Get-ChildItem -Recurse` to confirm expected files are present.

The page depends on CDN resources for Tailwind CSS, Google Fonts, and FontAwesome, so internet access is needed for the full visual design.

## Coding Style & Naming Conventions
Use 4-space indentation for HTML, CSS, and JavaScript to match the existing file. Prefer semantic HTML sections with clear `id` attributes for navigation and interactions. Keep class names descriptive for custom CSS, such as `.project-card`, `.skill-bubble`, and `.active-project-card`.

Use lowercase, hyphenated filenames for new assets: `campaign-proof.jpg`, `profile-headshot.png`. Keep Vietnamese display content in UTF-8 and verify text renders correctly in the browser after edits.

## Testing Guidelines
There is no automated test suite. Manually test changes in a browser at desktop and mobile widths. Check that navigation anchors, project cards, counters, overlays, and interactive buttons still work. Also verify that images load from `imgs/` and CDN icons/fonts appear correctly.

Before submitting visual changes, inspect the first screen, skills section, and project showcase for text overflow or layout overlap.

## Commit & Pull Request Guidelines
Git history was not available in this environment, so use concise, imperative commit messages:

- `Update portfolio hero styling`
- `Add project images`
- `Fix mobile layout spacing`

Pull requests should include a short summary, screenshots for visual changes, affected sections, and any manual test notes. Link related issues when available. Avoid mixing content rewrites, design changes, and JavaScript behavior changes in one PR unless they are tightly related.

## Security & Configuration Tips
Do not commit private contact data, analytics keys, or unpublished client materials without approval. External links should use `target="_blank"` only when paired with `rel="noopener noreferrer"`.
