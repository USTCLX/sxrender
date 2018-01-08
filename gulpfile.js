/**
 * Created by lixiang on 2018/1/7.
 */
const gulp = require('gulp');
const rollup = require('rollup');
const uglify = require('gulp-uglify');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');//使得rollup可以识别node模块
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');

gulp.task('script',function(){
    //rollup 打包js模块
    return rollup.rollup({
        input:'./src/index.js',
        plugins:[
            resolve(),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    }).then(function(bundle){
        bundle.write({
            // 产出文件使用 umd 规范（即兼容 amd cjs amd和 iife）
            format: 'umd',
            // iife 规范下的全局变量名称
            name: 'SXRender',
            // 产出的未压缩的文件名
            file: './release/SXRender.js'
        }).then(function(){
            // 待 rollup 打包 js 完毕之后，再进行如下的处理：
            gulp.src('./release/SXRender.js')
                .pipe(uglify())
                .pipe(rename('SXRender.min.js'))
                .pipe(sourcemaps.write(''))
                .pipe(gulp.dest('./release'))
        })
    })
});

gulp.task('default',function(){
    console.log('watching js modify...');
    gulp.watch('./src/*.js',['script']);
    gulp.watch('./src/*/*.js',['script']);
});