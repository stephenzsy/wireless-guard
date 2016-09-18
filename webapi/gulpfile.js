var gulp = require("gulp");
var del = require("del");
var ts = require("gulp-typescript");
var merge = require('merge2');

var tsProject = ts.createProject("tsconfig.json", {
    declaration: true,
    rootDir: "."
});

gulp.task("clean", function() {
    return del(["dist/**/*", "!dist/.keep"]);
});

gulp.task("models", function() {
 return  gulp.src('common/models/*.json')
    .pipe(gulp.dest('dist/common/models'));
})

gulp.task("default", function() {
    let tsResult = tsProject.src()
        .pipe(ts(tsProject));
    return merge([
        tsResult.js.pipe(gulp.dest("dist")),
        tsResult.dts.pipe(gulp.dest("dist/typings"))
    ]);
});

gulp.task("all", ["models", "default"]);
