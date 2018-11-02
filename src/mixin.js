import { isObject, isArray, assert } from './util'

export default opt => {
  assert(
    isObject(opt),
    `createMixin param must be an Object, but we get ${typeof opt}`,
  )

  return function(event, { DIVIDER, PLUGIN_EVENT }) {
    const { namespace = '', state = {}, reducers = {}, effects = {} } = opt

    event.on(PLUGIN_EVENT.BEFORE_INJECT_MODEL, function(modelOpts) {
      const { mixins } = modelOpts

      if (!isArray(mixins) || mixins.indexOf(namespace) === -1) {
        return modelOpts
      }

      return {
        ...modelOpts,
        state: { ...state, ...modelOpts.state },
        reducers: { ...reducers, ...modelOpts.reducers },
        effects: { ...effects, ...modelOpts.effects },
      }
    })
  }
}
