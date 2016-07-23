var gulp = require("gulp");
var ts = require("gulp-typescript");
var merge = require('merge2');

var tsProject = ts.createProject("tsconfig.json");

gulp.task("default", function() {
    let tsResult = tsProject.src()
        .pipe(ts(tsProject));
    return merge([
        tsResult.js.pipe(gulp.dest("dist")),
        tsResult.dts.pipe(gulp.dest("dist/typings"))
    ]);
});
