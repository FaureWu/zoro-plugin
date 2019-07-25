import * as Redux from 'redux';
import * as Z from '@opcjs/zoro';
import * as P from '../plugin';
import { assert } from '../util';

function resolveData(current: object, next: object): P.ResolveData {
  const target = Object.keys(next).reduce(
    (result: object, key: string): object => {
      result[key] = current[key];
      return result;
    },
    {},
  );

  return { current: target, next };
}

export default function createPerf(scope: P.Scope): Z.PluginCreator {
  let effect = {};
  let connect = {};

  scope.printEffect = function printEffect(): void {
    const printContent = Object.keys(effect).map((type: string): object => {
      const { times = {} } = effect[type];
      const timeArr = Object.keys(times).map((key: string): number => {
        const { start = 0, end = 0 } = times[key];
        return end - start;
      });
      return {
        'Effect Type': type,
        'Execution Time(ms)': timeArr.join(','),
        'Execution Times': timeArr.length,
      };
    });
    console.table(printContent);
  };

  scope.printConnect = function printConnect(): void {
    const printContent = Object.keys(connect).map((name: string): object => {
      const { times = {} } = connect[name];
      const timeKeys = Object.keys(times);
      const timeArr = timeKeys.map((key: string): number => {
        const { start = 0, end = 0 } = times[key];
        return end - start;
      });

      return {
        'Component Name': name,
        'Connect ID': timeKeys.join(','),
        'Connect Time(ms)': timeArr.join(','),
        'Connect Times': timeArr.length,
      };
    });

    console.table(printContent);
  };

  scope.printConnectData = function printConnectData(
    name: string,
    id: string,
  ): void {
    const item = connect[name];
    assert(
      !!item,
      `unkown component name: ${name}, you can execute 'printConnect()' to get correct name list`,
    );

    const { times = {} } = item;
    if (id) {
      const data = times[id];

      assert(
        !!data,
        `unkown component ${name}'s id: ${id}, you can execute 'printConnect()' to get correct id list`,
      );

      const { current, next } = resolveData(data.currentData, data.nextData);
      console.log(`==========     ${name}|${id}     ==========`);
      console.log('old data: ', current);
      console.log('new data: ', next);
    } else {
      Object.keys(times).forEach((key: string): void => {
        const { currentData, nextData } = times[key];
        const { current, next } = resolveData(currentData, nextData);
        console.log(`==========     ${name}|${key}     ==========`);
        console.log('old data: ', current);
        console.log('new data: ', next);
      });
    }
  };

  scope.clear = function clear(): void {
    effect = {};
    connect = {};
  };

  return function createPerf(
    plugin: Z.Plugin,
    option: Z.PluginCreatorOption,
  ): void {
    plugin.on(
      option.PLUGIN_EVENT.ON_WILL_EFFECT,
      (action: Z.Action, opt: P.OnEffectOption): void => {
        if (!effect[action.type]) {
          effect[action.type] = {
            type: action.type,
            times: {},
          };
        }

        if (!effect[action.type].times[opt.effectId]) {
          effect[action.type].times[opt.effectId] = {};
        }
        effect[action.type].times[opt.effectId].start = new Date().getTime();
      },
    );
    plugin.on(
      option.PLUGIN_EVENT.ON_DID_EFFECT,
      (action: Z.Action, opt: P.OnEffectOption): void => {
        effect[action.type].times[opt.effectId].end = new Date().getTime();
      },
    );
    plugin.on(
      option.PLUGIN_EVENT.ON_WILL_CONNECT,
      (store: Redux.Store, opt: P.OnWillConnectOption): void => {
        if (!connect[opt.name]) {
          connect[opt.name] = {
            name: opt.name,
            times: {},
          };
        }

        if (!connect[opt.name].times[opt.connectId]) {
          connect[opt.name].times[opt.connectId] = {};
        }

        connect[opt.name].times[opt.connectId].start = new Date().getTime();
        connect[opt.name].times[opt.connectId].currentData = opt.currentData;
        connect[opt.name].times[opt.connectId].nextData = opt.nextData;
      },
    );
    plugin.on(
      option.PLUGIN_EVENT.ON_DID_CONNECT,
      (store: Redux.Store, opt: P.OnDidConnectOption): void => {
        connect[opt.name].times[opt.connectId].end = new Date().getTime();
      },
    );
  };
}
