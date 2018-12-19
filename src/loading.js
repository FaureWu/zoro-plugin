import { splitType, isString, assert, isObject } from './util'

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
      loading(
        { payload, meta: { disableLoading, loadingKey } = {} },
        { global, model, ...rest },
      ) {
        if (disableLoading) return { global, model, ...rest }

        const { modelName, effectName } = payload
        loadingCount.global++
        if (!loadingCount.model[modelName]) {
          loadingCount.model[modelName] = 0
        }
        loadingCount.model[modelName]++

        let key = loadingKey || 'effect'
        if (!isObject(loadingCount[key])) {
          loadingCount[key] = {}
        }

        if (!loadingCount[key][`${modelName}/${effectName}`]) {
          loadingCount[key][`${modelName}/${effectName}`] = 0
        }
        loadingCount[key][`${modelName}/${effectName}`]++

        const keyState = rest[key]
        delete rest[key]

        return {
          global: true,
          model: { ...model, [modelName]: true },
          [key]: { ...keyState, [`${modelName}/${effectName}`]: true },
          ...rest,
        }
      },
      loaded(
        { payload, meta: { disableLoading, loadingKey } = {} },
        { global, model, ...rest },
      ) {
        if (disableLoading) return { global, model, ...rest }
        const { modelName, effectName } = payload
        loadingCount.global--
        loadingCount.model[modelName]--
        const key = loadingKey || 'effect'
        loadingCount[key][`${modelName}/${effectName}`]--

        const keyState = rest[key]
        delete rest[key]

        return {
          global: loadingCount.global > 0,
          model: {
            ...model,
            [modelName]: loadingCount.model[modelName] > 0,
          },
          [key]: {
            ...keyState,
            [`${modelName}/${effectName}`]:
              loadingCount[key][`${modelName}/${effectName}`] > 0,
          },
          ...rest,
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
        meta: action.meta,
      })
    })

    event.on(PLUGIN_EVENT.ON_DID_EFFECT, function(action, { dispatch }) {
      const { namespace, type } = splitType(action.type)

      dispatch({
        type: `${loadingNamespace}${DIVIDER}loaded`,
        payload: { modelName: namespace, effectName: type },
        meta: action.meta,
      })
    })
  }
}
