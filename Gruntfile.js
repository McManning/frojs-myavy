module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'js/*-min.js'],
            options: {
                globals: {
                    console: false,
                    window: false,
                    document: false,
                    require: false,
                    requirejs: false,
                    module: false
                },
                curly: true,
                eqeqeq: true,
                forin: true,
                undef: true,
                unused: true
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: './src',
                    mainConfigFile: 'src/config.js',
                    // Uncomment these lines if we want to use almond instead
                    // and probably manually set a wrapper to something that makes
                    // more sense.
                    //name: '../external/almond',
                    //include: 'fro',
                    wrap: true,
                    name: 'myavy',
                    optimize: 'none', // going to do this as a separate task
                    out: 'dist/js/frojs.myavy.js'
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                preserveComments: false
            },
            dist: {
                files: {
                    'dist/js/frojs.myavy.min.js': ['dist/js/frojs.myavy.js']
                }
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded' // compressed
                },
                files: {
                    'dist/css/frojs.myavy.css': 'sass/frojs.myavy.sass'
                }
            }
        },
        watch: {
            scripts: {
                files: [
                    'Gruntfile.js',
                    'src/*.js',
                ],
                tasks: ['jshint']
            },
            sass: {
                files: [
                    'sass/**/*',
                ],
                tasks: ['sass']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');

    // Full build task
    grunt.registerTask('default', ['jshint', 'requirejs', 'uglify', 'sass']);
};
