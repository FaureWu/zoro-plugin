import * as Redux from 'redux';

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

export * from './loading';
export * from './mixin';
export * from './perf';
