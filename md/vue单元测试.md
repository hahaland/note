# 起步

首先需要选择测试运行器，vue官方推荐了两种：
- Jest：功能最全，所需配置最少，默认安装了JSDOM，内置断言，命令行体验好；缺点是需要一个预处理器将单文件组件导入测试(vue-jest),且没法囊括所有单文件组件的功能（比如自定义块和样式加载）
- mocha-webpack：能通过 ```webpack``` + ```vue-loader``` 支持完整的单文件组件支持，但需要很多配置

选择Jest，配置简单的。

安装 Jest 和 Vue Test Utils

```
$ npm install --save-dev jest @vue/test-utils
```
package.json中添加一个快捷脚本
```json
{
  "scripts": {
    "test": "jest"
  }
}
```