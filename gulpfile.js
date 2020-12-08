var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');

function watch() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  gulp.watch("./scss/**/*.scss", gulp.series('style'));
  gulp.watch("./*.html").on('change', browserSync.reload);
}

function style() {
  return gulp.src("./scss/global.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest("./css"))
    .pipe(browserSync.stream());
}

exports.style = style;
exports.watch = watch;
