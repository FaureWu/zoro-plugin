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

var extendModel = (function (opt) {
  assert(isObject(opt), "createExtendModel param must be an Object, but we get " + typeof opt);
  return function (event, _ref) {
    var DIVIDER = _ref.DIVIDER,
        PLUGIN_EVENT = _ref.PLUGIN_EVENT;
    var _opt$state = opt.state,
        state = _opt$state === void 0 ? {} : _opt$state,
        _opt$reducers = opt.reducers,
        reducers = _opt$reducers === void 0 ? {} : _opt$reducers,
        _opt$effects = opt.effects,
        effects = _opt$effects === void 0 ? {} : _opt$effects,
        excludeModels = opt.excludeModels,
        includeModels = opt.includeModels;
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
  };
});

var mixin = (function (opt) {
  assert(isObject(opt), "createMixin param must be an Object, but we get " + typeof opt);
  return function (event, _ref) {
    var DIVIDER = _ref.DIVIDER,
        PLUGIN_EVENT = _ref.PLUGIN_EVENT;
    var _opt$namespace = opt.namespace,
        namespace = _opt$namespace === void 0 ? '' : _opt$namespace,
        _opt$state = opt.state,
        state = _opt$state === void 0 ? {} : _opt$state,
        _opt$reducers = opt.reducers,
        reducers = _opt$reducers === void 0 ? {} : _opt$reducers,
        _opt$effects = opt.effects,
        effects = _opt$effects === void 0 ? {} : _opt$effects;
    event.on(PLUGIN_EVENT.BEFORE_INJECT_MODEL, function (modelOpts) {
      var mixins = modelOpts.mixins;

      if (!isArray(mixins) || mixins.indexOf(namespace) === -1) {
        return modelOpts;
      }

      return _extends({}, modelOpts, {
        state: _extends({}, state, modelOpts.state),
        reducers: _extends({}, reducers, modelOpts.reducers),
        effects: _extends({}, effects, modelOpts.effects)
      });
    });
  };
});

function resolveData(current, next) {
  var target = Object.keys(next).reduce(function (result, key) {
    result[key] = current[key];
    return result;
  }, {});
  return {
    current: target,
    next: next
  };
}

var perf = (function (scope) {
  var effect = {};
  var connect = {};

  scope.printEffect = function () {
    var printContent = Object.keys(effect).map(function (type) {
      var _effect$type$times = effect[type].times,
          times = _effect$type$times === void 0 ? {} : _effect$type$times;
      var timeArr = Object.keys(times).map(function (key) {
        var _times$key = times[key],
            _times$key$start = _times$key.start,
            start = _times$key$start === void 0 ? 0 : _times$key$start,
            _times$key$end = _times$key.end,
            end = _times$key$end === void 0 ? 0 : _times$key$end;
        return end - start;
      });
      return {
        'Effect Type': type,
        'Execution Time(ms)': timeArr.join(','),
        'Execution Times': timeArr.length
      };
    });
    console.table(printContent);
  };

  scope.printConnect = function () {
    var printContent = Object.keys(connect).map(function (name) {
      var _connect$name$times = connect[name].times,
          times = _connect$name$times === void 0 ? {} : _connect$name$times;
      var timeKeys = Object.keys(times);
      var timeArr = timeKeys.map(function (key) {
        var _times$key2 = times[key],
            _times$key2$start = _times$key2.start,
            start = _times$key2$start === void 0 ? 0 : _times$key2$start,
            _times$key2$end = _times$key2.end,
            end = _times$key2$end === void 0 ? 0 : _times$key2$end;
        return end - start;
      });
      return {
        'Component Name': name,
        'Connect ID': timeKeys.join(','),
        'Connect Time(ms)': timeArr.join(','),
        'Connect Times': timeArr.length
      };
    });
    console.table(printContent);
  };

  scope.printConnectData = function (name, id) {
    var item = connect[name];
    assert(!!item, "unkown component name: " + name + ", you can execute 'printConnect()' to get correct name list");
    var _item$times = item.times,
        times = _item$times === void 0 ? {} : _item$times;

    if (id) {
      var data = times[id];
      assert(!!data, "unkown component " + name + "'s id: " + id + ", you can execute 'printConnect()' to get correct id list");

      var _resolveData = resolveData(data.currentData, data.nextData),
          current = _resolveData.current,
          next = _resolveData.next;

      console.log("==========     " + name + "|" + id + "     ==========");
      console.log('old data: ', current);
      console.log('new data: ', next);
    } else {
      Object.keys(times).forEach(function (key) {
        var _times$key3 = times[key],
            currentData = _times$key3.currentData,
            nextData = _times$key3.nextData;

        var _resolveData2 = resolveData(currentData, nextData),
            current = _resolveData2.current,
            next = _resolveData2.next;

        console.log("==========     " + name + "|" + key + "     ==========");
        console.log('old data: ', current);
        console.log('new data: ', next);
      });
    }
  };

  scope.clear = function () {
    effect = {};
    connect = {};
  };

  return function (event, _ref) {
    var PLUGIN_EVENT = _ref.PLUGIN_EVENT;
    event.on(PLUGIN_EVENT.ON_WILL_EFFECT, function (action, store, _ref2) {
      var key = _ref2.key;

      if (!effect[action.type]) {
        effect[action.type] = {
          type: action.type,
          times: {}
        };
      }

      if (!effect[action.type].times[key]) {
        effect[action.type].times[key] = {};
      }

      effect[action.type].times[key].start = new Date().getTime();
    });
    event.on(PLUGIN_EVENT.ON_DID_EFFECT, function (action, store, _ref3) {
      var key = _ref3.key;
      effect[action.type].times[key].end = new Date().getTime();
    });
    event.on(PLUGIN_EVENT.ON_WILL_CONNECT, function (store, _ref4) {
      var key = _ref4.key,
          name = _ref4.name,
          currentData = _ref4.currentData,
          nextData = _ref4.nextData;

      if (!connect[name]) {
        connect[name] = {
          name: name,
          times: {}
        };
      }

      if (!connect[name].times[key]) {
        connect[name].times[key] = {};
      }

      connect[name].times[key].start = new Date().getTime();
      connect[name].times[key].currentData = currentData;
      connect[name].times[key].nextData = nextData;
    });
    event.on(PLUGIN_EVENT.ON_DID_CONNECT, function (store, _ref5) {
      var key = _ref5.key,
          name = _ref5.name;
      connect[name].times[key].end = new Date().getTime();
    });
  };
});

export { loading as createLoading, extendModel as createExtendModel, mixin as createMixin, perf as createPerf };
