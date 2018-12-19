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

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var isArray = function isArray(arr) {
  return arr instanceof Array;
};
var isObject = function isObject(obj) {
  return obj !== null && typeof obj === 'object' && !isArray(obj);
};
var isBoolean = function isBoolean(bool) {
  return typeof bool === 'boolean';
};
var isFunction = function isFunction(func) {
  return typeof func === 'function';
};
var isString = function isString(str) {
  return typeof str === 'string';
};
var assert = function assert(validate, message) {
  if (isBoolean(validate) && !validate || isFunction(validate) && !validate()) {
    throw new Error(message);
  }
};
var splitType = function splitType(type, divider) {
  if (divider === void 0) {
    divider = '/';
  }

  var types = type.split(divider);
  assert(types.length > 1, "the model action type is not include the namespace, the type is " + type);
  return {
    namespace: types.slice(0, types.length - 1).join(divider),
    type: types.slice(-1)
  };
};

var count = 0;
var loading = (function (opt) {
  assert(count === 0, 'we can create only one loading plugin for zoro');
  var loadingNamespace = 'loading';

  if (opt && isString(opt.namespace)) {
    loadingNamespace = opt.namespace;
  }

  var loadingCount = {
    global: 0,
    model: {},
    effect: {}
  };

  var createLoadingModel = function createLoadingModel(namespace) {
    return {
      namespace: namespace,
      state: {
        global: false,
        model: {},
        effect: {}
      },
      reducers: {
        loading: function loading(_ref, _ref2) {
          var _extends2, _extends3, _extends4;

          var payload = _ref.payload,
              _ref$meta = _ref.meta;
          _ref$meta = _ref$meta === void 0 ? {} : _ref$meta;
          var disableLoading = _ref$meta.disableLoading,
              loadingKey = _ref$meta.loadingKey;

          var global = _ref2.global,
              model = _ref2.model,
              rest = _objectWithoutPropertiesLoose(_ref2, ["global", "model"]);

          if (disableLoading) return _extends({
            global: global,
            model: model
          }, rest);
          var modelName = payload.modelName,
              effectName = payload.effectName;
          loadingCount.global++;

          if (!loadingCount.model[modelName]) {
            loadingCount.model[modelName] = 0;
          }

          loadingCount.model[modelName]++;
          var key = loadingKey || 'effect';

          if (!isObject(loadingCount[key])) {
            loadingCount[key] = {};
          }

          if (!loadingCount[key][modelName + "/" + effectName]) {
            loadingCount[key][modelName + "/" + effectName] = 0;
          }

          loadingCount[key][modelName + "/" + effectName]++;
          var keyState = rest[key];
          delete rest[key];
          return _extends((_extends4 = {
            global: true,
            model: _extends({}, model, (_extends2 = {}, _extends2[modelName] = true, _extends2))
          }, _extends4[key] = _extends({}, keyState, (_extends3 = {}, _extends3[modelName + "/" + effectName] = true, _extends3)), _extends4), rest);
        },
        loaded: function loaded(_ref3, _ref4) {
          var _extends5, _extends6, _extends7;

          var payload = _ref3.payload,
              _ref3$meta = _ref3.meta;
          _ref3$meta = _ref3$meta === void 0 ? {} : _ref3$meta;
          var disableLoading = _ref3$meta.disableLoading,
              loadingKey = _ref3$meta.loadingKey;

          var global = _ref4.global,
              model = _ref4.model,
              rest = _objectWithoutPropertiesLoose(_ref4, ["global", "model"]);

          if (disableLoading) return _extends({
            global: global,
            model: model
          }, rest);
          var modelName = payload.modelName,
              effectName = payload.effectName;
          loadingCount.global--;
          loadingCount.model[modelName]--;
          var key = loadingKey || 'effect';
          loadingCount[key][modelName + "/" + effectName]--;
          var keyState = rest[key];
          delete rest[key];
          return _extends((_extends7 = {
            global: loadingCount.global > 0,
            model: _extends({}, model, (_extends5 = {}, _extends5[modelName] = loadingCount.model[modelName] > 0, _extends5))
          }, _extends7[key] = _extends({}, keyState, (_extends6 = {}, _extends6[modelName + "/" + effectName] = loadingCount[key][modelName + "/" + effectName] > 0, _extends6)), _extends7), rest);
        }
      }
    };
  };

  count++;
  return function (event, _ref5) {
    var DIVIDER = _ref5.DIVIDER,
        PLUGIN_EVENT = _ref5.PLUGIN_EVENT;
    var loadingModel = createLoadingModel(loadingNamespace);
    event.on(PLUGIN_EVENT.INJECT_MODELS, function () {
      return [loadingModel];
    });
    event.on(PLUGIN_EVENT.ON_WILL_EFFECT, function (action, _ref6) {
      var dispatch = _ref6.dispatch;

      var _splitType = splitType(action.type, DIVIDER),
          namespace = _splitType.namespace,
          type = _splitType.type;

      dispatch({
        type: "" + loadingNamespace + DIVIDER + "loading",
        payload: {
          modelName: namespace,
          effectName: type
        },
        meta: action.meta
      });
    });
    event.on(PLUGIN_EVENT.ON_DID_EFFECT, function (action, _ref7) {
      var dispatch = _ref7.dispatch;

      var _splitType2 = splitType(action.type),
          namespace = _splitType2.namespace,
          type = _splitType2.type;

      dispatch({
        type: "" + loadingNamespace + DIVIDER + "loaded",
        payload: {
          modelName: namespace,
          effectName: type
        },
        meta: action.meta
      });
    });
  };
});

export default loading;
