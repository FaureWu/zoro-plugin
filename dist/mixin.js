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

function createMixin(config, opt) {
    if (opt === void 0) { opt = {}; }
    assert(typeof config === 'object' && config !== null && !(config instanceof Array), "createMixin param must be an Object, but we get " + typeof config);
    return function createMixin(plugin, option) {
        plugin.on(option.PLUGIN_EVENT.ON_BEFORE_CREATE_MODEL, function (modelConfig) {
            if (!(modelConfig.mixins instanceof Array) ||
                modelConfig.mixins.indexOf(config.namespace) === -1) {
                return modelConfig;
            }
            var otherMergeData = Object.keys(opt).reduce(function (target, key) {
                var merge = opt[key];
                if (typeof merge === 'function') {
                    target[key] = merge(config[key], modelConfig[key]);
                    return target;
                }
                target[key] = __assign({}, config[key], modelConfig[key]);
                return target;
            }, {});
            return __assign({}, modelConfig, { state: __assign({}, config.state, modelConfig.state), reducers: __assign({}, config.reducers, modelConfig.reducers), effects: __assign({}, config.effects, modelConfig.effects) }, otherMergeData);
        });
    };
}

export default createMixin;
