import * as Z from '@opcjs/zoro';
import * as P from '../typing';
import { assert } from '../util';

export default function createMixin(
  config: P.MixinConfig,
  opt: P.Option = {},
): Z.PluginCreator {
  assert(
    typeof config === 'object' && config !== null && !(config instanceof Array),
    `createMixin param must be an Object, but we get ${typeof config}`,
  );

  return function createMixin(
    plugin: Z.Plugin,
    option: Z.PluginCreatorOption,
  ): void {
    plugin.on(
      option.PLUGIN_EVENT.ON_BEFORE_CREATE_MODEL,
      (modelConfig: Z.ModelConfig): Z.ModelConfig => {
        if (
          !(modelConfig.mixins instanceof Array) ||
          modelConfig.mixins.indexOf(config.namespace) === -1
        ) {
          return modelConfig;
        }

        const otherMergeData = Object.keys(opt).reduce(
          (target: any, key: string): any => {
            const merge = opt[key];
            if (typeof merge === 'function') {
              target[key] = merge(config[key], modelConfig[key]);
              return target;
            }

            target[key] = { ...config[key], ...modelConfig[key] };
            return target;
          },
          {},
        );

        return {
          ...modelConfig,
          state: { ...config.state, ...modelConfig.state },
          reducers: { ...config.reducers, ...modelConfig.reducers },
          effects: { ...config.effects, ...modelConfig.effects },
          ...otherMergeData,
        };
      },
    );
  };
}
