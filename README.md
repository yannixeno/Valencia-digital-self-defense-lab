# Digital Self-Defense workshop

Valencia College Cyber Defense Club · November 6, 2026 · Poinciana Campus.

The physical room drives the experience. Students scan a flyer or laminated card, inspect its fictional message, share their reasoning, and choose a practical action. There is no catalog on the welcome page, prescribed scenario order, score, or completion requirement.

Each item opens with a brief scene card, followed by Look → Think → Discover → Choose → Take it with you. Previous-step controls preserve choices only while the item is open. Tap “Show me” on a warning to expand its explanation and highlight the relevant message or clue. A colored habit card concludes the item before students return to the physical workshop. Motion respects reduced-motion settings. All email scenarios use the shared Valencia-style simulated inbox.

Design references: [Jigsaw Phishing Quiz](https://phishingquiz.withgoogle.com/) for focused inspection and progressive reveals, and [Be Internet Awesome](https://beinternetawesome.withgoogle.com/en_us) for distinct visual themes and practice through interaction. No source code, assets, or branding from those references is included; no name/email setup is used.

## Local demo

Node.js 24; no dependencies to install. Run `npm start`, then open http://localhost:3000. Phones on the same Wi-Fi can use your computer’s LAN IP and port if your firewall and Wi-Fi permit it.

## Routes and hosting

`/` welcomes students with STOP → CHECK → PROTECT and invites them to scan a workshop item. `/challenge/SCENARIO-ID/` opens an item directly. `/complete/` reinforces the habit and sends students back to the room. `/facilitator/` lists all items for staff, including printable card labels, URLs, questions, takeaways, and time estimates. The facilitator page is public educational material, not an authenticated dashboard.

GitHub Pages: repository Settings → Pages → Source → GitHub Actions. The included workflow tests and builds on main, then deploys dist. Pull requests test/build without deploying. `npm run build` generates an index.html for every route. Set BASE_PATH to /REPOSITORY for a manual project-URL build. Existing QR destinations remain unchanged.

## Scenario authoring

Edit scenarios.js. Core message fields describe the artifact. The workshopDetails object is keyed by the same scenario id and provides label, question, clue, practical actions, and recovery. Each action is [label, safest boolean, explanation]. Include one safest action and explanations for all alternatives. Recovery is an array of short steps; use an empty array when it is not applicable. Estimates default to 2–3 minutes. New scenario ids also need a matching workshopDetails entry; tests check this. Rebuild to generate the new static URL.

Message types: offer (flyer), email (inbox), social (DM), sms (phone thread), mfa (push notification), login (static sign-in preview). Each has tap-to-expand clues. A student must inspect at least one clue and choose a verdict before reflection; at least one reflection before reveal; and an action before its explanation. Warnings are revealed only after reflection. Native details controls support keyboard and touch. Internal stage navigation focuses its heading.

## Physical setup

Use the deployed facilitator page to get final URLs. Print its staff sheet and copy its short labels onto physical cards. Generate QR graphics from those URLs separately. Students can start anywhere. Ask the suggested discussion question when they return to the room. Do not place the facilitator answer sheet among student artifacts.

## Privacy and safety

No backend, analytics, response submission, or participant tracking. Choices and clue state are held only in memory and disappear on refresh/navigation. No browser storage is used. No editable credential, identity, payment, or free-text fields exist. Reflection checkboxes are predefined. Login identities/passwords are fixed display text. Simulated links and message action buttons are inert; domains use reserved .example addresses. The app has no authentication functionality and never opens simulated destinations.

Google Fonts is loaded for typography with system-font fallbacks; remove the font import for a fully offline demo. GitHub Pages can retain ordinary hosting request logs; the app does not collect participant data.

## Verification

`npm test` checks content, recovery, action explanations, privacy boundaries, and progression gates. `node --check app.js` checks syntax. Browser checks cover clue gating, reflection, safe/unsafe practical-action feedback, recovery, direct-route refresh, mobile layout, and facilitator printing. Avoid collecting student data in testing.

App previews use a shared Valencia/Outlook mail frame, Teams chat frame, Microsoft Authenticator approval frame, Microsoft 365 sign-in styling, and iMessage-style SMS. Fictional identities, simulation labels, inactive controls, and fixed credential/code displays remain mandatory.
