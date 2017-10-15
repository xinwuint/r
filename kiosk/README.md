# Ryder Main App

## Install prerequisite

- Install NPM (Node Package Manager)
- Enter folder 'kiosk'
- Execute 'npm install'

## Compile scss files

- Execute 'gulp sass' to compile scss files.
- Execute 'gulp' to execute a gulp's watch daemon that will auto compile (and minify) scss files.

All Gulp task can be located at gulpfile.js, and they currently are:
- 'gulp build:css'      <- Compile/minify scss files one time only.
- 'gulp build'      	<- Build project (right now only css files).
- 'gulp watch'          <- Watch for modifications and build automatically.
- 'gulp'                <- Equivalent to 'gulp build'.

Compilation errors can be found on console.
