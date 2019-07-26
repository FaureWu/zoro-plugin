const gulp = require('gulp');
const replace = require('gulp-replace-string');

const plugins = ['loading', 'mixin', 'perf'];

const source = plugins.map(name => `./src/typing/${name}.d.ts`)

gulp.task('copy:type', function() {
  return gulp
    .src(source)
    .pipe(gulp.dest('./dist/'))
})
