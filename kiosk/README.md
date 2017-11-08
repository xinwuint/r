# Ryder Main App

## Install prerequisite

- Install NPM (Node Package Manager)
- Enter root folder
- Execute 'npm install'

## Compile and build

All Gulp task can be located at gulpfile.js, and they currently are:
- 'gulp build:css'      <- Compile/minify scss files one time only.
- 'gulp build'      	<- Build project and create folder 'build'.
- 'gulp clean'      	<- Remove folder 'build'.
- 'gulp watch'          <- Watch for modifications and build automatically.
- 'gulp'                <- Equivalent to 'gulp build'.

Compilation errors can be found on console.
