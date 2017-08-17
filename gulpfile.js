const gulp = require('gulp');
const cached = require('gulp-cached');
const remember = require('gulp-remember');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const watch = require('gulp-watch');

const Templating = require('./app/core/templating');

const isDev = process.env.NODE_ENV !== 'production';

let tasks = {
  development: ['dot', 'sass', 'js', 'watch'],
  production: ['sass', 'js']
};

let input = {
  dot:  ['src/views/**/*.@(jst|def|dot)', 'custom/src/views/**/*.@(jst|def|dot)'],
  js:   ['src/js/**/*.js', 'custom/src/js/**/*.js'],
  sass: ['src/css/**/*.?(s|)css', 'custom/src/css/**/*.?(s|)css'],
};

let output = {
  js:  'public/js',
  sass: 'public/css'
};

gulp.task('dot', buildDot.bind(this));
gulp.task('js', buildJS.bind(this));
gulp.task('sass', buildSass.bind(this));
gulp.task('watch', watchTask.bind(this));
gulp.task('default', tasks[process.env.NODE_ENV || 'development']);

function buildDot() {
  return Templating.compileTemplates();
}

function buildJS() {
  return gulp.src(input.js)
      .pipe(cached('js'))
      .pipe(uglify())
      .pipe(remember('js'))
      .pipe(gulp.dest(output.js));
}

function buildSass() {
  return gulp.src(input.sass)
      .pipe(cached('sass'))
      .pipe(sass().on('error', sass.logError))
      .pipe(cleanCSS({debug: isDev}, function(details) {
        console.log(details.name + ': ' + details.stats.originalSize + ' -> ' + details.stats.minifiedSize);
      }))
      .pipe(remember('sass'))
      .pipe(gulp.dest(output.sass));
}

function watchTask() {
  watch(input.dot, () => gulp.start('dot'));
  watch(input.js, () => gulp.start('js'));
  watch(input.sass, () => gulp.start('sass'));
}
