import * as Z from '@opcjs/zoro';
import * as Redux from 'redux';

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

export interface OnEffectOption {
  store: Redux.Store;
  effectId: string;
}

export interface OnWillConnectOption {
  connectId: string;
  name: string;
  currentData: object;
  nextData: object;
}

export interface OnDidConnectOption {
  connectId: string;
  name: string;
}

export interface MixinConfig {
  namespace: string;
  state?: any;
  reducers?: Z.RReducers;
  effects?: Z.ModelEffects;
}

export interface Scope {
  [prop: string]: any;
}

export interface ResolveData {
  current: object;
  next: object;
}

export function createLoading(config?: CreateLoadingConfig): Z.PluginCreator;

export function createMixin(config: MixinConfig): Z.PluginCreator;

export function createPerf(scope: P.Scope): Z.PluginCreator;
