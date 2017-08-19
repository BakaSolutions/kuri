const gulp = require('gulp');
const cached = require('gulp-cached');
const remember = require('gulp-remember');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const watch = require('gulp-watch');
const minify = require("gulp-babel-minify");
const Templating = require('./app/core/templating');
const concat = require('gulp-concat');

const isDev = process.env.NODE_ENV !== 'production';

let tasks = {
  development: ['dot', 'concat js', 'js', 'sass', 'images', 'fonts', 'watch'],
  production: ['dot', 'concat js', 'js', 'sass', 'images', 'fonts']
};

let input = {
  dot:  ['src/views/**/*.@(jst|def|dot)', 'custom/src/views/**/*.@(jst|def|dot)'],
  js:   ['src/js/**/*.js', 'custom/src/js/**/*.js',
         '!src/js/**/*.min.js', '!custom/src/js/**/*.min.js'],
  minjs:['src/js/**/*.min.js', 'custom/src/js/**/*.min.js'],
  sass: ['src/css/**/*.?(s)css', 'custom/src/css/**/*.?(s)css'],
	images: ['src/images/*'],
  fonts: ['src/fonts/*']
};

let jsBundles = {
  home: ['src/js/draggabilly.pkgd.min.js', 'src/js/master.js', 'src/js/ui.js'],
  board: ['src/js/draggabilly.pkgd.min.js', 'src/js/master.js', 'src/js/ui.js', 'src/js/truncate.js', 'src/js/upload.js']
}

let output = {
  js:  'public/js',
  sass: 'public/css',
	images: 'public/images',
  fonts: 'public/fonts',
};

gulp.task('dot', buildDot.bind(null));
gulp.task('concat js', concatJS.bind(null));
gulp.task('js', buildJS.bind(null));
gulp.task('sass', buildSass.bind(null));
gulp.task('images', copyImages.bind(null));
gulp.task('fonts', copyFonts.bind(null));
gulp.task('watch', watchTask.bind(null));
gulp.task('default', tasks[process.env.NODE_ENV || 'development']);

function copyImages() {
	console.log('Copying pictures from /src to /public')
	return gulp.src(input.images)
		.pipe(gulp.dest(output.images))
}

function copyFonts() {
	console.log('Copying fonts from /src to /public')
	return gulp.src(input.fonts)
		.pipe(gulp.dest(output.fonts))
}

function concatJS() {
  for (var bundle in jsBundles) {
    gulp.src(jsBundles[bundle])
      .pipe(concat(bundle + '.js'))
      .pipe(gulp.dest('./.tmp/js'));
  }
}

function buildDot() {
  return Templating.compileTemplates();
}

function buildJS() {
  return gulp.src(['.tmp/js/*.js'])
    .pipe(cached('js'))
    .pipe(minify())
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
