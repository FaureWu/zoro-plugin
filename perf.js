"use strict";

exports.__esModule = true;
exports.default = void 0;

var _util = require("./util");

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

var _default = function _default(scope) {
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
    (0, _util.assert)(!!item, "unkown component name: " + name + ", you can execute 'printConnect()' to get correct name list");
    var _item$times = item.times,
        times = _item$times === void 0 ? {} : _item$times;

    if (id) {
      var data = times[id];
      (0, _util.assert)(!!data, "unkown component " + name + "'s id: " + id + ", you can execute 'printConnect()' to get correct id list");

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
};

exports.default = _default;