const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
const watch = require('gulp-watch');
const minify = require('gulp-babel-minify');
const concat = require('gulp-concat');
const Render = require('./app/helpers/render');

let input = {
	dot: ['src/views/**/*.@(jst|def|dot)', 'custom/src/views/**/*.@(jst|def|dot)'],
	minjs: ['src/scripts/**/*.min.js', 'custom/src/scripts/**/*.min.js'],
	sass: ['src/stylesheets/*.?(s)css', 'custom/src/stylesheets/*.?(s)css'],
	staticFiles: ['src/static/**/*'],
	themes: ['src/themes/**/*.json'],
	js: {
		base: ["src/scripts/base/masterLib.js", "src/scripts/base/*.js"],
		home: ["src/scripts/home.js"],
		themes: ["src/scripts/modules/themes.js"],
		quickSave: ["src/scripts/modules/quickSave.js"],
		floatingPosts: ["src/scripts/modules/floatingPosts.js"]
	}
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
	return Render.compileTemplates();
}));

gulp.task("js", (() => {
	for (let inputName in input.js) {
		gulp.src(input.js[inputName])
			.pipe(minify())
			.pipe(concat(`${inputName}.js`))
			.pipe(gulp.dest(output.js))
	}
}));

gulp.task('themes', (() => {
	return gulp.src(input.themes)
		.pipe(gulp.dest(output.themes));
}));

gulp.task('sass', (() => {
	return gulp.src(input.sass)
		.pipe(sass().on('error', sass.logError))
		.pipe(cleanCSS({debug: 'development'}, details => {
			console.log(details.name + ': ' + details.stats.originalSize + ' -> ' + details.stats.minifiedSize);
		}))
		.pipe(gulp.dest(output.sass));
}));

gulp.task('watch', (() => {
	watch(input.dot, () => gulp.start('dot'));
	watch(input.sass, () => gulp.start('sass'));
	watch(input.themes, () => gulp.start('themes'));

	for (let inputName in input.js) {
		watch(input.js[inputName], () => gulp.start("js"))
	}
}));

gulp.task('default', ['dot', 'js', 'sass', 'staticFiles', 'themes']);
