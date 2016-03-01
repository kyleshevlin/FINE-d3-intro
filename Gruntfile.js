'use strict';
module.exports = function(grunt) {
  // Load Grunt Tasks
  require('load-grunt-tasks')(grunt);

  // Init Grunt object
  grunt.config.init({
    pkg: grunt.file.readJSON('package.json')
  });

  // Merge Style Tasks
  grunt.config.merge({
    // Compile Sass
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'style.css': 'scss/base.scss'
        }
      }
    },

    // Autoprefix the CSS
    autoprefixer: {
      dist: {
        files: {
          'style.css': 'style.css'
        }
      }
    },

    // Watch the Sass
    watch: {
      options: {
        livereload: true
      },
      css: {
        files: '**/*.scss',
        tasks: ['sass', 'autoprefixer'],
        options: {
          spawn: false
        }
      }
    }
  });

  // Local Server
  grunt.config.merge({
    connect: {
      server: {
        options: {
          keepalive: true
        }
      }
    }
  });

  grunt.registerTask('default', ['sass', 'autoprefixer', 'watch'])
};
