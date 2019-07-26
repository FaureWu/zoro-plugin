export interface Scope {
  [prop: string]: any;
}

export interface ResolveData {
  current: object;
  next: object;
}

export function createPerf(scope: P.Scope): Z.PluginCreator;
