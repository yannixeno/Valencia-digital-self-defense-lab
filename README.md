# Digital Self-Defense

Interactive workshop prototype for Valencia College Cyber Defense Club. November 6, 2026 · Poinciana Campus.

## Local demo

Requires Node.js 24. No dependency installation needed.

```sh
npm start
```

Open http://localhost:3000. On phones connected to the same Wi-Fi, use http://YOUR-COMPUTER-LAN-IP:3000 (your firewall must permit the server). Campus Wi-Fi may isolate devices; hosted Pages is preferable for the event.

## GitHub Pages

Put the contents of this folder at the repository root. The workflow expects the main branch. Under Settings → Pages, choose GitHub Actions as the source. Push to main or run “Deploy workshop to GitHub Pages.” Pull requests test and build without deployment. For a different default branch, update both workflow branch lists.

The build reads the Pages base path and generates a real index.html for every challenge, completion, and facilitator route. QR links such as https://OWNER.github.io/REPOSITORY/challenge/qr-free-food/ load directly, including refreshes. Use the facilitator page on the deployed site to get the final URLs before generating and laminating QR cards. It prints destinations, not actual QR graphics.

Manual static build: `node build.js`. For a project Pages URL, set BASE_PATH to /REPOSITORY before running the build. Upload only dist, never the Node development server.

## Edit scenarios

Edit scenarios.js: id, title, category, type (offer/email/social/sms/mfa/login), context, sender, detail, headline, body, url, cta, answer (safe/suspicious/more), flags (title/explanation pairs), check (reflection options), protect. Additions appear in the collection automatically; rebuild to generate their direct static routes.

## Interaction and privacy

Choose a verdict → select what you would check → reveal → next challenge. There is no score or timer. The completion count stores only scenario IDs and completion booleans in sessionStorage. Responses and reflection selections are memory-only. Closing the tab normally clears session progress. Reset is available on the completion screen. No analytics, backend, identity tracking, or aggregate collection. All messages use sample data and reserved .example domains. Login previews have fixed sample fields, no editable inputs, forms, or authentication. Preview buttons and URLs are inactive.

Google Fonts is used for typography, with local system-font fallbacks. This requests fonts from Google; self-host or remove the CSS import for a fully offline demo. GitHub Pages infrastructure can retain ordinary hosting request logs; the app itself collects no personal data.

## Checks

`npm test` checks scenario integrity, fictional domains, reflection gating, and absence of credential entry/network response code. Browser QA should cover phone widths, keyboard navigation, direct links and refresh, all verdicts, reflection gating, completion/reset, and the Pages base path.

This is an educational prototype, not an official college login service. Verify event details and content with the club before printing or publishing.
