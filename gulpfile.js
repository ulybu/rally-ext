var gulp = require('gulp'),
  merge = require('merge-stream'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  notify = require('gulp-notify'),
  copy = require('gulp-copy'),
  zip = require('gulp-zip'),
  sync = require('gulp-config-sync'),
  less = require('gulp-less'),
  del = require('del'),
  insert = require('gulp-insert')
  ;
var zipName = 'rally-ext.zip';
var syncOptions = {
  src: 'manifest.json',
  fields: [
    'version',
    'description'
  ],
  space: '  ',
};

gulp.task('sync-package-files', function() {
  return gulp.src(['bower.json', 'package.json'])
    .pipe(sync(syncOptions))
    .pipe(gulp.dest('.'))
})
gulp.task('clean',function(cb) {
  del(['build',zipName], cb);
})
gulp.task('copy-non-minified', ['clean'], function() {
  return gulp.src(['manifest.json','icons/*',"src/shared/*.js"])
    .pipe(copy('build'));
})
gulp.task('build-injection', ['clean'], function() {
  var js = gulp.src('src/injection/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/src/injection'));
  var css =  gulp.src(['src/injection/*.css'])
    .pipe(copy('build'));
    return merge(js,css);
});
gulp.task('build-options', ['clean'], function() {
  var js = gulp.src('src/options/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/src/options'));
  var html = gulp.src('src/options/options.html')
    .pipe(copy('build'));
  var merged =  merge(js,html);
  var css = gulp.src('src/options/*.less')
    .pipe(less( {  paths: ['.'] }))
    .pipe(gulp.dest('build/src/options'));
  merged.add(css);
  return merged;
});
gulp.task('watch-less', function () {
    gulp.watch('src/**/*.less', ['less-dev']);
});
gulp.task('less-dev', function () {
  var header = "/* This file is build with less. Don't modify it, changes will be overriden.\n"
    + "Instead modify the matching .less file. */\n";
  return gulp.src('src/**/*.less')
    .pipe(less( {  paths: ['.'] }))
    .pipe(insert.prepend(header))
    .pipe(gulp.dest('src'));
});
gulp.task('zip', ['build'], function() {
  return gulp.src('build/**')
    .pipe(zip(zipName))
    .pipe(gulp.dest('.'));
})
gulp.task('build', ['build-injection','build-options','copy-non-minified']);
gulp.task('default',['build']);
