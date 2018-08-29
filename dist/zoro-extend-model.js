function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var noop = function noop() {};
var isArray = function isArray(arr) {
  return arr instanceof Array;
};
var isObject = function isObject(obj) {
  return obj !== null && typeof obj === 'object' && !isArray(obj);
};

var extendModel = {};

function extendModelPlugin(event, _ref) {
  var DIVIDER = _ref.DIVIDER,
      PLUGIN_EVENT = _ref.PLUGIN_EVENT;
  var _extendModel = extendModel,
      _extendModel$state = _extendModel.state,
      state = _extendModel$state === void 0 ? {} : _extendModel$state,
      _extendModel$reducers = _extendModel.reducers,
      reducers = _extendModel$reducers === void 0 ? {} : _extendModel$reducers,
      _extendModel$effects = _extendModel.effects,
      effects = _extendModel$effects === void 0 ? {} : _extendModel$effects,
      excludeModels = _extendModel.excludeModels,
      includeModels = _extendModel.includeModels;
  event.on(PLUGIN_EVENT.BEFORE_INJECT_MODEL, function (modelOpts) {
    var namespace = modelOpts.namespace;
    if (!namespace) return modelOpts;

    if (isArray(includeModels)) {
      if (includeModels.indexOf(namespace) === -1) return modelOpts;
    } else if (isArray(excludeModels) && excludeModels.indexOf(namespace) !== -1) return modelOpts;

    return _extends({}, modelOpts, {
      state: _extends({}, state, modelOpts.state),
      reducers: _extends({}, reducers, modelOpts.reducers),
      effects: _extends({}, effects, modelOpts.effects)
    });
  });
}

var extendModel$1 = (function (opts) {
  if (!isObject(opts)) return noop;
  extendModel = opts;
  return extendModelPlugin;
});

export default extendModel$1;
