# ES新特性

## let const
1、与var相比：
- 不存在变量提升，即在声明前使用变量会报错，而var会返回undefined
- 不允许重复声明
- 暂时性死区：块级作用域中声明变量之前的区域为死区，任何使用变量的操作都会报ReferenceError，即使外层已经存在同名变量
  ```javascript
    var tmp = 123;

    if (true) {
      tmp = 'abc'; // 死区，报ReferenceError
      let tmp;
    }
  ```

- 块级作用域
  块级作用域内使用let const定义的变量只能在当前作用域使用，且未声明前不能调用：
  ```javascript
    {
      // a = 1 //  ReferenceError: Cannot access 'a' before initialization
      let a = 1
      var b = 1
    }
    console.log(b) // 1
    console.log(a) // ReferenceError
  ```

2、函数声明


```javascript
  var e = 1
  if(true){
    e = 2
    function e(){ return 1 }
    console.log(e)
    e = 3
  }
  console.log(e)
  
```
这个例子，在es6前，第一个console时函数已经完成声明，输出1如果按函数声明提前的逻辑，声明会被覆盖，结果应该是3，但**在chrome最后e是function，safari中是3**


为什么？**兼容旧语法，但es没有规定怎么兼容**

背景：es6规范前没有块级作用域的概念，**函数声明会提升到当前函数作用域上层**

而es6后，为了兼顾块级作用域和函数声明提升，不同浏览器做了不同的处理，以上述例子说明：

**chrome：**
- chrome把函数提升拆分为两步，**创建变量+赋值**
- 首先变量提升，在外层创建e变量
- 赋值e = 1
- 块级作用域中，再次变量提升，创建一个新的同名变量，记为e1，且声明函数，块级作用域中都是在使用e1
- 赋值e = 2
- 执行到了原有的声明位置，**会执行一次赋值e = e1，这里才完成了最终的声明提升**，以兼容旧语法，完成外层的提升

```javascript
  console.log(e) // undefined
  var e = 1
  if(true){
    e() // 1
    e = 2
    function e(){ return 1 }
    console.log(e)
    e = 3
  }
  console.log(e)
```

**safari：**
-没有拆分函数声明提升，直接将函数声明提前到最开始

```javascript
  console.log(e) // function e(){ return 1 }
  var e = 1
  if(true){
    e() // not a function
    e = 2
    function e(){ return 1 }
    console.log(e)
    e = 3
  }
  console.log(e)
```

因此，块级作用域中最好使用函数表达式

## 解构赋值
```javascript
// 对象
const {a,b} = { a:1, b:1}

// 数组
const [first, second] = [1,2]

// 交换变量
let x = 1, y = 2;
[x,y] = [y,x]

// 参数解构
function fn([first = 1, second = 2], {a,b}){}
fn([3,4], {a:1,b:2})

// map的遍历解构
const map = new Map();
for (let [key, value] of map) {
  console.log(key + " is " + value);
}

```
## 字符串扩展
- 加强了对unicode的支持，对超过\uFFFF的字符，可以通过\u{xxxx}设置
- JSON.stringify() 返回的unicode会转义，已符合utf-8标砖
- 实现Iterator接口，可迭代
  对于大于0xFFFF（16位）字符，可以完整读取到，而for循环读取的会按16位截断成多个
  ```javascript
    for (let c of 'foo') {
      console.log(c)
    }
    // "f"
    // "o"
    // "o"
  ```
