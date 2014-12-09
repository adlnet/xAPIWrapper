module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bump: {
			options: {
				updateConfigs: ['pkg'],
				commitFiles: ['-a']
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> v <%= pkg.version %> | Built on <%= grunt.template.today("yyyy-mm-dd HH:MM:sso") %> */\n'
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

	// Load the plugins.
	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task(s).
	grunt.registerTask('default', ['uglify']);
	grunt.registerTask('release', 'Build the release of xapiwrapper', function(n) {
		var vertype = n;
		if (vertype == null) vertype = 'minor';
		grunt.task.run('bump-only:' + vertype, 'default', 'bump-commit');
	});

};
