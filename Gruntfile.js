module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),
    'bump': {
      options: {
        updateConfigs: ['pkg'],
        commitFiles: ['-a']
      }
    },
    'concat': {
      dist: {
        src: [
          'lib/cryptojs_v3.1.2.js',
          'src/Utils.js',
          'src/xAPIWrapper.js',
          'src/activitytypes.js',
          'src/verbs.js',
          'src/Agent.js',
          'src/Verb.js',
          'src/Object.js',
          'src/Statement.js',
          'src/xAPILaunch.js'
        ],
        dest: 'dist/xapiwrapper.min.js'
      }
    },
    'babel': {
      options: {
        presets: ['env']
      },
      dist: {
        files: {
          'dist/xapiwrapper.min.js': 'dist/xapiwrapper.min.js'
        }
      }
    },
    'uglify': {
      options: {
        banner: '/*! <%= pkg.name %> v <%= pkg.version %> | Built on <%= grunt.template.today("yyyy-mm-dd HH:MM:sso") %> */\n'
      },
      'build': {
        files: {
          'dist/xapiwrapper.min.js': 'dist/xapiwrapper.min.js'
        }
      }
    },
    'exec': {
      docs: './node_modules/doxstrap/bin/doxstrap.js --source "src/xAPIWrapper.js:src/Statement.js" --title "xAPIWrapper <%= pkg.version %> Reference" --layout "bs-sidebar.html" --no-sort --output doc'
    }
  });

  // Load the plugins.
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-exec');

  // Combine into single file, Transpile ES6 -> ES5, Minify file
  grunt.registerTask('default', ['concat', 'babel', 'uglify']);

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
