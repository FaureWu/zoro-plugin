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

export default createLoading;
