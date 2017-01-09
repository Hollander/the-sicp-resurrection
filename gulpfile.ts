/// <reference path="src/typings/main.d.ts" />

import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as typescript from 'typescript';
import * as sourcemaps from 'gulp-sourcemaps';
import {AddMethodCallback} from "~gulp~orchestrator/orchestrator";

task('compile', () => {
    return tsc('./src/tsconfig.json', './dist');
});

function tsc(project: string, dest: string): NodeJS.ReadWriteStream {
    var tsProject = ts.createProject(project, { typescript: typescript });

    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject, {}, reporter()));

    var res = tsResult.js;

    return res.pipe(sourcemaps.write())
        .pipe(gulp.dest(dest));
}

function task(name: string, deps: Function[] | Function, fn: AddMethodCallback = null) {
    if (fn == null) {
        fn = <AddMethodCallback><any>deps;
        deps = [];
    } else if (!Array.isArray(deps)) {
        deps = [<Function>deps];
    }

    var arr = <Function[]>deps;
    if (name) {
        fn['customName'] = name;
    }
    gulp.task(fn['customName'] || fn['name'], arr.map((f) => f['customName'] || f['name']), fn);
    return fn;
}

function reporter() {
    var gutil = require('gulp-util');

    function defaultFinishHandler(results:any) {
        var hasError = false;
        var showErrorCount = function (count:number, type:string) {
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

    function flattenDiagnosticsVerbose(message:any, index?:number):any {
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
            var result:any = void 0;
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
        error: function (error:any) {
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