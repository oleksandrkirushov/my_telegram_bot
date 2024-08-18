import  gulp from 'gulp';
import { deleteAsync } from 'del';

// Очищення папки dist
gulp.task('clean', () => {
  return deleteAsync(['dist/**', '!dist']);
});

// Копіювання файлів з src до dist
gulp.task('copy', () => {
  return gulp.src('src/**/*')
    .pipe(gulp.dest('dist'));
});

// Таска build, яка спочатку очищає папку dist, а потім копіює файли
gulp.task('build', gulp.series('clean', 'copy'));
