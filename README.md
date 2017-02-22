Below you will find information on how to perform common tasks. 

## Getting development environment up and running
- Do `npm install` to get all the dependencies
- Run `npm run rebuild-modules`
- Run `npm start` and wait for the compilation to finish and webpack dev server to start
- In another terminal, run `npm run start-electron` to launch the electron app. 

With the above, you get hot reloading of the react app in the electron container.

## Building the Installer
- Run `npm run build-installer`
If you are on macOS, this will build the DMG package in the dist folder. On windows, this will build the installer executable.

## TODO List
- Clone/Fresh-Start Budget (In Progress)
- Undo/Redo Support
- Transactions Searching
- Income vs Expense Report
- Importing Data from Bank OFX/QFX/QIF files
- Support multiple languages
- Mobile Applications

## Source Code Structure Overview
- The source for the Envelopes app is in the `src` folder. It is a React/Redux app built fully with TypeScript. 
- The source for the Electron container is in the `electron-*` files in the project root. These are written using ES6.