- 模板字符串 \``${a}`\`


## 字符串新增方法
- String.fromCodePoint()：识别大于0xFFFF的字符
  ```javascript
    String.fromCodePoint(0x20BB7)
    // "𠮷"
  ```
- codePointAt: 获取字符的编码（相比charCodeAt可以获取大于16位的字符）
  ```javascript
    var s = "𠮷";
    s.length // 2
    s.charCodeAt(0) // 55362 只能获取16位
    s.codePointAt(0) // 134071
  ```
- String.raw() 用于处理模板字符串(会进行转译)
  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/raw
- normalize：Unicode正规化
- 字符位置相关方法：
  - includes(str, startPosition): 是否包括字符,startPosition为开始查找的index
  - startsWith/endsWith: 是否已字符开始/结尾，参数同上
- s.repeat(n): 返回重复拼接s字符串n次的新字符串
  - n为小数会取整（2.9 -> 2）
  - 负数或Infinity报错
  - NaN和0一样
- padStart/padEnd(maxLength, str): 在前/后插入字符串直到长度等于maxLength（如果str已经超过则截取部分字符）
- trimStart/trimEnd()（trimLeft/trimRight()）：返回去除前/后空格的新字符串
- matchAll，根据正则返回匹配结果，
  - match 一次性返回数组
  - matchAll 返回一个迭代器，通过for...of获取结果
- replaceAll(searchValue, replacement) 替换所有匹配searchValue的字符为replacement
  - searchValue为字符串时，replace只会替换一处，而replaceAll会全局替换
  - searchValue为正则时，必须带g修饰符，否则报错，而replace不会
  - replacement可以为函数, (match) => str
- at(n)： 获取第n个位置的字符，n为负数时从后往前查找

## 正则的扩展

- 构造函数的改动
  ```javascript
    var regex = new RegExp(/xyz/g, 'i'); // 旧 报错
    var regex = new RegExp(/xyz/g, 'i'); // 新 i会覆盖g

  ```
- u 修饰符, 用于识别大于16位的unicode字符
  ```javascript
    // \uD83D\uDC2A 位一个4字节的字符，而不添加u会以两个字符匹配
    /^\uD83D/u.test('\uD83D\uDC2A') // false
    /^\uD83D/.test('\uD83D\uDC2A') // true
  ```
- y修饰符（“粘连”（sticky）修饰符），与g相比，每次匹配都从上次匹配的位置开始
  
  先了解下正则对象RegExp：
  - 在设置了标志位（比如/g /y）的情况下，RegExp对象是有状态的
  - 每次执行exec或者match方法相当于步进一次
  再看下面的例子：
  ```javascript
    var s = 'aaa_aa_a';
    var r1 = /a+/g;
    var r2 = /a+/y;

    r1.exec(s) // ["aaa"]
    r2.exec(s) // ["aaa"]

    r1.exec(s) // ["aa"]
    r2.exec(s) // null
  ```
  因为第二次匹配，y修饰符必须从`_`开始，因此返回null，而g可以从任意位置开始匹配

- s修饰符: dotAll模式，使得 `.` 可以匹配行终止符（\n \r 行分隔符 段分隔符）
- v修饰符 Unicode 属性类的运算
- d修饰符，可以让`exec()、match()`结果带有indices（`[start, end]`）
- 支持后行断言
  
  比如:
  - `/(?<=\$)foo/g`，即匹配前面是$的foo字符串
  - `/(?<!b)a.b/g`, 匹配前面不是b的a.b字符
- 具名组匹配

  每组括号可以通过下标获取内容
  ```javascript
    const RE_DATE = /(\d{4})-(\d{2})-(\d{2})/;

    const matchObj = RE_DATE.exec('1999-12-31');
    const year = matchObj[1]; // 1999
    const month = matchObj[2]; // 12
    const day = matchObj[3]; // 31
  ```

  具名组即通过`?<name>`命名，可以避免下标改动影响的问题
  ```javascript
    const RE_DATE = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;

    const matchObj = RE_DATE.exec('1999-12-31');
    const year = matchObj.groups.year; // "1999"
    const month = matchObj.groups.month; // "12"
    const day = matchObj.groups.day; // "31"
  ```
  还可以通过`\k<组名>`复用前面的具名组匹配：`/^(?<word>[a-z]+)!\k<word>$/`


## 数值的扩展
- 二进制和八进制写法： 0b、0o
- 数值分隔符_: 方便长数字的书写和阅读，比如`let num = 1_000_000_000_000`，可以在任意位置添加(除了开头结尾，小数点前后，禁止符比如0x之后等)
- Number.isFinite 是否是有限值
- Number.isNaN 是否是NaN
- Number.isInteger 是否为整数
- Number.EPSILON 常量, 表示最小的单位，可以用来判断小数算法的误差
- **Math**对象的扩展：
  - Math.trunc 获取数值的整数部分
  - Math.sign 判断数值类型
    - 参数为正数，返回+1；
    - 参数为负数，返回-1；
    - 参数为 0，返回0；
    - 参数为-0，返回-0;
    - 其他值，返回NaN。
  - Math.cbrt 立方根
  - 。。。未完待续
- BigInt类型： 大整数，数值添加n后缀极为BigInt类型
  ```javascript
    var n = 123n
    n == 123 // true 值相同
    n === 123 // false 不是相同的内存空间
  ```
  - 需要注意BigInt无法与普通整数运算
  - BigInt(n) 可以转换n类型
  - 运算会去掉小数点部分

## 函数的扩展

- 可以给参数指定默认值，在参数为undefined时使用默认值
  - 参数设置时会创建一个作用域，如果默认值是变量，会在当前的参数作用域中查找
    ``` javascript
      var x = 1;

      // y取得x是前面的x值
      function f(x, y = x) {
        console.log(y);
      }

      f(2) // 2

    ```
- length属性获取参数数量（截至有默认值的参数）
  ``` javascript
    (function (a, b, c) {}).length // 3
    (function (a = 0, b, c) {}).length // 0
    (function (a, b = 1, c) {}).length // 1
  ```
- function(...arr){}： arr会存放剩余参数
- 使用了默认值、解构时，不允许在函数中使用严格模式
- name属性获取函数名
  - es6之前浏览器大部分都实现了
  - es6的匿名函数会返回变量名，而es5返回空
    ```javascript
      var f = function () {};

      // ES5
      f.name // ""

      // ES6
      f.name // "f"
    ```
- 箭头函数
  - 没有自己的this对象，因此也不能用作构造函数new
  - 无arguments对象
  - 不能使用yield，因此不能用作 Generator 函数
- 尾递归优化：
  
  通过尾调用优化，减少调用栈的创建，达到优化递归的目的
  - 尾调用优化：返回值是运行函数，且函数内没用到外部变量时，调用栈不会保留上层的上下文
    ```javascript
      function addOne(a){
        var one = 1;
        function inner(b){
          // 这里用到了闭包，包含了上层上下文，因此不会优化
          return b + one;
        }
        return inner(a);
      }

      // 斐波那契数列的尾递归优化
      function Fibonacci2 (n , ac1 = 1 , ac2 = 1) {
        if( n <= 1 ) {return ac2};

        return Fibonacci2 (n - 1, ac2, ac1 + ac2);
      }
    ```
- try catch： catch可以省略err

## 数组的扩展
- 扩展运算符 ...（可迭代对象（Iterator）都能使用，包括字符串、set/map等）
  - { ...obj } 这种写法，转的是对象不是数组，不要求实现Iterator

- Array.from

  将类数组对象和可迭代对象转成数组：
  - 可迭代对象（Iterator）: 比如Set、Map、string、NodeList、arguments等
  - 类数组对象: 
    拥有索引和length属性的对象，比如：
    - { 0：'', 1: 'xxx', length: 2 }
    - NodeList、arguments也属于类数组对象

- Array.of(a, b, c): 返回[a,b,c]
- copyWithin(target, start = 0, end = this.length)
  将[target,end-1]区间的元素，从start位置开始替换，返回新数组
- find/findIndex()，findLast/findLastIndex()

   找出数组中 第一个/最后一个 符合条件的 元素/index

- fill(val, start, end)： 将val填充到数组中的[start, end-1]区间，没有start和end默认为全部

- entries()，keys()和values()

  返回可遍历对象:
  ```javascript
    // keys 获取key值 item的key即index
    for (let index of ['a', 'b'].keys()) {
      console.log(index);
    }
    // 0
    // 1

    // values 获取item值
    for (let elem of ['a', 'b'].values()) {
      console.log(elem);
    }
    // 'a'
    // 'b'

    // entries 获取[key, item]
    for (let [index, elem] of ['a', 'b'].entries()) {
      console.log(index, elem);
    }
  ```
- includes: 判断数组是否有某个值，返回boolean

  与indexOf的差别：
  - 更加语义化
  - indexOf是通过===判断元素是否相等，因此NaN会错判
  - includes的比较算法使用的是SameValueZero（不区分+0 -0）
    ```javascript
      // polyfill
      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }
    ```
    https://tasaid.com/blog/20170829180527.html?sgs=sf20170829180527
    
    https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness

  - 可以看到includes进行了更多判断，因此性能是比indexOf差的

- flat(n)：将数组元素拉平
  - n为层数，可以设置为Infinity拉平内部的所有数组
- flatMap(function fn () {})：对元素执行fn，并进行拉平
  - 相当于执行map方法，然后再执行flat
  - 只能执行一层

- at(n): 获取对应索引的值，*可以是负数*

- 一些操作数组，但不会改变数组，会返回新数组的方法：
  - toReversed() ：颠倒数组，对应reverse
  - toSorted()：排序，对应sort
  - toSpliced(start, deleteCount, ...val)：修改指定位置的元素，对应splice
  - with(index，value)：index位置值替换为value， 对应splice(index,1,value)
- 新的数组方法不会忽略数组的空位

  *数组空位只初始化数组但没有赋过值的元素*，比如：
  ```javascript
    0 in [undefined, undefined, undefined] // true
    0 in [, , ,] // false
  ```

  es5的数组方法对空位处理并不一致：
  - forEach、filter、reduce、every、some会跳过空位
  - map会跳过，但会保留该值
  - join、toString不会忽略该值，会转换成空字符
  
  **es6新增的数组方法不会忽略该值**
- sort的排序必须为稳定排序

## 对象的扩展

- 属性名与变量名一致时可以缩写： { x, y }
- 可以在用`{}`定义对象时使用方括号定义属性名
  ```javascript
    var obj = {
      ['a']: 1
    }
  ```
- super关键字：指向当前对象的原型对象
  ```javascript
    const obj = {
      // 非法
      foo: function () {
        return super.foo
      },
      // 只有这种对象方法简写才合法，语义上表示该函数独属于改对象
      foo() {
        return super.foo
      }
    }
  ```
- 扩展运算符（等同于Object.assign()）
  - 如果对象中有`get`方法会执行
- 解构赋值（浅拷贝）
- AggregateError错误对象（ES2021）： 用于批量Promise的报错收集
  ```javascript
    try {
      throw new AggregateError([
        new Error("some error"),
      ], 'Hello');
    } catch (e) {
      console.log(e instanceof AggregateError); // true
      console.log(e.message);                   // "Hello"
      console.log(e.name);                      // "AggregateError"
      console.log(e.errors);                    // [ Error: "some error" ]
    }
  ```
- Error对象的cause属性(es2022)

  可以存放更多错误相关的信息，减少排查难度

## 对象方法的扩展

- Object.is(): 等值判断，使用同值比较逻辑

  - 同值比较：相比===，NaN可以相等，+0 -0不相等
- Object.assign：合并对象，会忽略不可枚举属性(enumerable为false)
  
  需要知道，es5时有部分方法已经会忽略了:
  - for...in， 但会返回继承的属性
  - Object.keys，当不需要遍历继承的key时可以用这个
  - JSON.stringify

- Object.getOwnPropertyDescriptors(ES2017)：返回对象所有自身属性（非继承属性）的描述对象

- Object.getPrototypeOf: 获取对象的原型对象

  相比于__proto__：
  - 为标准方法，__proto__可能会废弃
- Object.setPrototypeOf: 设置对象的原型对象

- 遍历相关的方法：
  - Object.keys: 返回可遍历的属性
  - Object.values: 返回可遍历属性的值
  - Object.entries: 返回可遍历的属性和值

- Object.fromEntries: Object.entries逆操作，将属性和值的数组转成对象

  常用场景：
  ```javascript
    // 例一
    const entries = new Map([
      ['foo', 'bar'],
      ['baz', 42]
    ]);
    Object.fromEntries(entries) // { foo: "bar", baz: 42 }

    // 例二，map转换成对象
    const map = new Map().set('foo', true).set('bar', false);
    Object.fromEntries(map)
    // { foo: true, bar: false }
  ```

- Object.hasOwn：判断是否为自身的属性

  hasOwnProperty的属性包括继承的属性，hasOwn不包括


## 运算符的扩展

- n ** m ：指数运算，n的m次方
  - 右结合：a ** b ** c === a ** (b ** c)
- 链判断运算符：obj?.key?.key
- ??判断运算符，不为undefined或Null才执行右侧的值
- 逻辑赋值运算符（es2021）：
  - &&=
  - || =
  - ??=

  x ||= y 相当于 x || (x = y) 
## Set、WeakSet
类似不会重复的数组，相关的方法
- add(val)
- delete(val)
- has(val)
- clear(): 清楚所有成员

遍历相关：
- keys、values、entries，迭代器相关
- forEach

WeakSet： 
- 引用不阻止垃圾回收
- 不可遍历，因为对象随时有可能被回收，即没有forEach、size属性

## Map、WeakMap
相比object的不同：
- 可以使用引用类型当键值，本质上是以内存地址为键值，而object是以hash作为键值

## 垃圾回收相关
- WeakRef：创建弱引用（ES2021）
  ```javascript
    let target = {};
    // wr不会影响垃圾回收
    let wr = new WeakRef(target);
  ```
- FinalizationRegistry

  用来创建一个注册表对象，该对象可以给其他对象绑定垃圾回收时触发的回调函数
  ```javascript
    const registry = new FinalizationRegistry(heldValue => {
      // ....
    });
    // 'some value'会作为heldValue传入上方的回调函数
    registry.register(obj, 'some value')
  ```

## Proxy

*用于增加代理层，不允许直接访问对象*

支持拦截的操作（基本上获取对象属性的操作都能拦截）：
- get(target, propKey, receiver) 
  - target: 目标对象。
  - property: 被获取的属性名。
  - receiver: Proxy 或者继承 Proxy 的对象
- set(target, propKey, value, receiver)
  - value 新属性值
- construct(target, argumentsList, newTarget) 拦截new操作符，返回值为作为new的结果
  - argumentsList：构造函数参数
  - newTarget：新的构造函数，即proxy本身
- has(target, propKey)：拦截propKey in proxy的操作，返回一个布尔值
- apply：拦截函数的调用、call、apply
。。。。
- ownKeys
- getPropertyOf
- setPropertyOf
- defineProperty
- deleteProperty
- getOwnPropertyDescriptor
- isExtensible
- preventExtensible

## Promise
### 特点
- 微队列
- 三种状态 （pending、rejected、fulfilled），为完成状态后无法再改变
- 可以实现链式调用，避免回调地狱

### 一些api
- then catch finally
- all：

  - 当所有promise都fulfilled时，才会返回fulfilled
  - 有一个rejected就立即返回rejected实例
- race: 返回最先完成的结果，无论是fulfilled或者rejected
- allSettled：所有promise都完成后才会返回一个数组结果
- any：只需要有一个promise成功，所有promise都失败时才会返回AggregateError
- try(fn): 执行fn并返回promise，用于统一异常处理
### 初衷/用途
1、暴露操作对象的一些语言内部的方法（`Object`的一些方法比如defineProperty）

2、对原有方法返回结果的一些修改，使其更加合理，比如
 ```javascript
    // 老写法 需要捕获错误
    try {
      Object.defineProperty(target, property, attributes);
      // success
    } catch (e) {
      // failure
    }

    // 新写法 根据返回的boolean判断
    if (Reflect.defineProperty(target, property, attributes)) {
      // success
    } else {
      // failure
    }
  ```

3、`Object`操作变成函数行为
  ```javascript
    // 老写法
    'assign' in Object // true

    // 新写法
    Reflect.has(Object, 'assign') // true
  ```

4、 Proxy的方法和Reflect都一一对应，且Reflect获取的是默认的方法，因此可以和Proxy配合使用Reflect方法设置默认行为，再进行相应处理

### 注意点
- 不能作为构造函数或者函数调用
- 所有方法都是静态的（类似Math）

### api
和Proxy可拦截的方法对应



## Symbol

- 为了创建唯一的属性
- 可以获取一些内置属性，比如迭代器属性Smybol.iterator等(https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- 获取对象的smybol key，可以通过`Object.getOwnPropertySymbols`
- 转换为json时key会被忽略
- `Symbol.for()` 方法和 `Symbol.keyFor()` 可以在全局的 symbol 注册表设置和取得 symbol，可以用于创建不同作用域的Symbol防止混用

  ```javascript
  // 获取description为foo的symbol注册表
    var golbalSym = Symbol.for('foo')
    // 获取symbol注册表的description
    Symbol.keyFor(golbalSym)
  ```

**Symbol的应用场景:**
- 一些标记类的属性值，可以用变量和Symbol替换，可以消除魔法字符（即一些逻辑和字符串强关联，这个字符串多处用到）
- Symbol可以用做对象key值，可以设置一些内部方法或者数据，像es就内置了一些方法（迭代器、正则方法等）

https://www.zhangxinxu.com/wordpress/2018/04/known-es6-symbol-function/

## 迭代器
`for val of obj`循环，需要对象有`Symbol.iterator`属性方法，该方法是generator函数，可以通过`.next()`调用，返回包含value和done的对象


### for in和 for of

for in缺点：
- for in是用来遍历对象key值的，会获取到其他手动添加的key值
- 会获取到继承对象

for of优点：
- 解决for in的局限性，iterator相当于接口，不同对象可以定制自己的遍历方法


### 手写迭代器

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


大部分参考于：
https://es6.ruanyifeng.com/#docs