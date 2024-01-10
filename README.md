
# ArcRun by McKpl and xKotelek
ArcRun is clone of spotlight search from macos and powertoys from windows, but better.
We are using Tauri and Qwik to build this WebApp.
App is on early development, now it only looks nice.

![image](https://github.com/McKpol/ArcRun/assets/104125769/8e36ea40-16d0-4b69-8abe-3a8cf7c6909e)

## How to use it?
1. Clone repo with ```git clone McKpol/ArcRun``` or by downloading zip
2. Use ```npm i``` to install node modules
2. Use ```npm run tauri dev``` for visible changes
3. Use ```npm run tauri build``` for building app (for windows installer is in src-tauri/target/release/bundle /msi or /nsis) more info on https://tauri.app/v1/guides/building

## Project Structure

```
├── public/
│   └── ...
└── src/
    ├── components/
    │   └── ...
    └── routes/
        └── ...
```

- `src/routes`: Provides the directory-based routing, which can include a hierarchy of `layout.tsx` layout files, and an `index.tsx` file as the page. Additionally, `index.ts` files are endpoints. Please see the [routing docs](https://qwik.builder.io/qwikcity/routing/overview/) for more info.

- `src/components`: Recommended directory for components.

- `public`: Any static assets, like images, can be placed in the public directory. Please see the [Vite public directory](https://vitejs.dev/guide/assets.html#the-public-directory) for more info.
