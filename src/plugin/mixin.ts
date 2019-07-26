import * as Z from '@opcjs/zoro';
import * as P from '../typing';
import { assert } from '../util';

export default function createMixin(config: P.MixinConfig): Z.PluginCreator {
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

        return {
          ...modelConfig,
          state: { ...config.state, ...modelConfig.state },
          reducers: { ...config.reducers, ...modelConfig.reducers },
          effects: { ...config.effects, ...modelConfig.effects },
        };
      },
    );
  };
}
