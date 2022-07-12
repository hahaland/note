# ES新特性

## Symbol

- 为了创建唯一的属性
- 有一些内置属性，比如迭代器属性等(https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- 获取对象的smybol key，可以通过`Object.getOwnPropertySymbols`
- 转换为json时key会被忽略
- `Symbol.for()` 方法和 `Symbol.keyFor()` 可以在全局的 symbol 注册表设置和取得 symbol，可以用于创建不同作用域的Symbol防止混用

  ```javascript
  // 获取description为foo的symbol注册表
    var golbalSym = Symbol.for('foo')
    // 获取symbol注册表的description
    Symbol.keyFor(golbalSym)
  ```

https://www.zhangxinxu.com/wordpress/2018/04/known-es6-symbol-function/

## 迭代器
`for val of obj`循环，需要对象有`Symbol.iterator`属性方法，该方法需要返回一个包含next方法的对象，返回value和done
```javascript
  Object.defineProperty(b, Symbol.  iterator, {
      enumerable: false,
      writable: false,
      configurable: true,
      value: function () {
          var me = this;
          var idx = 0;
          var keys = Object.keys(me);
          
          // 返回值
          return {
              next: function () {
                  return {
                      // yield返回的值
                      value: me[keys[idx++]],
                      // 是否完成迭代
                      done: (idx > keys.length)
                  }
              }
          }
      }
  });
```

## generator

- 通过yield暂停代码，next启动
- yield时储存了函数的上下文

使用方法：
 ```javascript
  function* gen(arg){
    yield 2;
    yield arg;
  }

  let genHandle = gen(3);
  for(let i of genHandle){
    console.log(i);   // 依次打印：2，3
  }

  let genHandle2 = gen(4);
  console.log(genHandle2.next()); // { value: 2, done: false }
  console.log(genHandle2.next()); // { value: 4, done: false }
  console.log(genHandle2.next()); // { value: undefined, done: true }
  ```


## async/await
promise的同步写法的实现，generator和promise的语法糖

https://vue3js.cn/interview/es6/generator.html

https://juejin.cn/post/6844904175071936519