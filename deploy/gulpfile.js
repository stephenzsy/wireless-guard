var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
import tslint from "gulp-tslint";

gulp.task("default", function () {
    return tsProject.src()
        .pipe(ts(tsProject))
        .pipe(tslint({
            formatter: "verbose"
        }))
        .js.pipe(gulp.dest("dist"));
});
