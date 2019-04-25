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
	js: {
		base: ["src/scripts/base/masterLib.js", "src/scripts/base/*.js"],
		home: ["src/scripts/home.js"]
	},
	modules: ["src/scripts/modules/*"]
};

let output = {
	js: 'public/js',
	sass: 'public/css',
	staticFiles: 'public/static'
};

gulp.task('staticFiles', () => gulp.src(input.staticFiles).pipe(gulp.dest(output.staticFiles)));

gulp.task('dot', () => Render.compileTemplates());

gulp.task("js", () => {
	for (let inputName in input.js) {
		let stream = gulp.src(input.js[inputName])

		if (process.env.NODE_ENV == "production") {
			stream = stream.pipe(minify().on('error', console.log))
		}

		stream = stream
			.pipe(concat(`${inputName}.js`))
			.pipe(gulp.dest(output.js))
	}
});

gulp.task("modules", () => {
	for (let inputSrc of input.modules) {
		gulp.src(inputSrc)
			.pipe(minify().on('error', console.log))
			.pipe(gulp.dest(output.js))
	}
});

gulp.task('sass', () => {
	return gulp.src(input.sass)
		.pipe(sass().on('error', sass.logError))
		.pipe(cleanCSS({debug: 'development'}, details => {
			console.log(details.name + ': ' + details.stats.originalSize + ' -> ' + details.stats.minifiedSize);
		}))
		.pipe(gulp.dest(output.sass));
});

gulp.task('watch', () => {
	watch(input.dot, () => gulp.start('dot'));
	watch(input.sass, () => gulp.start('sass'));

	for (let inputName in input.js) {
		watch(input.js[inputName], () => gulp.start("js"))
	}

	watch(input.modules, () => gulp.start("modules"))	
});

gulp.task('default', ['dot', 'js', 'sass', 'staticFiles', "modules"]);
