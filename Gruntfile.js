module.exports = function(grunt) {

  var wrapper = grunt.file.read('./umdwrapper.js').split('//<%= output =>');

  // Project configuration.
  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),
    'bump': {
      options: {
        updateConfigs: ['pkg'],
        commitFiles: ['-a']
      }
    },
    'uglify': {
      options: {
        banner: '/*! <%= pkg.name %> v <%= pkg.version %> | Built on <%= grunt.template.today("yyyy-mm-dd HH:MM:sso") %> */\n'+wrapper[0],
        footer: wrapper[1],
        // sourceMap: {
        //     filename: 'xapiwrapper.min.js.map',
        //     url: 'xapiwrapper.min.js.map',
        //     root: 'dist/',
        //     includeSources: true
        // },
        // output: {
        //     beautify: true
        // }
      },
      'build': {
        files: {
          'dist/xapiwrapper.min.js': [
            'node_modules/text-encoding/lib/encoding.js',
            'lib/cryptojs_v3.1.2.js',
            'src/activitytypes.js',
            'src/verbs.js',
            'src/xapiwrapper.js',
            'src/xapistatement.js',
            'src/xapi-util.js',
            'src/xapi-launch.js'
          ]
        }
      }
    },
    'exec': {
      docs: './node_modules/doxstrap/bin/doxstrap.js --source "src/xapiwrapper.js:src/xapistatement.js" --title "xAPIWrapper <%= pkg.version %> Reference" --layout "bs-sidebar.html" --no-sort --output doc'
    }
  });

  // Load the plugins.
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-exec');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);//,'exec']);

  // Build only
  grunt.registerTask('build', ['uglify']);

  // Docs only
  grunt.registerTask('docs', ['exec']);

  // those with adl repo access can use this to publish a tag and release
  // $> grunt release:minor
  grunt.registerTask('release', 'Build the release of xapiwrapper', function(n) {
    var vertype = n;
    if (vertype == null) vertype = 'minor';
    grunt.task.run('bump-only:' + vertype, 'default', 'bump-commit');
  });

};
