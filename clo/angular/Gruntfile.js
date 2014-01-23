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
				src: ['js/lib/ie8/json2.js', 'js/lib/ie8/prototypes.js', 'data/dealsObj.js', 'js/lib/angular.min.js', 'js/lib/angular.route.min.js', 'js/lib/angular.resource.min.js', 'js/partials/controllers/controllers.js', 'js/partials/apps/cloApp.js' ],
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
	});
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['cssmin', 'concat', 'uglify']);
};