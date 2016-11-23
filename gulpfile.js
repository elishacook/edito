'use strict'

var browserify = require('browserify'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    gutil = require('gulp-util')

gulp.task('build', function ()
{
    return browserify(
        {
            entries: './src/index.js',
            debug: true,
            bundleExternal: true,
            standalone: 'edito'
        })
        .bundle()
        .pipe(source('edito.min.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./build/'))
})

gulp.task('build-dev', function ()
{
    return browserify(
        {
            entries: './src/index.js',
            debug: true,
            bundleExternal: true,
            standalone: 'edito'
        })
        .bundle()
        .pipe(source('edito.js'))
        .pipe(gulp.dest('./build/'))
})

gulp.task('watch', ['build'], function ()
{
    gulp.watch(['src/**/*.js'], ['build'])
})

gulp.task('watch-dev', ['build-dev'], function ()
{
    gulp.watch(['src/**/*.js'], ['build-dev'])
})

gulp.task('default', ['build'])