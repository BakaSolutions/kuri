const gulp = require("gulp")
const cleanCSS = require("gulp-clean-css")
const gulpSASS = require("gulp-sass")(require("node-sass"))
const Render = require("./app/helpers/render")

const input = {
	dot: ["src/views/**/*.@(jst|def|dot)", "custom/src/views/**/*.@(jst|def|dot)"],
	sass: ["src/stylesheets/*.?(s)css", "custom/src/stylesheets/*.?(s)css"],
	static: ["src/static/**/*"],
}

const output = {
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
})

gulp.task("build", gulp.parallel(dot, sass, static))
