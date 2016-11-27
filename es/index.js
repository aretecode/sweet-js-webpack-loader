'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sweet = require('sweet.js');
var loaderUtils = require('loader-utils');
Promise = require('bluebird');

// store our macros here
var macros = '';

// helper to load files synchronously
// used to load our configs
function moduleLoader(path) {
  try {
    return (0, _fs.readFileSync)(path, 'utf8');
  } catch (e) {
    return "";
  }
}

// helper to resolve file loading with loader context
function resolve(loader, filepath) {
  return new _promise2.default(function (resolve, reject) {
    loader.resolve(loader.context, filepath, function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(source) {
    var _this = this;

    var loader, config, fileRequest, toCompile, result;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // store ref, inform it is async
            loader = this;

            loader.async();

            // currently unused
            // var loaderRequest = loaderUtils.getCurrentRequest(this)

            // parse our loader options
            config = loaderUtils.parseQuery(loader.query);

            // handle the file requests of the loader

            fileRequest = loaderUtils.getRemainingRequest(this);

            // use defaults if they aren't specified

            config.modules = config.modules || [];
            config.sourceMaps = config.sourceMaps || false;

            // @TODO: this can be a normal loop
            // get all our configs
            _context2.next = 8;
            return _promise2.default.all(config.modules.map(function () {
              var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(mod) {
                var res, macro;
                return _regenerator2.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return resolve(loader, mod);

                      case 2:
                        res = _context.sent;
                        macro = moduleLoader(res);

                        if (!macros.includes(macro)) {
                          macros += macro;
                        }
                        return _context.abrupt('return', macros);

                      case 6:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, _this);
              }));

              return function (_x2) {
                return _ref2.apply(this, arguments);
              };
            }())).catch(loader.callback);

          case 8:

            // add our configs to our code
            toCompile = macros + source;
            result = sweet.compile(toCompile, {
              sourceMap: config.sourceMaps,
              filename: fileRequest
            });

            // inform cachable
            //
            // if we have sourcemaps in query, send those back along with the
            // transformed code to the loader
            //
            // otherwise just send code

            loader.cacheable && loader.cacheable();

            if (!config.sourceMaps) {
              _context2.next = 13;
              break;
            }

            return _context2.abrupt('return', loader.callback(null, result.code, result.sourceMap));

          case 13:
            loader.callback(null, result.code);

          case 14:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();