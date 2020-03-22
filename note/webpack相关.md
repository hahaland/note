## 打包速度的优化
- HappyPack插件，多线程
- 有缓存参数的插件可以使用缓存
- 开发模式下可以启用热更新

## loader和plugin差别
- loader：是对源码的预处理，比如vue文件解析成js，sass解析成css，es语法解析成兼容旧浏览器的代码等（专注于对文件本身的处理）
- plugins：是一个具有apply方法的js对象，可以在整个编译的生命周期访问，所以能解决loader无法解决的问题，比如打包压缩、多线程、文件引用。

## webpack的plugin
- webpack会将compiler对象传入函数的apply属性，可以通过compiler上的钩子监听编译的各个阶段事件。

- compiler继承自tabable类，同步和异步对应tap和tabPromise。

  - compilation会被compiler用来创建新的编译，能够访问所有模块和他们的依赖；它会根据依赖关系对所有模块进行字面上的编译，模块会被加载、封存、优化、分块(chunk)、哈希、重新创建。
- resolver: 解析，有三种类型，mormal（绝对或相对路径来解析模块），context（上下文模块），loader（解析一个webpack loader）
- parser 用来解析webpack处理过的模块
