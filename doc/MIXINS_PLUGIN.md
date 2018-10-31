### mixins plugin使用文档

> 支持定义多个plugin

#### 使用方法

```js
import zoro from '@opcjs/zoro'
import { createMixins } from '@opcjs/zoro-plugin'

const app = zoro()
app.use(createMixins({
  namespace: 'update',
  state: {},
  reducers: {
    updateState(action, state) {
      return { ...state, ...action.payload }
    },
  },
}))
const store = app.start()
...
```

```js
// 在model中注入mixins
export default {
  namespace: 'model',
  state: {},
  mixins: ['update'], // 注入mixins
  effects: {
    async queryData(action, { put }) {
      const { data } = await getDataFromServer()
      put({ type: 'updateState', payload: data }) // 使用update mixins
    },
  },
}
```

#### `createMixins(opt)`

* `opt.namespace` `<String>` mixin命名
* `opt.state` `<Any>` 定义公共state，用于合入model的state中, 优先级低于model state，相同字段会被覆盖
* `opt.reducers` `<Object>` 定义公共reducers，用于合入model的reducers中，优先级低于model reducers，相同会被覆盖
* `opt.effects` `<Object>` 定义公共effects，用于合入model的effects中，优先级低于model effects，相同会被覆盖

