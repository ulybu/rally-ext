var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  notify = require('gulp-notify'),
  copy = require('gulp-copy'),
  zip = require('gulp-zip'),
  sync = require('gulp-config-sync'),
  del = require('del'),
  ;
var zipName = 'rally-ext.zip';
var syncOptions = {
  src: 'manifest.json',
  fields: [
    'name',
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
  return gulp.src(['manifest.json','icons/*', 'src/injection/*.css',"src/shared/*.js", 'src/options/options.html'])
    .pipe(copy('build'));
})
gulp.task('build-injection', ['clean'], function() {
  return gulp.src('src/injection/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/src/injection'));
});
gulp.task('build-options', ['clean'], function() {
  return gulp.src('src/options/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/src/options'));
});
gulp.task('zip', ['build'], function() {
  return gulp.src('build/**')
    .pipe(zip(zipName))
    .pipe(gulp.dest('.'));
})
gulp.task('build', ['build-injection','build-options','copy-non-minified']);
gulp.task('default',['build']);
