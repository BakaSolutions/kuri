const gulp = require("gulp")
const cleanCSS = require("gulp-clean-css")
const sass = require("gulp-sass")
const watch = require("gulp-watch")
const minify = require("gulp-babel-minify")
const concat = require("gulp-concat")
const Render = require("./app/helpers/render")

let input = {
	dot: ["src/views/**/*.@(jst|def|dot)", "custom/src/views/**/*.@(jst|def|dot)"],
	sass: ["src/stylesheets/*.?(s)css", "custom/src/stylesheets/*.?(s)css"],
	static: ["src/static/**/*"],
	js: {
		base: ["src/scripts/base/*"],
		home: ["src/scripts/home.js"],
		modules: ["src/scripts/modules/*"]
	}
}

let output = {
	js: "public/js",
	sass: "public/css",
	static: "public/static"
}

gulp.task("static", () => {
	return gulp.src(input.static)
		.pipe(gulp.dest(output.static))
})

gulp.task("dot", () => {
	return Render.compileTemplates()
})

gulp.task("baseJS", () => {
	let stream = gulp.src(input.js.base)

	if (process.env.NODE_ENV == "production") {
		stream = stream.pipe(minify().on("error", console.log))
	}

	return stream
		.pipe(concat("base.js"))
		.pipe(gulp.dest(output.js))
})

gulp.task("homeJS", () => {
	let stream = gulp.src(input.js.home)

	if (process.env.NODE_ENV == "production") {
		stream = stream.pipe(minify().on("error", console.log))
	}

	return stream
		.pipe(concat("home.js"))
		.pipe(gulp.dest(output.js))
})

gulp.task("modulesJS", () => {
	let stream = gulp.src(input.js.modules)

	if (process.env.NODE_ENV == "production") {
		stream = stream.pipe(minify().on("error", console.log))
	}

	return stream
		.pipe(gulp.dest(output.js))
})

gulp.task("sass", () => {
	return gulp.src(input.sass)
		.pipe(sass().on("error", sass.logError))
		.pipe(cleanCSS({debug: "development"}, details => {
			console.log(details.name + ": " + details.stats.originalSize + " -> " + details.stats.minifiedSize)
		}))
		.pipe(gulp.dest(output.sass))
})

gulp.task("watch", () => {
	watch(input.dot, () => gulp.start("dot"))
	watch(input.sass, () => gulp.start("sass"))

	for (let inputName in input.js) {
		watch(input.js[inputName], () => gulp.start("js"))
	}

	watch(input.modules, () => gulp.start("modules"))	
})

gulp.task("default", gulp.parallel(["dot", "baseJS", "homeJS", "sass", "static", "modulesJS"]))
