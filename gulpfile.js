const gulp = require("gulp")
const cleanCSS = require("gulp-clean-css")
const gulpSASS = require("gulp-sass")
const gulpBabelMinify = require("gulp-babel-minify")
const gulpConcat = require("gulp-concat")
const Render = require("./app/helpers/render")

const input = {
	dot: ["src/views/**/*.@(jst|def|dot)", "custom/src/views/**/*.@(jst|def|dot)"],
	sass: ["src/stylesheets/*.?(s)css", "custom/src/stylesheets/*.?(s)css"],
	static: ["src/static/**/*"],
	baseJS: ["src/scripts/base/*"],
	homeJS: ["src/scripts/home/*"],
	modulesJS: ["src/scripts/modules/*"],
}

const output = {
	js: "public/js",
	sass: "public/css",
	static: "public/static",
}

function static() {
	return gulp.src(input.static)
		.pipe(gulp.dest(output.static))
}

function dot() {
	return Render.compileTemplates()
}

function baseJS() {
	let stream = gulp.src(input.baseJS)

	if (process.env.NODE_ENV == "production") {
		stream = stream.pipe(gulpBabelMinify().on("error", console.log))
	}

	return stream
		.pipe(gulpConcat("base.js"))
		.pipe(gulp.dest(output.js))
}

function homeJS() {
	let stream = gulp.src(input.homeJS)

	if (process.env.NODE_ENV == "production") {
		stream = stream.pipe(gulpBabelMinify().on("error", console.log))
	}

	return stream
		.pipe(gulpConcat("home.js"))
		.pipe(gulp.dest(output.js))
}

function modulesJS() {
	let stream = gulp.src(input.modulesJS)

	if (process.env.NODE_ENV == "production") {
		stream = stream.pipe(gulpBabelMinify().on("error", console.log))
	}

	return stream
		.pipe(gulp.dest(output.js))
}

function sass() {
	return gulp.src(input.sass)
		.pipe(gulpSASS().on("error", gulpSASS.logError))
		.pipe(cleanCSS({debug: "development"}, details => {
			console.log(`${details.name}: ${details.stats.originalSize} -> ${details.stats.minifiedSize}`)
		}))
		.pipe(gulp.dest(output.sass))
}

gulp.task("watch", () => {
	gulp.watch(input.dot, dot)
	gulp.watch(input.sass, sass)
	gulp.watch(input.static, static)
	gulp.watch(input.baseJS, baseJS)
	gulp.watch(input.homeJS, homeJS)
	gulp.watch(input.modulesJS, modulesJS)
})

gulp.task("build", gulp.parallel(dot, baseJS, homeJS, modulesJS, sass, static))
