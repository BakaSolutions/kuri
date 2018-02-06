const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const watch = require('gulp-watch');
const minify = require("gulp-babel-minify");
const Render = require('./app/render');

let input = {
	dot: ['src/views/**/*.@(jst|def|dot)', 'custom/src/views/**/*.@(jst|def|dot)'],
	js: ['src/scripts/**/*.js', 'custom/src/scripts/**/*.js', '!src/scripts/**/*.min.js', '!custom/src/scripts/**/*.min.js'],
	minjs: ['src/scripts/**/*.min.js', 'custom/src/scripts/**/*.min.js'],
	sass: ['src/stylesheets/**/*.?(s)css', 'custom/src/stylesheets/**/*.?(s)css'],
	staticFiles: ['src/static/**/*'],
	themes: ['src/themes/**/*.json']
};

let output = {
	js: 'public/js',
	sass: 'public/css',
	staticFiles: 'public/static',
	themes: 'public/themes'
};

gulp.task('staticFiles', (() => {
	return gulp.src(input.staticFiles)
		.pipe(gulp.dest(output.staticFiles))
}));

gulp.task('dot', (() => {
	Render.reloadTemplates();
	return Render.compileTemplates();
}));

gulp.task('js', (() => {
	gulp.src(input.minjs)
		.pipe(gulp.dest(output.js));

	return gulp.src(input.js)
		.pipe(minify())
		.pipe(gulp.dest(output.js));
}));

gulp.task('themes', (() => {
	return gulp.src(input.themes)
		.pipe(gulp.dest(output.themes));
}));

gulp.task('sass', (() => {
	return gulp.src(input.sass)
		.pipe(sass().on('error', sass.logError))
		.pipe(cleanCSS({debug: 'development'}, function(details) {
			console.log(details.name + ': ' + details.stats.originalSize + ' -> ' + details.stats.minifiedSize);
		}))
		.pipe(gulp.dest(output.sass));
}));

gulp.task('watch', (() => {
	watch(input.dot, () => gulp.start('dot'));
	watch(input.js, () => gulp.start('js'));
	watch(input.sass, () => gulp.start('sass'));
	watch(input.themes, () => gulp.start('themes'));
}));

gulp.task('default', ['dot', 'js', 'sass', 'staticFiles', 'themes']);
