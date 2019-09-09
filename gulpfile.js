const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const inject = require('gulp-inject');
const gulp = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const gcmq = require('gulp-group-css-media-queries');
const csso = require('gulp-csso');
const del = require('del');
const sass = require('gulp-sass');
const cssbeautify = require('gulp-cssbeautify');
const csscomb = require('gulp-csscomb');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const htmlBeautify = require('gulp-html-beautify');
const htmlhint = require('gulp-htmlhint');
const sassLint = require('gulp-sass-lint');
const imgRetina = require('gulp-responsive-imgz');
const eslint = require('gulp-eslint');
const browserSync = require('browser-sync').create();

const paths = {
  src: 'src/**/*',
  srcHTML: 'src/**/*.html',
  srcSCSS: 'src/**/*.scss',
  srcPathSCSS: 'src/scss/',
  srcJS: 'src/**/*.js',
  srcPathJS: 'src/js/',
  srcIMG: 'src/img/**',
  srcFonts: 'src/fonts/**',
  tmp: 'tmp',
  tmpIndex: 'tmp/index.html',
  tmpSCSS: 'tmp/**/*.scss',
  tmpCSS: 'tmp/css/',
  tmpJS: 'tmp/**/*.js',
  tmpPathIMG: 'tmp/img/',
  tmpPathFonts: 'tmp/fonts/',
  dist: 'dist',
  distIndex: 'dist/index.html',
  distCSS: 'dist/**/*.css',
  distPathCSS: 'dist/css',
  distJS: 'dist/**/*.js',
  distPathJS: 'dist/js',
  distPathIMG: 'dist/img',
  distPathFonts: 'dist/fonts'
};

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

// dev
gulp.task('html:dev', () => {
  return gulp
    .src(paths.srcHTML)
    .pipe(imgRetina(retinizeOpts))
    .pipe(htmlhint('./htmlhint.config.js'))
    .pipe(htmlhint.reporter())
    .pipe(gulp.dest(paths.tmp))
});

const styleFiles = [
  `${paths.srcSCSS}`,
  `!${paths.srcPathSCSS}/vendors/**/*.scss`,
  `!${paths.srcPathSCSS}/_vendor/**/*.scss`,
  `!${paths.srcPathSCSS}/base/_mixins.scss`,
  `!${paths.srcPathSCSS}/base/_forms.scss`,
]

gulp.task('sass-lint', () => {
  return gulp
    .src(styleFiles)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(
      sassLint({
        configFile: 'sass-lint.yml'
      })
    )
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
});

gulp.task('scss:dev', () => {
  return gulp
    .src(paths.srcSCSS)
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
    .pipe(gulp.dest(paths.tmpCSS))
    .pipe(browserSync.stream())
});

// gulp.task('eslint', () => {
//   gulp
//     .src([
//       `${paths.srcPathJS}**/*.js`,
//       '!node_modules/**',
//       `!${paths.srcPathJS}ES5/**/*.js`,
//       `!${paths.srcPathJS}vendors/**/*.js`,
//       `!${paths.srcPathJS}**/*.min.js`
//       `!${paths.srcPathJS}jquery-3.3.1.min.js`
//     ])
//     .pipe(
//       eslint({
//         configFile: './eslintrc.json',
//       })
//     )
//     .pipe(eslint.format());
// });

gulp.task('js:dev', () => {
  return gulp
    .src(paths.srcJS)
    .pipe(gulp.dest(paths.tmp))
    .pipe(browserSync.stream())
});

gulp.task('img-compress', () => {
  return gulp
    .src(paths.srcIMG)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest(paths.tmpPathIMG))
});

gulp.task('fonts-copy', () => {
  return gulp
    .src(paths.srcFonts)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(gulp.dest(paths.tmpPathFonts))
});

gulp.task('copy:dev', gulp.series('html:dev', 'scss:dev', 'sass-lint', 'js:dev', 'img-compress', 'fonts-copy'));

gulp.task('inject:dev', gulp.series('copy:dev'), () => {
  const css = gulp.src(paths.tmpCSS);
  const js = gulp.src(paths.tmpJS);

  return gulp
    .src(paths.distIndex)
    .pipe(inject(css, {
      relative: true
    }))
    .pipe(inject(js, {
      relative: true
    }))
    .pipe(gulp.dest(paths.tmp));
});

// dist
gulp.task('html:dist', () => {
  return gulp
    .src(paths.srcHTML)
    .pipe(imgRetina(retinizeOpts))
    .pipe(htmlBeautify(htmlBeautifyOptions))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('scss:dist', () => {
  return gulp
    .src(paths.srcSCSS)
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
    .pipe(gulp.dest(paths.distPathCSS));
});

gulp.task('js:dist', () => {
  return gulp
    .src(paths.srcJS)
    // .pipe(concat('app.js'))
    .pipe(uglify({
      toplevel: true
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('img-compress:dist', () => {
  return gulp
    .src(paths.srcFonts)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(gulp.dest(paths.distPathFonts))
});

gulp.task('fonts-copy:dist', () => {
  return gulp
    .src(paths.srcIMG)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(gulp.dest(paths.distPathIMG))
});

gulp.task('copy:dist', gulp.series('html:dist', 'scss:dist', 'js:dist', 'img-compress:dist', 'fonts-copy:dist'));

gulp.task('inject:dist', gulp.series('copy:dist'), () => {
  const css = gulp.src(paths.distCSS);
  const js = gulp.src(paths.distJS);

  return gulp
    .src(paths.distIndex)
    .pipe(inject(css, {
      relative: true
    }))
    .pipe(inject(js, {
      relative: true
    }))
    .pipe(gulp.dest(paths.dist));
});

const delFiles = [
  `${paths.tmp}`,
  // `${paths.dist}`,
]

gulp.task('clean', () => {
  return del(delFiles);
});

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

gulp.task('watch', () => {
  browserSync.init({
    server: {
      baseDir: `${paths.tmp}`,
      index: 'index.html',
      directory: true,
    }
  });

  gulp.watch(paths.srcIMG, gulp.series('img-compress'))
  gulp.watch(paths.srcFonts, gulp.series('fonts-copy'))
  gulp.watch(paths.srcSCSS, gulp.series('scss:dev'))
  gulp.watch(paths.srcSCSS, gulp.series('sass-lint'))
  gulp.watch(paths.srcJS, gulp.series('js:dev'))
  gulp.watch(paths.srcHTML, gulp.series('html:dev'))
  gulp.watch(paths.srcHTML).on('change', browserSync.reload)
});

gulp.task('default', gulp.series('inject:dev', 'watch'));
gulp.task('build', gulp.series('inject:dist'));
