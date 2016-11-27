import {readFileSync} from 'fs'
const sweet = require('sweet.js')
const loaderUtils = require('loader-utils')
Promise = require('bluebird')

// store our macros here
var macros = ''

// helper to load files synchronously
// used to load our configs
function moduleLoader(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch (e) {
    return ""
  }
}

// helper to resolve file loading with loader context
function resolve(loader, filepath) {
  return new Promise(function(resolve, reject) {
    loader.resolve(loader.context, filepath, function(err, res) {
      if (err) {
        reject(err)
      }
      else {
        resolve(res)
      }
    })
  })
}

module.exports = async function(source) {
  // store ref, inform it is async
  var loader = this
  loader.async()

  // currently unused
  // var loaderRequest = loaderUtils.getCurrentRequest(this)

  // parse our loader options
  var config = loaderUtils.parseQuery(loader.query)

  // handle the file requests of the loader
  var fileRequest = loaderUtils.getRemainingRequest(this)

  // use defaults if they aren't specified
  config.modules = config.modules || []
  config.sourceMaps = config.sourceMaps || false

  // @TODO: this can be a normal loop
  // get all our configs
  await Promise.all(config.modules.map(async mod => {
    var res = await resolve(loader, mod)
    var macro = moduleLoader(res)
    if (!macros.includes(macro)) {
      macros += macro
    }
    return macros
  })).catch(loader.callback)

  // add our configs to our code
  var toCompile = macros + source
  var result = sweet.compile(toCompile, {
    sourceMap: config.sourceMaps,
    filename: fileRequest,
  })

  // inform cachable
  //
  // if we have sourcemaps in query, send those back along with the
  // transformed code to the loader
  //
  // otherwise just send code
  loader.cacheable && loader.cacheable()
  if (config.sourceMaps) {
    return loader.callback(null, result.code, result.sourceMap)
  }
  loader.callback(null, result.code)
}
