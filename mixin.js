"use strict";

exports.__esModule = true;
exports.default = void 0;

var _util = require("./util");

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var _default = function _default(opt) {
  (0, _util.assert)((0, _util.isObject)(opt), "createMixin param must be an Object, but we get " + typeof opt);
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

      if (!(0, _util.isArray)(mixins) || mixins.indexOf(namespace) === -1) {
        return modelOpts;
      }

      return _extends({}, modelOpts, {
        state: _extends({}, state, modelOpts.state),
        reducers: _extends({}, reducers, modelOpts.reducers),
        effects: _extends({}, effects, modelOpts.effects)
      });
    });
  };
};

exports.default = _default;