
;(function(){
	'use strict';

	var gulp = require('gulp'),
        sass = require('gulp-sass'),
        del = require('del');

	gulp.task('build:css', function() {
        return gulp.src('./src/assets/sass/**/*.scss')
            .pipe(sass()) // Converts Sass to CSS with gulp-sass
            .pipe(gulp.dest('./build/assets/css/'));
	});

    gulp.task('build:other', function () {
        // build fonts, images, js, localization, html
        return gulp
            .src([
                './src/index.html',
                './src/assets/images/**/*',
                './src/assets/js/**/*',
                './src/config/**/*', 
            ], { base: './src' })
            .pipe(gulp.dest('./build'));
    });

    gulp.task('build:common', function () {
        return gulp
            .src([
                '../common/**/*'
            ], { base: '../common' })
            .pipe(gulp.dest('./build'));
    });

	gulp.task('build', [
		'build:css',
        'build:other',
        'build:common'
	]);

	gulp.task('watch', ['build'], function() {
	    gulp.watch('./src/assets/sass/**/*.scss', ['build:css']);
	});

	gulp.task('default', ['build']);

    gulp.task('clean', function () {
        return del('./build', function (err, deletedFiles) {
            console.log('Files deleted : ' + deletedFiles.join(','));
        });
    });

})();
