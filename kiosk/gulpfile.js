
;(function(){
	'use strict';

	var gulp = require('gulp'),
        sass = require('gulp-sass'),
        del = require('del');

	gulp.task('build:css', function() {
        return gulp.src('./assets/sass/**/*.scss')
            .pipe(sass()) // Converts Sass to CSS with gulp-sass
            .pipe(gulp.dest('./build/assets/css/'))
            .pipe(gulp.dest('./assets/css/'));
	});

    gulp.task('build:other', function () {
        // build fonts, images, js, localization, html
        return gulp
            .src([
                './index.html',
                './assets/fonts/**/*',
                './assets/images/**/*',
                './assets/js/**/*',
                './assets/localization/**/*',
                './config/**/*', 
                './content/**/*'
            ], { base: './' })
            .pipe(gulp.dest('./build'));
    });

	gulp.task('build', [
		'build:css',
        'build:other'
	]);

	gulp.task('watch', ['build'], function() {
	    gulp.watch('./assets/sass/**/*.scss', ['build:css']);
	});

	gulp.task('default', ['build']);

    gulp.task('clean', function () {
        return del('./build', function (err, deletedFiles) {
            console.log('Files deleted : ' + deletedFiles.join(','));
        });
    });

})();
