### loading plugin使用文档

> loading插件的使用很方便，只需要简单一步便可快速引入

#### 使用方法

```js
import zoro from '@opcjs/zoro'
import { createLoading } from '@opcjs/zoro-plugin'
/*
  或者你想仅仅引入其中某个plugin
  import createLoading from '@opcjs/zoro-plugin/loading'
*/

const app = zoro()
app.use(createLoading())
const store = app.start()
```

#### `createLoading(opt)`

* `opt.namespace` `<String>` 定义loading信息在state中的属性名，可省略，默认值为loading

#### `loading plugin在redux中的存储结构`

```js
{
  loading: {
    global: false,
    model: {
      user: false,
      todos: false,
      ...
    },
    effect: {
      'user/getUser': false,
      ...
    }
  }
}
```

> user, todos皆为model命名（namespace），user/getUser为user model中effect getUser

`state.loading.global` 任意effect发起时会被置为true
`state.loading.model` model中有effect发起时，model对应的属性被置为true
`state.loading.effect` model中的effect发起时，对应的属性被置为true

> 该插件仅仅维护了一个loading state在redux中，使用该状态与redux其他state使用一致

#### 怎样可以阻止某一个dispatcher effect本次不触发loading

> 自2.1.1版本之后提供本功能

之前版本的loading plugin，会在每一次dispatcher effect时触发更新loading状态，这在后台管理系统中，适用度较高，但对于场景复杂的微信小程序或者h5中，更需要的是灵活多变


比如如下场景，我在页面中初始加载数据时，利用loading特性展示骨架屏，当用户下拉刷新数据(上拉加载数据时)，我们并不希望再次显示骨架屏，而是希望能在顶部(底部)显示加载图，这个时候我们希望能阻止默认loading状态，自己管理状态，因此我们利用disableLoading特性，可以执行如下代码:

```js
this.setState({ refresh: true })
dispatcher.model.queryData(payload, { disableLoading: true })
  .then(() => this.setState({ refresh: false }))
  .catch(() => this.setState({ refresh: false }))
```

虽然上面的例子可以满足我们的场景，但同时也引入了其他问题，那就是我们的loading状态又需要自己存储在本地了自己维护了，这并不是我们想要的，因此我们提供了另外一个特性，loadingKey，用于指定本次loading态存储的键名，使用方法如下:

```js
// 初始调用请求数据
dispatcher.model.queryData(payload)

// 页面下拉刷新数据
dispatcher.model.queryData(payload, { loadingKey: 'refresh' })
```

此时刷新时loading state如下：

```json
{
  "global": true,
  "model": {
    "model": true,
  },
  "effect": {
    "model/queryData": false,
  },
  "refresh": {
    "model/queryData"
  },
}
```
