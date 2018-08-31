import { isObject, isArray, assert } from './util'

export default opt => {
  assert(
    isObject(opt),
    `createExtendModel param must be an Object, but we get ${typeof opt}`,
  )

  return function(event, { DIVIDER, PLUGIN_EVENT }) {
    const {
      state = {},
      reducers = {},
      effects = {},
      excludeModels,
      includeModels,
    } = opt

    event.on(PLUGIN_EVENT.BEFORE_INJECT_MODEL, function(modelOpts) {
      const { namespace } = modelOpts

      if (!namespace) return modelOpts

      if (isArray(includeModels)) {
        if (includeModels.indexOf(namespace) === -1) return modelOpts
      } else if (isArray(excludeModels) && excludeModels.indexOf(namespace) !== -1) return modelOpts

      return {
        ...modelOpts,
        state: { ...state, ...modelOpts.state },
        reducers: { ...reducers, ...modelOpts.reducers },
        effects: { ...effects, ...modelOpts.effects },
      }
    })
  }
}
