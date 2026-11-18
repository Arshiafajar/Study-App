<img width="1912" height="964" alt="image" src="https://github.com/user-attachments/assets/598f2fd4-ea48-463e-b4c2-a6b060da2eec" />

<img width="1915" height="970" alt="image" src="https://github.com/user-attachments/assets/fa4d0e52-abd2-411f-a430-3edcb6f4b55c" />

The student portal looks like this. <img width="1528" height="950" alt="image" src="https://github.com/user-attachments/assets/90e65097-5658-4b6b-a274-61d1cfa27ce3" />

Everyday student gets a spin and has the option to use it right away or save it for later.
<img width="1503" height="954" alt="image" src="https://github.com/user-attachments/assets/819f894b-53c1-409b-948f-d49eb78f8da1" />

Everyday, a task is completed, a cherry is collected. 

<img width="1098" height="955" alt="image" src="https://github.com/user-attachments/assets/9f3633b8-2fac-4d77-907d-e273a9956c3a" />

# Maida's Cherry Tasks

Installable offline web app. Maida opens `index.html` (her view). You open `teacher.html` (login required) to add tasks.
Data lives in your own free Firebase project.

## 1. Setting up Firebase project 
1. Go to https://console.firebase.google.com and create a project (disable Analytics).
2. Build > Firestore Database > Create database > start in production mode.
3. Build > Authentication > Get started > Sign-in method > enable Email/Password.
   Then Users tab > Add user: your email and a password (this is your teacher login).

## 2. Connecting the app
1. Project settings (gear) > Your apps > Web (</>) > register app > copy the `firebaseConfig` values into `firebase-config.js`.
2. Firestore > Rules tab: paste the content of `firestore.rules`, replace `YOUR_EMAIL_HERE` with the email from step 1.3, Publish.

## 3. Run on localhost (VS Code)
Modules need a server (not file://). Either:
- VS Code extension "Live Server" > right-click `index.html` > Open with Live Server, or
- Terminal in this folder: `npx serve .`

Student view: `http://localhost:xxxx/index.html`. Teacher view: `.../teacher.html`.

## 4. Put it online for student
Localhost only works on your computer, so student needs a hosted copy:
- `npm i -g firebase-tools`, `firebase login`, `firebase init hosting` (public directory: `.`, single-page app: No, don't overwrite files), `firebase deploy`
- Or drag the whole folder into https://app.netlify.com/drop

Send your the resulting URL. The student opens it once with internet, then browser menu > Add to Home Screen. After that it works offline; ticks sync when she's online again.

## Updating the app
After changing any file, bump `VERSION` in `sw.js` (v1 > v2) before deploying, so her device refreshes its cache.

## Notes
- Keep the teacher URL (`teacher.html`) to yourself. Nobody can write tasks without your login anyway.
- Change the name or subjects in `common.js` (`KID`, `SUBJECTS`).
