# UAlbany Campus Portal

Full-stack web application for Albany Campus Portal platform. This project is a complete production-ready solution with a modern frontend (HTML/CSS/JavaScript), backend API (Node.js/Express), and MySQL database. Features user authentication, profiles, social posts, education/experience tracking, AI chatbot, and real-time interactions.

## Features

- **User Authentication:** Secure registration and login with JWT tokens
- **User Profiles:** Create, update, and manage user profiles with bio, skills, education/experience
- **Social Feed:** Post updates, like posts, comment on posts
- **Search:** Search for other users and browse profiles
- **Education & Experience:** Track educational history and work experience
- **Dark Mode:** Toggle between light and dark themes
- **Accessibility:** WCAG AA compliant design
- **Security:** HTTPS, input validation, XSS prevention, CSRF protection
- **Responsive Design:** Mobile-first approach with tablets and desktop support

Deployed Static Webapp via [GitHub Pages](https://lindakovacs.github.io/UAlbany-Campus-Portal-Theme/)

## Project Team:

- Maryam Sheikh: Project Manager​

- Linda Kovacs: Software Developer Lead​

- Anas Elkhiat: Quality Assurance Lead​

- Tejas Kilaru: Accessibility & UX/UI Designer Lead​

- Ian Walters: Security Lead​

## Pages

- Home: index.html
- Auth: login.html, register.html
- Profile: profile.html, create-profile.html, add-education.html, add-experience.html
- Posts: posts.html, post.html
- Dashboard: dashboard.html
- Browse: profiles.html

## Shared UI Modules

- modules/navbar.html
- modules/chat.html
- modules/footer.html

## Styles & Assets

- css/style.css
- img/ (static images)

## Getting Started

Open any HTML file in your browser (for example, in VS Code, right-click on your HTML file (such as index.html) in the editor and select "Open with Live Server" from the context menu. Alternatively, you can use the keyboard shortcut Alt + L then Alt + O.). No build step or server is required for this Static UI website phase.

## Project Structure

```
.
├── README.md
├── LICENSE
├── .gitignore
│
├── FRONTEND
│   ├── add-education.html
│   ├── add-experience.html
│   ├── create-profile.html
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   ├── post.html
│   ├── posts.html
│   ├── profile.html
│   ├── profiles.html
│   ├── register.html
│   ├── css/
│   │   ├── style.css
│   │   ├── dark-mode.css
│   │   ├── profile-edit.css
│   │   ├── experience-education.css
│   │   ├── profile-search.css
│   │   └── chat-bot.css
│   ├── js/
│   │   ├── authentication.js
│   │   ├── profile-edit.js
│   │   ├── profile-search.js
│   │   ├── post-interactions.js
│   │   ├── comments.js
│   │   ├── experience-education.js
│   │   ├── form-validation.js
│   │   └── chat-bot.js
│   ├── img/
│   └── modules/
│       ├── navbar.html
│       ├── footer.html
│       └── chat.html
│
└── BACKEND (server/)
    ├── package.json
    ├── server.js
    ├── .env.example
    ├── config/
    │   └── db.js
    ├── routes/
    │   ├── auth.js
    │   ├── profiles.js
    │   └── posts.js
    ├── controllers/
    │   ├── authController.js
    │   ├── profileController.js
    │   └── postController.js
    ├── middleware/
    │   ├── auth.js
    │   └── validation.js
    ├── utils/
    │   ├── validators.js
    │   └── sanitizers.js
    └── scripts/
        ├── init-db.sql
        └── run-migrations.js
```

## Technologies

**Frontend:** HTML5, CSS3, JavaScript (Vanilla - no frameworks), DOM Manipulation, Fetch API

**Backend:** Node.js, Express.js, MySQL, JWT Authentication, bcryptjs

**Security:** JWT tokens, bcrypt hashing, input validation, XSS prevention, CSRF protection

**Deployment:** zeet.co (free tier with HTTPS, auto-deploy from GitHub)

**DevTools:** Git, GitHub, npm, nodemon

## Project Links

[GitHub Repository - Version Control & Collaboration](https://github.com/lindakovacs/UAlbany-Campus-Portal)

[Figma Desktop Wireframe Prototype](https://www.figma.com/proto/PiQZQ5yft44BaGyUbHGRRk/UAlbany-Campus?node-id=9-4&p=f&t=wNPUjPe54NW14knE-1&scaling=min-zoom&content-scaling=fixed&page-id=9%3A2&starting-point-node-id=9%3A4)​

[Figma Mobile Wireframe Prototype​](https://www.figma.com/proto/PiQZQ5yft44BaGyUbHGRRk/UAlbany-Campus?node-id=37-268&t=F4vHdLp9OArwFI2V-1&scaling=min-zoom&content-scaling=fixed&page-id=37%3A2&starting-point-node-id=37%3A268&show-proto-sidebar=1)

[Trello Board - Project Management](https://trello.com/b/bbsR787B/ualbany-campus-portal)​

[GitHub Repository - Version Control & Collaboration​ - Static Version](https://github.com/lindakovacs/UAlbany-Campus-Portal-Theme)

[GitHub Pages – Static Website Deployment & Hosting](https://lindakovacs.github.io/UAlbany-Campus-Portal-Theme/)

[YouTube Playlist](https://www.youtube.com/playlist?list=PLG_-OoK6rGHX6r0u-1LHN30CsLeEYQNO0)
