// Generated by CoffeeScript 1.3.3
(function() {
  var coffeeify, fs, handlebars, handleify, path, shim, uglify, _;

  handleify = require('handleify');

  coffeeify = require('coffeeify');

  uglify = require('uglify-js2');

  shim = require('browserify-shim');

  path = require('path');

  fs = require('fs');

  handlebars = require('handleify/node_modules/handlebars');

  _ = require('underscore');

  module.exports = function(grunt) {
    var beforeHook, generatePaths, handlebarify;
    beforeHook = function(bundle) {
      bundle.transform(coffeeify);
      bundle.transform(handleify);
      return shim(bundle, {
        $: {
          path: './vendor/zepto',
          exports: 'Zepto'
        }
      });
    };
    generatePaths = {
      model: {
        implementation: {
          template: './templates/model.hbs',
          dest: './src/models/'
        },
        spec: {
          template: './templates/model_spec.hbs',
          dest: './test/models/'
        }
      },
      view: {
        template: {
          template: './templates/view_template.hbs',
          dest: './src/views/'
        },
        implementation: {
          template: './templates/view.hbs',
          dest: './src/views/'
        },
        spec: {
          template: './templates/view_spec.hbs',
          dest: './test/views/'
        }
      },
      router: {
        implementation: {
          template: './templates/router.hbs',
          dest: './src/routers/'
        },
        spec: {
          template: './templates/router_spec.hbs',
          dest: './test/routers/'
        }
      }
    };
    this.initConfig({
      "delete": generatePaths,
      generate: generatePaths,
      regarde: {
        styles: {
          files: ['stylesheets/**/*'],
          tasks: ['clean:styles', 'stylus:dev', 'livereload']
        },
        app: {
          files: ['src/**/*'],
          tasks: ['clean:build', 'browserify2:dev', 'express:app', 'livereload']
        }
      },
      express: {
        app: './server.coffee'
      },
      clean: {
        build: ['public/application.js'],
        styles: ['public/style.css']
      },
      browserify2: {
        dev: {
          expose: {
            backbone: './node_modules/backbone/backbone.js'
          },
          entry: './src/app/application.coffee',
          compile: './public/application.js',
          debug: true,
          beforeHook: beforeHook
        },
        build: {
          expose: {
            backbone: './node_modules/backbone/backbone.js'
          },
          entry: './src/app/application.coffee',
          compile: './public/application.js',
          beforeHook: beforeHook,
          afterHook: function(src) {
            var result;
            result = uglify.minify(src, {
              fromString: true
            });
            return result.code;
          }
        }
      },
      stylus: {
        dev: {
          options: {
            debug: true,
            use: ['nib'],
            "import": ['nib']
          },
          files: {
            'public/style.css': 'stylesheets/**/*.styl'
          }
        },
        build: {
          options: {
            debug: false,
            use: ['nib'],
            "import": ['nib']
          },
          files: {
            'public/style.css': 'stylesheets/**/*.styl'
          }
        }
      },
      watch: {
        scripts: {
          files: ['**/*.coffee'],
          tasks: ['default']
        }
      }
    });
    this.loadNpmTasks('grunt-contrib-clean');
    this.loadNpmTasks('grunt-contrib-stylus');
    this.loadNpmTasks('grunt-contrib-livereload');
    this.loadNpmTasks('grunt-browserify2');
    this.loadNpmTasks('grunt-regarde');
    this.loadNpmTasks('grunt-devtools');
    this.loadTasks('tasks');
    this.registerTask('default', ['clean', 'stylus:dev', 'browserify2:dev', 'express:app', 'livereload-start', 'regarde']);
    this.registerTask('build', ['clean', 'stylus:build', 'browserify2:build']);
    this.registerTask('serve', ['express:app', 'express-keepalive']);
    this.registerTask('dev', ['browserify2:dev', 'stylus:dev']);
    handlebarify = function(module, filename) {
      var template;
      template = handlebars.compile(fs.readFileSync(filename, 'utf8'));
      return module.exports = function(context) {
        return template(context);
      };
    };
    require.extensions['.hbs'] = handlebarify;
    this.registerMultiTask('delete', 'a scaffolding task', function() {
      var addTemplateToPath, config, extension, implementation, msg, name, spec, template, templateObject, templatePath, _i, _len, _ref, _ref1;
      config = grunt.config.get('generate');
      _ref = config[this.target], implementation = _ref.implementation, spec = _ref.spec, template = _ref.template;
      name = grunt.option('name');
      _ref1 = [implementation, spec, template];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        templateObject = _ref1[_i];
        if (!templateObject) {
          return;
        }
        if (templateObject === template) {
          addTemplateToPath = true;
        }
        extension = addTemplateToPath ? '.hbs' : '.coffee';
        templatePath = path.resolve(templateObject.dest, name.toLowerCase());
        templatePath = templatePath + extension;
        grunt.file["delete"](templatePath);
        msg = "File deleted: " + (grunt.log.wordlist([templatePath], {
          color: 'cyan'
        }));
        grunt.log.writeln(msg);
      }
    });
    return this.registerMultiTask('generate', 'a scaffolding task', function() {
      var addTemplateToPath, config, extension, implementation, msg, name, relativePath, spec, template, templateObject, templatePath, _i, _len, _ref, _ref1;
      config = grunt.config.get('generate');
      _ref = config[this.target], implementation = _ref.implementation, spec = _ref.spec, template = _ref.template;
      name = grunt.option('name');
      _ref1 = [implementation, spec, template];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        templateObject = _ref1[_i];
        if (!templateObject) {
          return;
        }
        if (templateObject === template) {
          addTemplateToPath = true;
        }
        extension = addTemplateToPath ? '.hbs' : '.coffee';
        templatePath = path.resolve(templateObject.dest, name.toLowerCase());
        templatePath = templatePath + extension;
        relativePath = './' + name.toLowerCase() + '.hbs';
        grunt.file.write(templatePath, require(templateObject.template)({
          name: name,
          relativePath: relativePath,
          nameLower: name.toLowerCase()
        }));
        msg = "File written to: " + (grunt.log.wordlist([templatePath], {
          color: 'cyan'
        }));
        grunt.log.writeln(msg);
      }
    });
  };

}).call(this);