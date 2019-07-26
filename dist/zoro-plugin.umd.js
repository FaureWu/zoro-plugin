(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.zoroPlugin = {}));
}(this, function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function assert(validate, message) {
        if ((typeof validate === 'boolean' && !validate) ||
            (typeof validate === 'function' && !validate())) {
            throw new Error(message);
        }
    }
    function parseModelActionType(actionType, divider) {
        var parts = actionType.split(divider);
        assert(parts.length >= 2, "invalid model action type, [" + actionType + "]");
        return {
            namespace: parts.slice(0, parts.length - 1).join(divider),
            type: parts[parts.length - 1],
        };
    }

    var isCreated = false;
    function createLoadingModel(namespace) {
        var loadingCounter = {
            global: 0,
            model: {},
            effect: {},
        };
        return {
            namespace: namespace,
            state: {
                global: false,
                model: {},
                effect: {},
            },
            reducers: {
                loading: function (action, state) {
                    var _a, _b, _c;
                    var meta = action.meta || {};
                    var payload = action.payload || {};
                    if (meta.disableLoading)
                        return state;
                    loadingCounter.global++;
                    var modelName = payload.modelName, effectName = payload.effectName;
                    if (!loadingCounter.model[modelName]) {
                        loadingCounter.model[modelName] = 0;
                    }
                    loadingCounter.model[modelName]++;
                    var loadingKey = 'effect';
                    if (meta.loadingKey) {
                        loadingKey = meta.loadingKey;
                    }
                    if (!loadingCounter[loadingKey]) {
                        loadingCounter[loadingKey] = {};
                    }
                    if (!loadingCounter[loadingKey]["" + modelName + meta.divider + effectName]) {
                        loadingCounter[loadingKey]["" + modelName + meta.divider + effectName] = 0;
                    }
                    loadingCounter[loadingKey]["" + modelName + meta.divider + effectName]++;
                    return __assign({}, state, (_a = { global: true, model: __assign({}, state.model, (_b = {}, _b[modelName] = true, _b)) }, _a[loadingKey] = __assign({}, state[loadingKey], (_c = {}, _c["" + modelName + meta.divider + effectName] = true, _c)), _a));
                },
                loaded: function (action, state) {
                    var _a, _b, _c;
                    var meta = action.meta || {};
                    var payload = action.payload || {};
                    if (meta.disableLoading)
                        return state;
                    var modelName = payload.modelName, effectName = payload.effectName;
                    loadingCounter.global--;
                    loadingCounter.model[modelName]--;
                    var loadingKey = 'effect';
                    if (meta.loadingKey) {
                        loadingKey = meta.loadingKey;
                    }
                    loadingCounter[loadingKey]["" + modelName + meta.divider + effectName]--;
                    return __assign({}, state, (_a = { global: loadingCounter.global > 0, model: __assign({}, state.model, (_b = {}, _b[modelName] = loadingCounter.model[modelName] > 0, _b)) }, _a[loadingKey] = __assign({}, state[loadingKey], (_c = {}, _c["" + modelName + meta.divider + effectName] = loadingCounter[loadingKey]["" + modelName + meta.divider + effectName] > 0, _c)), _a));
                },
            },
        };
    }
    function createLoading(config) {
        assert(!isCreated, 'can create only one loading plugin');
        isCreated = true;
        var namespace = 'loading';
        if (typeof config === 'object' &&
            config !== null &&
            !(config instanceof Array) &&
            typeof config.namespace === 'string') {
            namespace = config.namespace;
        }
        return function pluginCreator(plugin, option) {
            plugin.on(option.PLUGIN_EVENT.INJECT_MODELS, function () {
                return [createLoadingModel(namespace)];
            });
            plugin.on(option.PLUGIN_EVENT.ON_WILL_EFFECT, function (action, opt) {
                var modelType = parseModelActionType(action.type, option.DIVIDER);
                opt.store.dispatch({
                    type: "" + namespace + option.DIVIDER + "loading",
                    payload: {
                        modelName: modelType.namespace,
                        effectName: modelType.type,
                    },
                    meta: __assign({}, action.meta, { divider: option.DIVIDER }),
                });
            });
            plugin.on(option.PLUGIN_EVENT.ON_DID_EFFECT, function (action, opt) {
                var modelType = parseModelActionType(action.type, option.DIVIDER);
                opt.store.dispatch({
                    type: "" + namespace + option.DIVIDER + "loaded",
                    payload: {
                        modelName: modelType.namespace,
                        effectName: modelType.type,
                    },
                    meta: __assign({}, action.meta, { divider: option.DIVIDER }),
                });
            });
        };
    }

    function createMixin(config) {
        assert(typeof config === 'object' && config !== null && !(config instanceof Array), "createMixin param must be an Object, but we get " + typeof config);
        return function createMixin(plugin, option) {
            plugin.on(option.PLUGIN_EVENT.ON_BEFORE_CREATE_MODEL, function (modelConfig) {
                if (!(modelConfig.mixins instanceof Array) ||
                    modelConfig.mixins.indexOf(config.namespace) === -1) {
                    return modelConfig;
                }
                return __assign({}, modelConfig, { state: __assign({}, config.state, modelConfig.state), reducers: __assign({}, config.reducers, modelConfig.reducers), effects: __assign({}, config.effects, modelConfig.effects) });
            });
        };
    }

    function resolveData(current, next) {
        var target = Object.keys(next).reduce(function (result, key) {
            result[key] = current[key];
            return result;
        }, {});
        return { current: target, next: next };
    }
    function createPerf(scope) {
        var effect = {};
        var connect = {};
        scope.printEffect = function printEffect() {
            var printContent = Object.keys(effect).map(function (type) {
                var _a = effect[type].times, times = _a === void 0 ? {} : _a;
                var timeArr = Object.keys(times).map(function (key) {
                    var _a = times[key], _b = _a.start, start = _b === void 0 ? 0 : _b, _c = _a.end, end = _c === void 0 ? 0 : _c;
                    return end - start;
                });
                return {
                    'Effect Type': type,
                    'Execution Time(ms)': timeArr.join(','),
                    'Execution Times': timeArr.length,
                };
            });
            console.table(printContent);
        };
        scope.printConnect = function printConnect() {
            var printContent = Object.keys(connect).map(function (name) {
                var _a = connect[name].times, times = _a === void 0 ? {} : _a;
                var timeKeys = Object.keys(times);
                var timeArr = timeKeys.map(function (key) {
                    var _a = times[key], _b = _a.start, start = _b === void 0 ? 0 : _b, _c = _a.end, end = _c === void 0 ? 0 : _c;
                    return end - start;
                });
                return {
                    'Component Name': name,
                    'Connect ID': timeKeys.join(','),
                    'Connect Time(ms)': timeArr.join(','),
                    'Connect Times': timeArr.length,
                };
            });
            console.table(printContent);
        };
        scope.printConnectData = function printConnectData(name, id) {
            var item = connect[name];
            assert(!!item, "unkown component name: " + name + ", you can execute 'printConnect()' to get correct name list");
            var _a = item.times, times = _a === void 0 ? {} : _a;
            if (id) {
                var data = times[id];
                assert(!!data, "unkown component " + name + "'s id: " + id + ", you can execute 'printConnect()' to get correct id list");
                var _b = resolveData(data.currentData, data.nextData), current = _b.current, next = _b.next;
                console.log("==========     " + name + "|" + id + "     ==========");
                console.log('old data: ', current);
                console.log('new data: ', next);
            }
            else {
                Object.keys(times).forEach(function (key) {
                    var _a = times[key], currentData = _a.currentData, nextData = _a.nextData;
                    var _b = resolveData(currentData, nextData), current = _b.current, next = _b.next;
                    console.log("==========     " + name + "|" + key + "     ==========");
                    console.log('old data: ', current);
                    console.log('new data: ', next);
                });
            }
        };
        scope.clear = function clear() {
            effect = {};
            connect = {};
        };
        return function createPerf(plugin, option) {
            plugin.on(option.PLUGIN_EVENT.ON_WILL_EFFECT, function (action, opt) {
                if (!effect[action.type]) {
                    effect[action.type] = {
                        type: action.type,
                        times: {},
                    };
                }
                if (!effect[action.type].times[opt.effectId]) {
                    effect[action.type].times[opt.effectId] = {};
                }
                effect[action.type].times[opt.effectId].start = new Date().getTime();
            });
            plugin.on(option.PLUGIN_EVENT.ON_DID_EFFECT, function (action, opt) {
                effect[action.type].times[opt.effectId].end = new Date().getTime();
            });
            plugin.on(option.PLUGIN_EVENT.ON_WILL_CONNECT, function (store, opt) {
                if (!connect[opt.name]) {
                    connect[opt.name] = {
                        name: opt.name,
                        times: {},
                    };
                }
                if (!connect[opt.name].times[opt.connectId]) {
                    connect[opt.name].times[opt.connectId] = {};
                }
                connect[opt.name].times[opt.connectId].start = new Date().getTime();
                connect[opt.name].times[opt.connectId].currentData = opt.currentData;
                connect[opt.name].times[opt.connectId].nextData = opt.nextData;
            });
            plugin.on(option.PLUGIN_EVENT.ON_DID_CONNECT, function (store, opt) {
                connect[opt.name].times[opt.connectId].end = new Date().getTime();
            });
        };
    }

    exports.createLoading = createLoading;
    exports.createMixin = createMixin;
    exports.createPerf = createPerf;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
