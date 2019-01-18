import { assert } from './util'

function resolveData(current, next) {
  const target = Object.keys(next).reduce((result, key) => {
    result[key] = current[key]
    return result
  }, {})

  return { current: target, next }
}

export default scope => {
  let effect = {}
  let connect = {}

  scope.printEffect = function() {
    const printContent = Object.keys(effect).map(type => {
      const { times = {} } = effect[type]
      const timeArr = Object.keys(times).map(key => {
        const { start = 0, end = 0 } = times[key]
        return end - start
      })
      return {
        'Effect Type': type,
        'Execution Time(ms)': timeArr.join(','),
        'Execution Times': timeArr.length,
      }
    })
    console.table(printContent)
  }

  scope.printConnect = function() {
    const printContent = Object.keys(connect).map(name => {
      const { times = {} } = connect[name]
      const timeKeys = Object.keys(times)
      const timeArr = timeKeys.map(key => {
        const { start = 0, end = 0 } = times[key]
        return end - start
      })

      return {
        'Component Name': name,
        'Connect ID': timeKeys.join(','),
        'Connect Time(ms)': timeArr.join(','),
        'Connect Times': timeArr.length,
      }
    })

    console.table(printContent)
  }

  scope.printConnectData = function(name, id) {
    const item = connect[name]
    assert(
      !!item,
      `unkown component name: ${name}, you can execute 'printConnect()' to get correct name list`,
    )

    const { times = {} } = item
    if (id) {
      const data = times[id]

      assert(
        !!data,
        `unkown component ${name}'s id: ${id}, you can execute 'printConnect()' to get correct id list`,
      )

      const { current, next } = resolveData(data.currentData, data.nextData)
      console.log(`==========     ${name}|${id}     ==========`)
      console.log('old data: ', current)
      console.log('new data: ', next)
    } else {
      Object.keys(times).forEach(key => {
        const { currentData, nextData } = times[key]
        const { current, next } = resolveData(currentData, nextData)
        console.log(`==========     ${name}|${key}     ==========`)
        console.log('old data: ', current)
        console.log('new data: ', next)
      })
    }
  }

  scope.clear = function() {
    effect = {}
    connect = {}
  }

  return (event, { PLUGIN_EVENT }) => {
    event.on(PLUGIN_EVENT.ON_WILL_EFFECT, (action, store, { key }) => {
      if (!effect[action.type]) {
        effect[action.type] = {
          type: action.type,
          times: {},
        }
      }

      if (!effect[action.type].times[key]) {
        effect[action.type].times[key] = {}
      }
      effect[action.type].times[key].start = new Date().getTime()
    })

    event.on(PLUGIN_EVENT.ON_DID_EFFECT, (action, store, { key }) => {
      effect[action.type].times[key].end = new Date().getTime()
    })

    event.on(
      PLUGIN_EVENT.ON_WILL_CONNECT,
      (store, { key, name, currentData, nextData }) => {
        if (!connect[name]) {
          connect[name] = {
            name,
            times: {},
          }
        }

        if (!connect[name].times[key]) {
          connect[name].times[key] = {}
        }

        connect[name].times[key].start = new Date().getTime()
        connect[name].times[key].currentData = currentData
        connect[name].times[key].nextData = nextData
      },
    )

    event.on(PLUGIN_EVENT.ON_DID_CONNECT, (store, { key, name }) => {
      connect[name].times[key].end = new Date().getTime()
    })
  }
}
