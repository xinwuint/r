# Ryder Main App

## Install prerequisite

- Install NPM (Node Package Manager)
- Enter folder 'kiosk'
- Execute 'npm install'

## Comiple sass files

- Execute 'gulp sass' to compile scss files.
- Execute 'gulp' to execute a gulp's watch daemon that will auto compile (and minify) sass files.

All Gulp task can be located at gulpfile.js, and they currently are:
- 'gulp sass'           <- Will compile/minify SCSS files one time only.
- 'gulp watch'          <- Watch for SCSS modifications to compile/minify automatically.
- 'gulp'                <- Same as 'gulp sass'.

Compilation errors can be found on console.
