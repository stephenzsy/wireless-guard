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

gulp.task("copy-bin", function () {
    return gulp.src("bin/*")
        .pipe(gulp.dest("dist/bin"));

});

gulp.task("default", ["copy-bin"], function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});
