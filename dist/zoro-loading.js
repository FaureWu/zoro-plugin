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

var isBoolean = function isBoolean(bool) {
  return typeof bool === 'boolean';
};
var isFunction = function isFunction(func) {
  return typeof func === 'function';
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

var loadingNamespace = 'loading';
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
        var _extends2, _extends3;

        var payload = _ref.payload;
        var global = _ref2.global,
            model = _ref2.model,
            effect = _ref2.effect;
        var modelName = payload.modelName,
            effectName = payload.effectName;
        loadingCount.global++;

        if (!loadingCount.model[modelName]) {
          loadingCount.model[modelName] = 0;
        }

        loadingCount.model[modelName]++;

        if (!loadingCount.effect[modelName + "/" + effectName]) {
          loadingCount.effect[modelName + "/" + effectName] = 0;
        }

        loadingCount.effect[modelName + "/" + effectName]++;
        return {
          global: true,
          model: _extends({}, model, (_extends2 = {}, _extends2[modelName] = true, _extends2)),
          effect: _extends({}, effect, (_extends3 = {}, _extends3[modelName + "/" + effectName] = true, _extends3))
        };
      },
      loaded: function loaded(_ref3, _ref4) {
        var _extends4, _extends5;

        var payload = _ref3.payload;
        var global = _ref4.global,
            model = _ref4.model,
            effect = _ref4.effect;
        var modelName = payload.modelName,
            effectName = payload.effectName;
        loadingCount.global--;
        loadingCount.model[modelName]--;
        loadingCount.effect[modelName + "/" + effectName]--;
        return {
          global: loadingCount.global > 0,
          model: _extends({}, model, (_extends4 = {}, _extends4[modelName] = loadingCount.model[modelName] > 0, _extends4)),
          effect: _extends({}, effect, (_extends5 = {}, _extends5[modelName + "/" + effectName] = loadingCount.effect[modelName + "/" + effectName] > 0, _extends5))
        };
      }
    }
  };
};

function loadingPlugin(event, _ref5) {
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
      }
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
      }
    });
  });
}

var loading = (function (opt) {
  if (opt && typeof opt.namespace === 'string') {
    loadingNamespace = opt.namespace;
  }

  return loadingPlugin;
});

export default loading;
