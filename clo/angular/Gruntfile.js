module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		cssmin: {
			combine: {
				files: {
					'css/prod/core.min.css': ['css/partials/core.css']
				}
			}
		},
		concat: {
			dist: {
				src: ['js/lib/ie8/json2.js', 'js/lib/ie8/prototypes.js', 'data/entityObj.js', 'js/lib/angular.min.js', 'js/lib/angular.route.min.js', 'js/controllers/controllers.js', 'js/apps/cloApp.js' ],
				dest: 'js/prod/built.js'
			}
		},
		uglify:{
			my_target: {
				options:{
					mangle:false
				},
				files: {
					'js/prod/core.min.js' : ['js/prod/built.js']
				}
			}
		}
		/*uglify:{
			my_target: {
				options: {
					mangle: false
				},
				files: {
					'js/prod/core.min.js': ['data/entityObj.js', 'js/apps/cloApp.js', 'js/controllers/controllers.js'],
					'js/prod/ie8.min.js' : ['js/lib/ie8/json2.js', 'js/lib/ie8/prototypes.js'],
					'js/prod/libs.min.js': ['js/lib/angular.min.js', 'js/lib/angular.route.min.js']
				}
			}
		}*/
	});
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['cssmin', 'concat', 'uglify']);
};