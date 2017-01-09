/// <reference path="src/typings/main.d.ts" />
"use strict";
var gulp = require('gulp');
var ts = require('gulp-typescript');
var typescript = require('typescript');
var sourcemaps = require('gulp-sourcemaps');
task('compile', function () {
    return tsc('./src/tsconfig.json', './dist');
});
function tsc(project, dest) {
    var tsProject = ts.createProject(project, { typescript: typescript });
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject, {}, reporter()));
    var res = tsResult.js;
    return res.pipe(sourcemaps.write())
        .pipe(gulp.dest(dest));
}
function task(name, deps, fn) {
    if (fn === void 0) { fn = null; }
    if (fn == null) {
        fn = deps;
        deps = [];
    }
    else if (!Array.isArray(deps)) {
        deps = [deps];
    }
    var arr = deps;
    if (name) {
        fn['customName'] = name;
    }
    gulp.task(fn['customName'] || fn['name'], arr.map(function (f) { return f['customName'] || f['name']; }), fn);
    return fn;
}
function reporter() {
    var gutil = require('gulp-util');
    function defaultFinishHandler(results) {
        var hasError = false;
        var showErrorCount = function (count, type) {
            if (count === 0)
                return;
            gutil.log('TypeScript:', gutil.colors.magenta(count.toString()), (type !== '' ? type + ' ' : '') + (count === 1 ? 'error' : 'errors'));
            hasError = true;
        };
        showErrorCount(results.transpileErrors, '');
        showErrorCount(results.syntaxErrors, 'syntax');
        showErrorCount(results.globalErrors, 'global');
        showErrorCount(results.semanticErrors, 'semantic');
        showErrorCount(results.emitErrors, 'emit');
        if (results.emitSkipped) {
            gutil.log('TypeScript: emit', gutil.colors.red('failed'));
            process.exit(1);
        }
        else if (hasError) {
            gutil.log('TypeScript: emit', gutil.colors.cyan('succeeded'), '(with errors)');
        }
    }
    function flattenDiagnosticsVerbose(message, index) {
        if (index === void 0) {
            index = 0;
        }
        if (typeof message === 'undefined') {
            return '';
        }
        else if (typeof message === 'string') {
            return message;
        }
        else {
            var result = void 0;
            if (index === 0) {
                result = message.messageText;
            }
            else {
                result = '\n> TS' + message.code + ' ' + message.messageText;
            }
            return result + flattenDiagnosticsVerbose(message.next, index + 1);
        }
    }
    return {
        error: function (error) {
            if (error.tsFile) {
                console.error(gutil.colors.red(error.fullFilename + '(' + error.startPosition.line + ',' + error.startPosition.character + '): ') + 'error TS' + error.diagnostic.code + ' ' + flattenDiagnosticsVerbose(error.diagnostic.messageText));
            }
            else {
                console.error(error.message);
            }
        },
        finish: defaultFinishHandler
    };
}
//# sourceMappingURL=gulpfile.js.map