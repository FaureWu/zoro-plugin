import * as Z from '@opcjs/zoro';
import * as P from '../typing';
import { assert, parseModelActionType } from '../util';

let isCreated = false;

function createLoadingModel(namespace: string): P.LoadingModelConfig {
  const loadingCounter: P.LoadingCounter = {
    global: 0,
    model: {},
    effect: {},
  } as P.LoadingCounter;

  return {
    namespace,
    state: {
      global: false,
      model: {},
      effect: {},
    } as P.LoadingModelState,
    reducers: {
      loading(action: Z.Action, state: P.LoadingModelState): any {
        const meta = action.meta || {};
        const payload = action.payload || {};

        if (meta.disableLoading) return state;

        loadingCounter.global++;

        const { modelName, effectName } = payload;
        if (!loadingCounter.model[modelName]) {
          loadingCounter.model[modelName] = 0;
        }
        loadingCounter.model[modelName]++;

        let loadingKey = 'effect';
        if (meta.loadingKey) {
          loadingKey = meta.loadingKey;
        }

        if (!loadingCounter[loadingKey]) {
          loadingCounter[loadingKey] = {};
        }

        if (
          !loadingCounter[loadingKey][
            `${modelName}${meta.divider}${effectName}`
          ]
        ) {
          loadingCounter[loadingKey][
            `${modelName}${meta.divider}${effectName}`
          ] = 0;
        }

        loadingCounter[loadingKey][
          `${modelName}${meta.divider}${effectName}`
        ]++;

        return {
          ...state,
          global: true,
          model: { ...state.model, [modelName]: true },
          [loadingKey]: {
            ...state[loadingKey],
            [`${modelName}${meta.divider}${effectName}`]: true,
          },
        };
      },
      loaded(action: Z.Action, state: P.LoadingModelState): any {
        const meta = action.meta || {};
        const payload = action.payload || {};

        if (meta.disableLoading) return state;

        const { modelName, effectName } = payload;
        loadingCounter.global--;
        loadingCounter.model[modelName]--;

        let loadingKey = 'effect';
        if (meta.loadingKey) {
          loadingKey = meta.loadingKey;
        }

        loadingCounter[loadingKey][
          `${modelName}${meta.divider}${effectName}`
        ]--;

        return {
          ...state,
          global: loadingCounter.global > 0,
          model: {
            ...state.model,
            [modelName]: loadingCounter.model[modelName] > 0,
          },
          [loadingKey]: {
            ...state[loadingKey],
            [`${modelName}${meta.divider}${effectName}`]:
              loadingCounter[loadingKey][
                `${modelName}${meta.divider}${effectName}`
              ] > 0,
          },
        };
      },
    },
  };
}

export default function createLoading(
  config?: P.CreateLoadingConfig,
): Z.PluginCreator {
  assert(!isCreated, 'can create only one loading plugin');

  isCreated = true;

  let namespace = 'loading';
  if (
    typeof config === 'object' &&
    config !== null &&
    !(config instanceof Array) &&
    typeof config.namespace === 'string'
  ) {
    namespace = config.namespace;
  }

  return function pluginCreator(
    plugin: Z.Plugin,
    option: Z.PluginCreatorOption,
  ): void {
    plugin.on(option.PLUGIN_EVENT.INJECT_MODELS, (): Z.ModelConfig[] => {
      return [createLoadingModel(namespace)];
    });
    plugin.on(
      option.PLUGIN_EVENT.ON_WILL_EFFECT,
      (action: Z.Action, opt: P.OnEffectOption): void => {
        const modelType = parseModelActionType(action.type, option.DIVIDER);

        opt.store.dispatch({
          type: `${namespace}${option.DIVIDER}loading`,
          payload: {
            modelName: modelType.namespace,
            effectName: modelType.type,
          },
          meta: { ...action.meta, divider: option.DIVIDER },
        });
      },
    );
    plugin.on(
      option.PLUGIN_EVENT.ON_DID_EFFECT,
      (action: Z.Action, opt: P.OnEffectOption): void => {
        const modelType = parseModelActionType(action.type, option.DIVIDER);
        opt.store.dispatch({
          type: `${namespace}${option.DIVIDER}loaded`,
          payload: {
            modelName: modelType.namespace,
            effectName: modelType.type,
          },
          meta: { ...action.meta, divider: option.DIVIDER },
        });
      },
    );
  };
}
