
;(function(){
	'use strict';

    var _src = {
        otherassets: [
            './src/index.html',
            './src/assets/images/**/*',
            './src/js/**/*',
            './src/css/**/*',
            '!./src/css/**/*.scss',
            '!./src/css/**/*.less',
            '!./src/css/**/*.map',
            './src/config/**/*'
        ],
        common: '../common/**/*'
    };

	var gulp = require('gulp'),
        sass = require('gulp-sass'),
        del = require('del'),
        runSequence = require('run-sequence');

    gulp.task('build:other', function () {
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
        'build:other',
        'build:common'
	]);

    gulp.task('build', ['clean'], function(cb) {
        runSequence('build:all', cb);
    });

	gulp.task('default', ['build']);

    gulp.task('clean', function(cb) {
        del('./build', function(err, deletedFiles) {
            console.log('Files deleted : ' + deletedFiles.join(','));
            cb();
        });
    });

})();
