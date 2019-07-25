function assert(validate, message) {
    if ((typeof validate === 'boolean' && !validate) ||
        (typeof validate === 'function' && !validate())) {
        throw new Error(message);
    }
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

export default createPerf;
