
;(function(){
    'use strict';

    var _src = {
        scss: './src/assets/sass/**/*.scss',
        otherassets: [
            './src/index.html',
            './src/assets/images/**/*',
            './src/assets/js/**/*',
            './src/config/**/*'
        ],
        common: '../common/**/*'
    };

    var gulp = require('gulp'),
        sass = require('gulp-sass'),
        del = require('del'),
        runSequence = require('run-sequence');

    gulp.task('build:css', function() {
        return gulp
            .src(_src.scss)
            .pipe(sass()) // Converts Sass to CSS with gulp-sass
            .pipe(gulp.dest('./build/assets/css/'));
    });

    gulp.task('build:other', function () {
        // build fonts, images, js, localization, html
        return gulp
            .src(_src.otherassets, { base: './src' })
            .pipe(gulp.dest('./build'));
    });

    gulp.task('build:common', function () {
        return gulp
            .src(_src.common, { base: '../common' })
            .pipe(gulp.dest('./build'));
    });

    gulp.task('build:all', [
        'build:css',
        'build:other',
        'build:common'
    ]);

    gulp.task('build', ['clean'], function(cb) {
        runSequence('build:all', cb);
    });

    gulp.task('watch', ['build'], function() {
        gulp.watch(_src.scss, ['build:css']);
    });

    gulp.task('default', ['build']);

    gulp.task('clean', function(cb) {
        del('./build', function(err, deletedFiles) {
            console.log('Files deleted : ' + deletedFiles.join(','));
            cb();
        });
    });

})();
