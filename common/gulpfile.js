var gulp = require("gulp");
var del = require("del");
var ts = require("gulp-typescript");
var merge = require('merge2');
var tslint = require("gulp-tslint");

var tsProject = ts.createProject("tsconfig.json", {
    declaration: true
});

gulp.task("clean", function () {
    return del(["dist/**/*", "!dist/.keep"]);
});

gulp.task("copy-dts", function () {
    return gulp.src("src/lib/*.d.ts")
        .pipe(gulp.dest("dist/typings/lib"));
})

gulp.task("default", ["copy-dts"], function () {
    let tsResult = tsProject.src()
        .pipe(tslint())
        .pipe(tsProject());
    return merge([
        tsResult.js.pipe(gulp.dest("dist")),
        tsResult.dts.pipe(gulp.dest("dist/typings"))
    ]);
});
