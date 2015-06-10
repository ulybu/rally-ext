var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  notify = require('gulp-notify'),
  copy = require('gulp-copy'),
  zip = require('gulp-zip'),
  sync = require('gulp-config-sync'),
  del = require('del')
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
gulp.task('sync-packages', function() {
  return gulp.src(['bower.json', 'package.json'])
    .pipe(sync(syncOptions))
    .pipe(gulp.dest('.'))
})
gulp.task('clean',function(cb) {
  del(['build',zipName], cb);
})
gulp.task('copy-non-minified', ['clean'], function() {
  return gulp.src(['manifest.json','icons/*', 'css/*'])
    .pipe(copy('build'));
})
gulp.task('compress', ['clean'], function() {
  return gulp.src('js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
})
gulp.task('zip', ['build'], function() {
  return gulp.src('build/**')
    .pipe(zip(zipName))
    .pipe(gulp.dest('.'));
})
gulp.task('build', ['compress','copy-non-minified']);
gulp.task('default',['build']);
