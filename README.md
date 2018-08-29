# zoro-plugin

[![](https://img.shields.io/npm/v/@opcjs/zoro-plugin.svg?style=flat-square)](https://npmjs.org/package/@opcjs/zoro-plugin)
[![](https://img.shields.io/npm/dt/@opcjs/zoro-plugin.svg?style=flat-square)](https://npmjs.org/package/@opcjs/zoro-plugin)
[![](https://img.shields.io/npm/l/@opcjs/zoro-plugin.svg?style=flat-square)](https://npmjs.org/package/@opcjs/zoro-plugin)

为[redux](https://github.com/reactjs/redux)框架[zoro](https://github.com/FaureWu/zoro) 提供各式各样方便使用的插件，如果你有编写过zoro相关的插件，欢迎联系我，我将会归纳于文档中，同时也欢迎各位参与开发，提交PR

---

## 如何安装
```bash
$ npm install --save @opcjs/zoro-plugin
```

or

```bash
$ yarn add @opcjs/zoro-plugin
```

## 微信原生小程序中安装
```bash
$ yarn build
```

or
```bash
$ npm run build
```

生成的dist文件夹内包含所有的plugin编译后的文件，支持小程序`require`引入

## 插件列表

* [loading plugin](https://github.com/FaureWu/zoro-plugin/tree/master/doc/LOADING_PLUGIN.md) 全局自动记录loading状态，减少重复工作
* [extend model plugin](https://github.com/FaureWu/zoro-plugin/tree/master/doc/EXTEND_MODEL_PLUGIN.md) 扩展model，实现model公共逻辑，减少重复工作

## 开发交流

请添加微信 `Faure5` 备注 `zoro` 咨询，开源不易，如果好用，欢迎star

## License

[MIT](https://tldrlegal.com/license/mit-license)
