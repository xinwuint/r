
;(function(){
    'use strict';

    var gulp = require('gulp'),
        del = require('del'),
        execSync = require('child_process').execSync,
        runSequence = require('run-sequence');

    gulp.task('build:all', function(cb) {
        console.log('building kiosk ...');
        execSync('gulp build --cwd ./kiosk');

        console.log('building videosite ...');
        execSync('gulp build --cwd ./videosite');

        cb();
    });

    gulp.task('publish:kiosk', function () {
        return gulp
            .src('./kiosk/build/**/*', { base: './kiosk/build' })
            .pipe(gulp.dest('./publish/kiosk'));
    });

    gulp.task('publish:videosite', function () {
        return gulp
            .src('./videosite/build/**/*', { base: './videosite/build' })
            .pipe(gulp.dest('./publish/videosite'));
    });

    gulp.task('publish', ['clean'], function (cb) {
        runSequence('build:all',
        			['publish:kiosk', 'publish:videosite'],
        			cb);
    });

    gulp.task('clean', function (cb) {
        del('./publish', function (err, deletedFiles) {
            console.log('Files deleted : ' + deletedFiles.join(','));
            cb();
        });
    });

})();
