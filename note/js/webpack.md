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

## __webpack_require__

我们知道webpack打包后，会将引入的模块存放到一个对象中，key为模块路径，通过`__webpack_require__`方法引入对应模块.

下面是简化的代码
```javascript
var WebpackTest =
(function(modules) {
	// 缓存
	var installedModules = {};

	function __webpack_require__(moduleId) {
		// 检查是否在缓存中
		if(installedModules[moduleId]) {
			return installedModules[moduleId].exports;
		}
		// 没有则创建模块
		var module = installedModules[moduleId] = {
			i: moduleId,
			l: false,
			exports: {}
		};
		
    // 执行代码
		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
		// 将模块标识为已加载
		module.l = true;
		// 返回exports
		return module.exports;
	}

	// 提供Getter给导出的方法、变量
	__webpack_require__.d = function(exports, name, getter) {
		if(!__webpack_require__.o(exports, name)) {
			Object.defineProperty(exports, name, { enumerable: true, get: getter });
		}
	};
	// 标识该模块为es模块
	__webpack_require__.r = function(exports) {
		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
		}
		Object.defineProperty(exports, '__esModule', { value: true });
	};
	// Object.prototype.hasOwnProperty.call
	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };


	// __webpack_require__加载入口模块，并返回模块对象
	return __webpack_require__(__webpack_require__.s = "./src/index.js");
})
```

模块代码打包后结构如下：
```javascript
  (function(module, exports, __webpack_require__) {
     // 代码
  })
```
代码会封装成一个函数，在首次调用__webpack_require__时执行代码，并缓存到installedModules中，之后相同的import都取同个引用。

如果直接对import的内容修改，会报错，因为es modlue规范规定import的属性不允许修改。





## 持久化存储
webpack5的新特性，解决打包时间过长的问题