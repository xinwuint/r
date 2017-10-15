
;(function(){
	'use strict';

	var gulp = require('gulp');
	var sass = require('gulp-sass');

	gulp.task('build:css', function() {
	  return gulp.src('assets/sass/**/*.scss')
	    .pipe(sass()) // Converts Sass to CSS with gulp-sass
	    .pipe(gulp.dest('assets/css/'))
	});

	gulp.task('build', [
		'build:css'
	]);

	gulp.task('watch', ['build'], function() {
	    gulp.watch('./assets/sass/**/*.scss', ['build:css']);
	});

	gulp.task('default', ['build']);

})();
