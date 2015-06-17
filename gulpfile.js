var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  notify = require('gulp-notify'),
  copy = require('gulp-copy'),
  zip = require('gulp-zip'),
  sync = require('gulp-config-sync'),
  del = require('del'),
  polybuild = require('polybuild')
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

gulp.task('build-wc', ['clean'], function() {
  return gulp.src('src/options/index.html')
  .pipe(polybuild({
    maximumCrush: true
  }))
  .pipe(gulp.dest('build/src/options'))
;
});
gulp.task('rename-wc', ['build-wc'], function() {
  return gulp.src('build/src/options/index.build.html')
  .pipe(rename("build/src/options/index.html"))
  .pipe(gulp.dest('.'))
;
});

gulp.task('sync-packages', function() {
  return gulp.src(['bower.json', 'package.json'])
    .pipe(sync(syncOptions))
    .pipe(gulp.dest('.'))
})
gulp.task('clean',function(cb) {
  del(['build',zipName], cb);
})
gulp.task('copy-non-minified', ['clean'], function() {
  return gulp.src(['manifest.json','icons/*', 'src/injection/*.css'])
    .pipe(copy('build'));
})
gulp.task('build-injection', ['clean'], function() {
  return gulp.src('src/injection/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/src/injection'));
})
gulp.task('zip', ['build'], function() {
  return gulp.src('build/**')
    .pipe(zip(zipName))
    .pipe(gulp.dest('.'));
})
gulp.task('build', ['build-injection','copy-non-minified','build-wc','rename-wc']);
gulp.task('default',['build']);
