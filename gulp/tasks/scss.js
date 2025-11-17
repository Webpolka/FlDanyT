import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import sassGlob from "gulp-sass-glob";
import rename from "gulp-rename";
import autoprefixer from "autoprefixer";
import postcss from "gulp-postcss";
import postcssGroupMedia from "postcss-sort-media-queries";
import sourcemaps from "gulp-sourcemaps";

import pxtorem from "postcss-pxtorem";

import { filePaths } from "../config/paths.js";
import { plugins } from "../config/plugins.js";
import { logger } from "../config/logger.js";

const sass = gulpSass(dartSass);

const scss = (isBuild, serverInstance) => {
	return (
		gulp
			.src(filePaths.src.scss)
			.pipe(logger.handleError("SCSS"))

			.pipe(plugins.if(!isBuild, sourcemaps.init()))
			.pipe(sassGlob())
			.pipe(sass({ outputStyle: "expanded" }, null))
			.pipe(
				plugins.replace(
					/(['"]?)(\.\.\/)+(icons|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
					"$1$2$3$4$6$1"
				)
			)

			.pipe(
				plugins.if(
					!isBuild,
					postcss([
						autoprefixer(),
						postcssGroupMedia(),
						pxtorem({
							rootValue: 16, // базовый размер шрифта
							propList: ["*"],
						}),
					])
				)
			)

			/** Раскомментировать если нужен не сжатый дубль файла стилей */
			// .pipe(gulp.dest(filePaths.build.css))

			.pipe(rename({ extname: ".min.css" }))
			.pipe(plugins.if(!isBuild, sourcemaps.write(".")))
			.pipe(gulp.dest(filePaths.build.css))
			.pipe(serverInstance.stream())
	);
};

export { scss };