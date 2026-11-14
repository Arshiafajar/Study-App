# Maida's Cherry Tasks

Installable offline web app. Maida opens `index.html` (her view). You open `teacher.html` (login required) to add tasks.
Data lives in your own free Firebase project, so no Claude account is involved on either side.

## 1. Firebase project (5 min, free)
1. Go to https://console.firebase.google.com and create a project (disable Analytics).
2. Build > Firestore Database > Create database > start in production mode.
3. Build > Authentication > Get started > Sign-in method > enable Email/Password.
   Then Users tab > Add user: your email and a password (this is your teacher login).

## 2. Connect the app
1. Project settings (gear) > Your apps > Web (</>) > register app > copy the `firebaseConfig` values into `firebase-config.js`.
2. Firestore > Rules tab: paste the content of `firestore.rules`, replace `YOUR_EMAIL_HERE` with the email from step 1.3, Publish.

## 3. Run on localhost (VS Code)
Modules need a server (not file://). Either:
- VS Code extension "Live Server" > right-click `index.html` > Open with Live Server, or
- Terminal in this folder: `npx serve .`

Student view: `http://localhost:xxxx/index.html`. Teacher view: `.../teacher.html`.

## 4. Put it online for Maida
Localhost only works on your computer, so Maida needs a hosted copy:
- `npm i -g firebase-tools`, `firebase login`, `firebase init hosting` (public directory: `.`, single-page app: No, don't overwrite files), `firebase deploy`
- Or drag the whole folder into https://app.netlify.com/drop

Send her the resulting URL. She opens it once with internet, then browser menu > Add to Home Screen. After that it works offline; ticks sync when she's online again.

## Updating the app
After changing any file, bump `VERSION` in `sw.js` (v1 > v2) before deploying, so her device refreshes its cache.

## Notes
- Keep the teacher URL (`teacher.html`) to yourself. Nobody can write tasks without your login anyway.
- Change the name or subjects in `common.js` (`KID`, `SUBJECTS`).
