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




