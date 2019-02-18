module.exports = function(grunt) {

  var wrapper = grunt.file.read('./umdwrapper.js').split('//<%= output =>');

  // Remove the function wrapping each file and save it in a temporary folder
  // This allows intellisense to work correctly
  (function makeStrippedTempFiles(files) {
    grunt.file.mkdir('temp');
    files.forEach((file)=>{
      var stripped = grunt.file.read('src/'+file).replace(/(^([^\n]+\n{1}){1})|(\n[^\n]+\n$)/g, "");
      grunt.file.write('temp/'+file, stripped);
    });
  })([
    'activitytypes.js',
    'verbs.js',
    'xapiwrapper.js',
    'xapistatement.js',
    'xapi-util.js',
    'xapi-launch.js'
  ]);

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
        footer: wrapper[1]
      },
      'development': {
        options: {
          mangle: false,
          compress: false,
          beautify: true,
          output: {
            comments: 'all'
          }
        },
        files: {
          'dist/xapiwrapper.js': [
            'lib/cryptojs_v3.1.2.js',
            'lib/utf8-encoding.js',
            'temp/activitytypes.js',
            'temp/verbs.js',
            'temp/xapiwrapper.js',
            'temp/xapistatement.js',
            'temp/xapi-util.js',
            'temp/xapi-launch.js'
          ]
        }
      },
      'build': {
        options: {
          sourceMap: {
              filename: 'xapiwrapper.min.js.map',
              url: 'xapiwrapper.min.js.map',
              root: 'dist/',
              includeSources: true
          }
        },
        files: {
          'dist/xapiwrapper.min.js': [
            'lib/cryptojs_v3.1.2.js',
            'lib/utf8-encoding.js',
            'temp/activitytypes.js',
            'temp/verbs.js',
            'temp/xapiwrapper.js',
            'temp/xapistatement.js',
            'temp/xapi-util.js',
            'temp/xapi-launch.js'
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
