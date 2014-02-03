module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-html2js');

  var userConfig = require( './build.config.js' );

  var taskConfig = {
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      build: ['<%= build_dir %>']
    },
    cssmin: {
      combine: {
        files: {
          '<%= build_dir %>/core.<%= pkg.version %>.min.css': ['src/css/core.css']
        }
      }
    },
    copy: {
      build_app_assets: {
        files: [
          { 
            src: [ '**' ],
            dest: '<%= build_dir %>/assets/',
            cwd: 'src/assets',
            expand: true
          }
       ]   
      },
      build_vendor_assets: {
        files: [
          { 
            src: [ '<%= vendor_files.assets %>' ],
            dest: '<%= build_dir %>/assets/',
            cwd: '.',
            expand: true,
            flatten: true
          }
       ]   
      },
      build_appjs: {
        files: [
          {
            src: [ '<%= app_files.scripts %>' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorjs: {
        files: [
          {
            src: [ '<%= vendor_files.scripts %>' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      }
    },
    concat: {
      build: {
        files: {
          '<%= build_dir %>/vendor.js': '<%= vendor_files.scripts %>',
          '<%= build_dir %>/app.js': '<%= app_files %>'
        }
      }
    },
    uglify:{
      my_target: {
        options:{
          mangle:false
        },
        files: {
          '<%= build_dir %>/core.<%= pkg.version %>.min.js': ['<%= build_dir %>/vendor.js', '<%= build_dir %>/app.js' ]
        }
      }
    },
    html2js: {
      /**
       * These are the templates from `src/app`.
       */
      app: {
        options: {
          base: 'src/app'
        },
        src: [ '<%= app_files.atpl %>' ],
        dest: '<%= build_dir %>/templates-app.js'
      },

      /**
       * These are the templates from `src/common`.
       */
      common: {
        options: {
          base: 'src/common'
        },
        src: [ '<%= app_files.ctpl %>' ],
        dest: '<%= build_dir %>/templates-common.js'
      }
    },
    index: {
      build: {
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.scripts %>',
          '<%= build_dir %>/src/**/*.js',
          '<%= build_dir %>/core.<%= pkg.version %>.min.css',
          '<%= html2js.common.dest %>',
          '<%= html2js.app.dest %>'
        ]
      }
    }
  };
  
  grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  function filterForJS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.js$/ );
    });
  }

  function filterForCSS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.css$/ );
    });
  }

  grunt.registerMultiTask(
    'index',
    'Process index.html', 
    function(){
      var dirRE = new RegExp( '^('+grunt.config('build_dir')+'|'+grunt.config('compile_dir')+')\/', 'g' );
      var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
        return file.replace( dirRE, '' );
      });
      var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
        return file.replace( dirRE, '' );
      });
      grunt.file.copy('src/index.html', this.data.dir + '/index.html', 
        { 
          process: function ( contents, path ) {
            return grunt.template.process( contents, { data: {
              scripts: jsFiles,
              styles: cssFiles,
              version: grunt.config( 'pkg.version' ) 
            } } );
          }
        }
      );
    });
  
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['clean:build', 'html2js', 'cssmin', 'copy:build_vendorjs', 'copy:build_appjs', 'copy:build_app_assets', 'copy:build_vendor_assets', 'index:build']);
};
