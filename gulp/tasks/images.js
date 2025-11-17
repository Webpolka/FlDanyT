import gulp from 'gulp';
// import imageMin from 'gulp-imagemin';

import { plugins } from '../config/plugins.js';
import { filePaths } from '../config/paths.js';
import { logger } from "../config/logger.js";

const images = (isBuild, serverInstance) => {
  return gulp.src(filePaths.src.images)
    .pipe(logger.handleError('IMAGES'))
    .pipe(plugins.newer(filePaths.build.images))  
    .pipe(plugins.if(isBuild, gulp.dest(filePaths.build.images)))
    .pipe(plugins.if(isBuild, gulp.src(filePaths.src.images)))
    .pipe(plugins.if(isBuild, plugins.newer(filePaths.build.images)))
    // .pipe(imageMin({
    //       progressive: true,
    //       svgoPlugins: [{ removeViewBox: false }],
    //       interlaced: true,
    //       optimizationLevel: 4, // 0 to 7
    //     })
    //   )
    .pipe(gulp.dest(filePaths.build.images))   
    .pipe(serverInstance.stream());
};

export { images };