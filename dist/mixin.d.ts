export interface MixinConfig {
  namespace: string;
  state?: any;
  reducers?: Z.RReducers;
  effects?: Z.ModelEffects;
}

export function createMixin(config: MixinConfig): Z.PluginCreator;
