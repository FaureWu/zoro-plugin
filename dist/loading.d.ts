import * as Z from '@opcjs/zoro';

export interface CreateLoadingConfig {
  namespace?: string;
}

export interface LoadingCounterMap {
  [prop: string]: number;
}

export interface LoadingCounter {
  global: number;
  model: LoadingCounterMap;
  effect: LoadingCounterMap;
  [prop: string]: LoadingCounterMap;
}

export interface LoadingModelStateMap {
  [prop: string]: boolean;
}

export interface LoadingModelState {
  global: boolean;
  model: LoadingModelStateMap;
  effect: LoadingModelStateMap;
  [prop: string]: LoadingModelStateMap;
}

export interface LoadingModelConfig extends Z.ModelConfig {
  state: LoadingModelState;
}

export function createLoading(config?: CreateLoadingConfig): Z.PluginCreator;
