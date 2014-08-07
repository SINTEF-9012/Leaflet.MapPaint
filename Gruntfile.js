'use strict';

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	grunt.initConfig({
		clean: {
			ts: {
				files: [{
					src:["dist/*.js", "dist/*.d.ts", "dist/*.map"]
				}]
			}
		},
		ts: {
			build: {
				src:["{,pencils/}*.ts"],
				reference: "dist/MapPaint.d.ts",
				out:'./dist/MapPaint.js',
				// outDir:'build',
				options:{
					target: 'es5',
					module: 'commonjs',
					sourceMap:true
				}
			},
			watch: {
				src:["{,pencils/}*.ts"],
				reference: "dist/MapPaint.d.ts",
				out:'./dist/MapPaint.js',
				watch: '.',
				options:{
					target: 'es5',
					module: 'commonjs',
					sourceMap:true
				}
			}
		},
		uglify: {
			ts: {
				options: {
					sourceMap: true,
					sourceMapName: 'dist/MapPaint.min.js.map'
				},
				files: {
					'dist/MapPaint.min.js' : ['dist/MapPaint.js']
				}
			}
		}
	});

	grunt.registerTask('build', [
		'clean:ts',
		'ts:build',
		'uglify'
	]);

	grunt.registerTask('default', ['build']);
}