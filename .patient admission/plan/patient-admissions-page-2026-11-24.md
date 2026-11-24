# Patient Admissions Page

Recreate the reference as the app’s first screen at `/`.

## What to build
- Match the compact hospital ward-register layout: header, patient search and filters, patient count, and a scannable admissions table.
- Include the six patients shown in the reference, with their ward, department, doctor, admission date, and current status.
- Make search, filters, clear filters, add, edit, discharge, and delete usable within the page. Keep changes in the current browser session; no account or backend is requested.
- Use the project’s existing design components and semantic color tokens, with a layout that remains usable on narrow screens.

## Technical details
- Implement the page in `src/routes/index.tsx` and give `/` app-specific page metadata.
- Add only the page-specific semantic theme tokens and styling needed in `src/styles.css`.
- Keep the initial patient records literal in the page and validate the primary page interactions in the browser.