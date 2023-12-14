# Game Builder Workshop
### Visit at [gamebuilderworkshop.com](https://gamebuilderworkshop.com/) ###
([ALTERNATIVE LINK](https://gamebuilderworkshop.pages.dev/))

## Overview ##
My capstone project, Game Builder Workshop, is a web application that guides the user through creating their own HTML5 game and allows the user to share their game creation with friends.

## Presentation & Demo ##
[![Watch the presentation video](https://img.youtube.com/vi/FcRUVsEPxVs/mqdefault.jpg)](https://www.youtube.com/watch?v=FcRUVsEPxVs)

## Built with ##
- [Next.js](https://nextjs.org/)
- [Phaser](https://phaser.io/)
- [Redux](https://redux.js.org/)

## File Structure ##
```
├── web-app
│   ├── public
│   │   ├── assets
│   │   │   ├── audio
│   │   │   ├── backgrounds
│   │   │   ├── cursors
│   │   │   ├── items
│   │   │   ├── obstacles
│   │   │   ├── platforms
│   │   │   └── sprites
│   │   ├── export
│   │   │   ├── game.js
│   │   │   ├── index.html
│   │   │   ├── launchgame.exe
│   │   │   └── launchgame.py
│   │   └── workshop
│   │       └── tutorials
│   ├── src
│   │   ├── app
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components
│   │   │   ├── PhaserGame
│   │   │   │   ├── scenes
│   │   │   │   │   ├── BaseScene.ts
│   │   │   │   │   ├── Edit.ts
│   │   │   │   │   └── Play.ts
│   │   │   │   └── index.tsx
│   │   │   ├── ActionButtons.tsx
│   │   │   ├── AssetsDrawer.tsx
│   │   │   ├── Canvas.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── OptionsMenu.tsx
│   │   │   ├── Toolbox.tsx
│   │   │   └── Tutorial.tsx
│   │   ├── data
│   │   │   ├── assets.ts
│   │   │   ├── startData.ts
│   │   │   └── types.ts
│   │   └── store.ts
│   ├── .eslintrc.json
│   ├── .gitignore
│   ├── README.md (Next.js)
│   ├── next.config.js
│   ├── package-lock.json
│   ├── package.json
│   └── tsconfig.json
└── README.md (you are here!)  
```