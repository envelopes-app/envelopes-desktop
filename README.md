Below you will find some information on how to perform common tasks.  

## Getting development environment up and running
- Do `npm install` to get all the dependencies
- Run `npm run rebuild-modules`
- Run `npm start` and wait for the compilation to finish and webpack dev server to start
- In another terminal, run `npm run start-electron` to launch the electron app. 

With the above, you get hot reloading of the react app in the electron container.


## Building the Installer
- Run `npm run transpile`
- Run `npm run build-installer`
If you are on macOS, this will build the .dmg package in the dist folder. On windows, this will build the installer executable.
