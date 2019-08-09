export interface MixinConfig {
  namespace: string;
  state?: any;
  reducers?: Z.RReducers;
  effects?: Z.ModelEffects;
}

export type Merge = (mixinValue: any, modelValue: any) => any;

export interface Option {
  [prop: string]: boolean | Merge;
}

export function createMixin(config: MixinConfig, opt: Option): Z.PluginCreator;
