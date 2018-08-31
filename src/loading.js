import { splitType, isString, assert } from './util'

let count = 0

export default opt => {
  assert(count === 0, 'we can create only one loading plugin for zoro')

  let loadingNamespace = 'loading'
  if (opt && isString(opt.namespace)) {
    loadingNamespace = opt.namespace
  }

  const loadingCount = {
    global: 0,
    model: {},
    effect: {},
  }

  const createLoadingModel = namespace => ({
    namespace,

    state: {
      global: false,
      model: {},
      effect: {},
    },

    reducers: {
      loading({ payload }, { global, model, effect }) {
        const { modelName, effectName } = payload
        loadingCount.global++
        if (!loadingCount.model[modelName]) {
          loadingCount.model[modelName] = 0
        }
        loadingCount.model[modelName]++
        if (!loadingCount.effect[`${modelName}/${effectName}`]) {
          loadingCount.effect[`${modelName}/${effectName}`] = 0
        }
        loadingCount.effect[`${modelName}/${effectName}`]++

        return {
          global: true,
          model: { ...model, [modelName]: true },
          effect: { ...effect, [`${modelName}/${effectName}`]: true },
        }
      },
      loaded({ payload }, { global, model, effect }) {
        const { modelName, effectName } = payload
        loadingCount.global--
        loadingCount.model[modelName]--
        loadingCount.effect[`${modelName}/${effectName}`]--

        return {
          global: loadingCount.global > 0,
          model: {
            ...model,
            [modelName]: loadingCount.model[modelName] > 0,
          },
          effect: {
            ...effect,
            [`${modelName}/${effectName}`]:
              loadingCount.effect[`${modelName}/${effectName}`] > 0,
          },
        }
      },
    },
  })

  count++

  return function(event, { DIVIDER, PLUGIN_EVENT }) {
    const loadingModel = createLoadingModel(loadingNamespace)

    event.on(PLUGIN_EVENT.INJECT_MODELS, function() {
      return [loadingModel]
    })

    event.on(PLUGIN_EVENT.ON_WILL_EFFECT, function(action, { dispatch }) {
      const { namespace, type } = splitType(action.type, DIVIDER)

      dispatch({
        type: `${loadingNamespace}${DIVIDER}loading`,
        payload: { modelName: namespace, effectName: type },
      })
    })

    event.on(PLUGIN_EVENT.ON_DID_EFFECT, function(action, { dispatch }) {
      const { namespace, type } = splitType(action.type)

      dispatch({
        type: `${loadingNamespace}${DIVIDER}loaded`,
        payload: { modelName: namespace, effectName: type },
      })
    })
  }
}
