const	path= require('path');

const	gulp= require('gulp'),
			del= require('del'),
			plumber= require('gulp-plumber'),
			named= require('vinyl-named'),
			webpack= require('webpack'),
			webpackStream= require('webpack-stream'),
			// through= require('through2'),
			ejs= require('gulp-ejs'),
			sass= require('gulp-sass');

const	src= path.resolve(__dirname, 'src'),
			dest= path.resolve(__dirname, 'build');

gulp.task('clean', ()=>{
	return del([path.join(dest, '**', '*.*')]);
});

gulp.task('webpack', ()=>{
	return gulp.src([
			path.join(src, 'js', 'index.js')
		])
		.pipe(plumber())
		.pipe(named())
		.pipe(webpackStream({
			mode: (process.env.NODE_ENV==='production')?'production':'development',
			module: {
				rules: [
					{
						test: /\.js?$/,
						exclude: /(node_modules)/,
						use: {
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env']
							}
						}
					}
				]
			},
			plugins: [
			]
		}, webpack))
		.pipe(gulp.dest(path.join(dest, 'js')));
});

// const	appendData= ()=>{
// 	return through.obj((file, enc, cb)=>{
//
// 		file.data= Object.assign(
// 			{
// 			},
// 			JSON.parse(fs.readFileSync(path.resolve(config.path, './ejs/_data.json')))
// 		);
//
// 		cb(null, file);
// 	});
// };

gulp.task('ejs', ()=>{
	return gulp.src([
			path.join(src, 'ejs', '**', '*.html'),
			'!'+path.join(src, 'ejs', '**', '_*.ejs')
		])
		.pipe(plumber())
		// .pipe(appendData())
		.pipe(ejs())
		.pipe(gulp.dest(dest));
});

gulp.task('sass', ()=>{
	return gulp.src(path.join(src, 'sass', '**', '*.scss'))
		.pipe(sass({
			style: 'expanded'
		}))
		.on('error', (err)=>{
			console.error('Error', err.message);
		})
		.pipe(gulp.dest(path.join(dest, 'css')))
});

gulp.task('copy', ()=>{
	return gulp.src(path.join(src, 'www', '**'))
		.pipe(gulp.dest(dest));
});

gulp.task('build',
	gulp.series('clean', gulp.parallel('webpack', 'ejs', 'sass', 'copy'))
);

gulp.task('watch', ()=>{

	gulp.watch(
		path.join(src, 'js', '**'),
		gulp.series('webpack')
	);

	gulp.watch(
		path.join(src, 'ejs', '**', '*.(html|ejs|json)'),
		gulp.series('ejs')
	);

	gulp.watch(
		path.join(src, 'sass', '**', '*.scss'),
		gulp.series('sass')
	);

	gulp.watch(
		path.join(src, 'www', '**'),
		gulp.series('copy')
	);

});
