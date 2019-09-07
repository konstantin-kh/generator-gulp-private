# How to use:

- Install [Node JS](https://nodejs.org) on your local machine, recommended version (10) should be used

- Install [GULP Js](https://gulpjs.com/) globally - `npm install gulp-cli -g`

- Install [NPM](https://www.npmjs.com/get-npm) globally on your local machine - it could be installed with NODE JS. To check if you have it installed type in the terminal - `npm -v`

- Go to the folder "markup" - open terminal/command prompt

- Type `npm install` or `npm i` - to install all project dependencies

- Available commands:

  - `gulp` - this will compile the entire project into development mode, start browserSync on localhost and will watch all the changes to the SCSS, html, images etc.
  - `gulp dist`- this is used to compile project assets into production.

  - **_NOTE:_** by default - we have an [extended](https://github.com/sass/node-sass#outputstyle) version of compiled CSS both in dev and prod mode.

### **IMPORTANT:**

If you are facing some troubles while installing build on your machine, please make sure that you have a correct version of the NODE JS.
To check the version - open terminal and type: `node -v` . It should be 10+ (maybe 8 is okay, but 6 is old, there is no support for node 6 in some modules that are used).
