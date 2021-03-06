var gulp = require("gulp");
var del = require("del");
var ts = require("gulp-typescript");
var merge = require('merge2');

var tsProject = ts.createProject("tsconfig.json", {
    declaration: true
});

gulp.task("clean", function() {
    return del(["dist/**/*", "!dist/.keep"]);
});

gulp.task("default", function() {
    let tsResult = tsProject.src()
        .pipe(tsProject());
    return merge([
        tsResult.js.pipe(gulp.dest("dist")),
        tsResult.dts.pipe(gulp.dest("dist/typings"))
    ]);
});
