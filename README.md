
# ![32x32](https://github.com/McKpol/ArcRun/assets/104125769/449841d4-7e0d-42ac-ae74-4cd9763a6221) ArcRun by McKpl

ArcRun is swift, safe searchbar with smooth and great desing. 
![image](https://github.com/McKpol/ArcRun/assets/104125769/d3a8b93f-b106-43bb-b4e3-616d140e7898)      

> [!WARNING]
> Program is still in early development and it need so much to improve.

## Things to improve

### front end
- [ ] Add settings window
- [ ] Add all results window

### settings
- [ ] Add more themes
- [ ] Add custom hotkey
- [ ] Add replace Windows/Superkey hotkey 

### search engine
- [ ] Add queue to the search (don't wait for searching all the cache to give the results)
- [ ] Add more folders to search
- [ ] Add multithreading to backend

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

## Assets license

### MIT

renovate[bot] - https://github.com/tauri-apps/plugins-workspace/tree/v1/plugins/single-instance   
Jackhenry Design - https://www.svgrepo.com/svg/453347/folder   
Will Kelly - https://www.svgrepo.com/svg/491270/loading-spinner

### CC Attribution

Konstantin Filatov - https://www.svgrepo.com/svg/521481/arrow-prev-small

krystonschwarze   
https://www.svgrepo.com/svg/511219/window-code-block    
https://www.svgrepo.com/svg/511031/info   
https://www.svgrepo.com/svg/510998/folder    
https://www.svgrepo.com/svg/511114/remove-minus    
https://www.svgrepo.com/svg/510922/close-sm

@xKotelek thanks for help.

## License
MIT License

Copyright (c) 2024 McKpol
