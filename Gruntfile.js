module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> | Built on <%= grunt.template.today("yyyy-mm-dd HH:MM:sso") %> */\n'
			},
			build: {
				files: {
					'xapiwrapper.min.js': [
						'cryptojs_v3.1.2.js',
						'verbs.js',
						'xapiwrapper.js',
						'xapistatement.js'
					]
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task(s).
	grunt.registerTask('default', ['uglify']);

};
