const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gulp = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const del = require('del');
const sass = require('gulp-sass');
const cssbeautify = require('gulp-cssbeautify');
const csscomb = require('gulp-csscomb');
const csso = require('gulp-csso');
const sourcemaps = require('gulp-sourcemaps');
const gcmq = require('gulp-group-css-media-queries');
const imagemin = require('gulp-imagemin');
const htmlBeautify = require('gulp-html-beautify');
const htmlhint = require('gulp-htmlhint');
const sassLint = require('gulp-sass-lint');
const imgRetina = require('gulp-responsive-imgz');
const eslint = require('gulp-eslint');
const browserSync = require('browser-sync').create();

//----------#OPTIONS WITH HTMLBEAUTIFY PLUGIN
//all options https://www.npmjs.com/package/gulp-html-beautify
const htmlBeautifyOptions = {
  //indent tabs
  "indent_with_tabs": false,
  //maximum number of new lines
  "max_preserve_newlines": 0,
  "unformatted": [
    // https://www.w3.org/TR/html5/dom.html#phrasing-content
    'abbr', 'area', 'b', 'bdi', 'bdo', 'br', 'cite',
    'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'ins', 'kbd', 'keygen', 'map', 'mark', 'math', 'meter', 'noscript',
    'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'small',
    'strong', 'sub', 'sup', 'template', 'time', 'u', 'var', 'wbr', 'text',
    'acronym', 'address', 'big', 'dt', 'ins', 'strike', 'tt'
  ]
};

const retinizeOpts = {
  //if you need additional options
  suffix: {
    // 1: '@1x',
    2: '@2x',
    // 3: '@3x'
  }
}

const srcPath = 'src';
const distPath = 'dist';

const basePaths = {
  src: {
    root: `./`,
    sass: `${srcPath}/scss`,
    js: `${srcPath}/js`,
    images: `${srcPath}/img`,
    fonts: `${srcPath}/fonts`,
  },
};

const buildPaths = {
  src: {
    root: `./`,
    dist: `./${distPath}/`,
    css: `${distPath}/css`,
    js: `${distPath}/js`,
    images: `${distPath}/img`,
    fonts: `${distPath}/fonts`,
  },
};

const styleFiles = [
  `${basePaths.src.sass}/**/*.scss`,
  `!${basePaths.src.sass}/scss/vendors/**/*.scss`,
]

const scriptsFiles = [
  `${basePaths.src.js}/**/*.js`,
  `!${basePaths.src.js}/**/*.min.js`,
]

const htmlFiles = [
  `${basePaths.src.root}*.html`,
]

const imgsFiles = [
  `${basePaths.src.images}/**`,
]

gulp.task('styles:dev', () => {
  return gulp.src(styleFiles)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(`${buildPaths.src.css}`))
    .pipe(browserSync.stream())
});

gulp.task('styles:dist', () => {
  return gulp.src(styleFiles)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(gcmq())
    .pipe(csso({
      //Disable or enable a structure optimisations.
      restructure: true,
      //Specify what comments to leave
      comments: true
    }))
    .pipe(cssbeautify())
    .pipe(csscomb())
    .pipe(gulp.dest(`${buildPaths.src.css}`))
    .pipe(browserSync.stream())
});

gulp.task('sass-lint', () => {
  return gulp.src(styleFiles)
    .pipe(
      sassLint({
        configFile: 'sass-lint.yml'
      })
    )
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
});

gulp.task('scripts:dev', () => {
  return gulp.src(scriptsFiles)
    // .pipe(eslint({
    //   configFile: 'eslintrc.json',
    // }))
    // .pipe(eslint.format())
    .pipe(gulp.dest(`${buildPaths.src.js}`))
    .pipe(browserSync.stream());
});

gulp.task('scripts:dist', () => {
  return gulp.src(scriptsFiles)
    .pipe(concat('app.js'))
    .pipe(uglify({
      toplevel: true
    }))
    .pipe(gulp.dest(`${buildPaths.src.js}`))
    .pipe(browserSync.stream());
});

gulp.task('del', () => {
  return del([`'${buildPaths.src.root}'`])
});

gulp.task('img-compress', () => {
  return gulp.src(`${basePaths.src.images}/**/`,)
    .pipe(imagemin({
      progressive: true
  }))
    .pipe(gulp.dest(`${basePaths.src.images}`))
});

gulp.task('html:dev', () => {
  return gulp.src(htmlFiles)
    .pipe(htmlhint('htmlhint.config.js'))
    .pipe(htmlhint.reporter())
    .pipe(imgRetina(retinizeOpts))
    .pipe(gulp.dest(`${buildPaths.src.dist}`))
});

gulp.task('html:dist', () => {
  return gulp.src(htmlFiles)
    .pipe(imgRetina())
    .pipe(htmlBeautify(htmlBeautifyOptions))
    .pipe(gulp.dest(`${buildPaths.src.dist}`))
});

gulp.task('watch', () => {
  browserSync.init({
    server: {
      baseDir: "./",
      index: '01-index.html',
      directory: true,
    }
  });

  gulp.watch(imgsFiles, gulp.series('img-compress'))
  gulp.watch(styleFiles, gulp.series('styles:dev'))
  gulp.watch(styleFiles, gulp.series('styles:dist'))
  gulp.watch(styleFiles, gulp.series('sass-lint'))
  gulp.watch(scriptsFiles, gulp.series('scripts:dev'))
  gulp.watch(scriptsFiles, gulp.series('scripts:dist'))
  gulp.watch(htmlFiles, gulp.series('html:dev'))
  gulp.watch(htmlFiles, gulp.series('html:dist'))
  gulp.watch(htmlFiles).on('change', browserSync.reload)
});


gulp.task('default', gulp.series('del', gulp.parallel('styles:dev', 'sass-lint', 'html:dev', 'scripts:dev', 'img-compress'), 'watch'));
gulp.task('dist', gulp.series('del', gulp.parallel('styles:dist', 'html:dist', 'scripts:dist', 'img-compress'), 'watch'));
