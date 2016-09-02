var gulp = require("gulp");
var del = require("del");
var ts = require("gulp-typescript");
var merge = require('merge2');
var tslint = require("gulp-tslint");

var tsProject = ts.createProject("tsconfig.json", {
    declaration: true
});

gulp.task("clean", function() {
    return del(["dist/**/*", "!dist/.keep"]);
});

gulp.task("default", function () {
    return tsProject.src()
        .pipe(ts(tsProject))
        .js.pipe(gulp.dest("dist"));
});
