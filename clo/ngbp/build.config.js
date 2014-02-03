module.exports = {
  build_dir: 'build',
  compile_dir: 'bin',
  app_files: {
  	//used by grunt-contrib-copy
    scripts: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js' ], 
    test_scripts: [ 'src/**/*.spec.js' ],

    //used by grunt-html2js
    atpl: [ 'src/app/**/*.tpl.html' ],
    ctpl: [ 'src/common/**/*.tpl.html' ],
  },
  vendor_files: {
  	scripts: [
          'vendor/json-2/json2.js',
          'vendor/prototypes/prototypes.js',
          'vendor/angular/angular.min.js',
          'vendor/angular-route/angular.route.min.js'
          ],
    assets: []
  }
};