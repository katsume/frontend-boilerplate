const	path= require('path');

const	gulp= require('gulp'),
			del= require('del'),
			plumber= require('gulp-plumber'),
			named= require('vinyl-named'),
			webpack= require('webpack'),
			webpackStream= require('webpack-stream'),
			// through= require('through2'),
			ejs= require('gulp-ejs'),
			sass= require('gulp-ruby-sass'),
			watch= require('gulp-watch'),
			runSequence= require('run-sequence');

const	src= path.resolve(__dirname, 'src'),
			dest= path.resolve(__dirname, 'build');

gulp.task('clean', (callback)=>{
	del([path.join(dest, '**', '*.*')]).then(()=>{
		callback();
	});
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
						loader: 'babel-loader',
						query: {
							presets: ['@babel/preset-env']
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
	return sass(path.join(src, 'sass', '**', '*.scss'), {
			style: 'expanded'
		})
		.on('error', (err)=>{
			console.error('Error', err.message);
		})
		.pipe(gulp.dest(path.join(dest, 'css')))
});

gulp.task('copy', ()=>{
	return gulp.src(path.join(src, 'www', '**'))
		.pipe(gulp.dest(dest));
});

gulp.task('build', (callback)=>{
	return runSequence('clean', ['webpack', 'ejs', 'sass', 'copy'], callback);
});

gulp.task('watch', ()=>{

	watch(path.join(src, 'js', '**'), ()=>{
		return runSequence('webpack');
	});

	watch(path.join(src, 'ejs', '**', '*.(html|ejs|json)'), ()=>{
		return runSequence('ejs');
	});

	watch(path.join(src, 'sass', '**', '*.scss'), ()=>{
		return runSequence('sass');
	});

	watch(path.join(src, 'www', '**'), ()=>{
		return runSequence('copy');
	});

});

gulp.task('default', (callback)=>{
	return runSequence('build', 'watch', callback);
});
