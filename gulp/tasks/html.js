import gulp from 'gulp';
import fileInclude from 'gulp-file-include';
import htmlMin from 'gulp-htmlmin';
import htmlBeautify from 'gulp-html-beautify';

import { plugins } from '../config/plugins.js';
import { filePaths } from '../config/paths.js';
import { logger } from "../config/logger.js";

const html = (isBuild, serverInstance) => {
  return gulp.src(filePaths.src.html)
    .pipe(logger.handleError('HTML'))
    .pipe(fileInclude())
    .pipe(plugins.replace(/<img(?:.|\n|\r)*?>/g, function(match) {
				return match.replace(/\r?\n|\r/g, '').replace(/\s{2,}/g, ' ');
			}))
    .pipe(plugins.replace(/(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(icons|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
				'$1./$4$5$7$1'))

    .pipe(
      htmlMin({
        useShortDoctype: true,
        sortClassName: true,
        removeComments: isBuild,       
        collapseWhitespace: isBuild,
      })
    )   
    .pipe(htmlBeautify({ 
      indent_size: 4,
      preserve_newlines: true,
    }))
    .pipe(gulp.dest(filePaths.buildFolder))
    .pipe(serverInstance.stream());
};

export { html };
