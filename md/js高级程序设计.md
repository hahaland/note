# 第二章 在html中使用js

### script标签参数

+ async：立即下载脚本,但不阻塞，即与之后内容并行执行，多个不保证顺序。
+ defer：延迟脚本，文档解析显示完成后再执行（html5规范中defer按先后顺序执行，但实际运行不一定，所以最好只用一个defer）
  > async和defer只对外部文件有效
+ charset：js文件字符集（如utf8）
+ type: 默认text/javascript
+ src：可以是任何域的文件，文件扩展名可以不为.js，但MIME类型需要设置applcation/x-javascript

### 文档模式
> 文档未声明类型时，默认开启**混杂模式**，不同浏览器会存在行为差异

### 标准模式
包括标准和准标准模式 但差异可以忽略不计

```code
<!--标准模式 HTML5-->
<!DOCTYPE HTML>
```

# 第三章 基本概念

### 变量
+ 省略var会创建全局变量
+ 变量提升(使用let可以避免)
```code
console.log(a)
var a = 1
// undefined而不是a is not defined

console.log(b)
let b = 1
// b is not defined
```

### 数据类型

#### typeof操作符

null和对象会返回object,function虽然是对象，但为了更好区分返回的是function，其他则返回undefined，string，boolean，number
> 未声明的变量也会返回undefined
> 引用类型的检测使用[instanceof](#检测类型)

#### Null
本质上，Null是一个空对象指针，所以typeof返回object
> null == undefined // true

#### number类型
+ 0.1 + 0.2 != 0.3
+ 超出范围时转换成Infinity/-Infinity，无法参与运算
+ **isFinite()** 是否有限数
+ NaN != NaN，可用 **isNaN()** 判断，无法转换为number的返回true
  > isNaN(obj)时，先调用obj.valueOf()，不能转为数值则继续调用toString()再转

+ parseInt
  + 遇到第一个非数字字符（除了空格）时停止
  + 第二个参数用于说明value的进制。
  + parseFloat没有第二个参数

#### String类型

+ 一个双字节字符长度是2
+ **toString()** 可以传参，转为对应进制的字符


#### Object类型

+ object实例具有的方法：
  + constructor: 构造函数
  + hasOwnProperty(name: string): 是否拥有某个属性
  + isPrototypeOf(obj：Object): obj是否为实例的原型
  + propertyIsEnumerable(name: string): 属性是否可枚举
  + toLocalString()：与地区相关的对象转换（时间）
  + toString()、vauleOf()

#### 语句

+ with，将代码作用域设置到指定对象中
  > 严格模式下不能使用，with大量使用会影响性能
+ switch 语句比较值时使用的是全等，不会发生类型转换 1 != '1'

#### 函数

+ 箭头函数没有argument参数
+ arguments值与参数内存空间互相独立，但值保持同步
  > 严格模式下不能通过arguments改变参数值
+ 没有重载，重复定义函数即使参数不同也会覆盖

# 第四章 变量、作用域与内存问题
## 基本类型和引用类型的值
### 复制变量
    需要注意引用类型的复制，简单的对象赋值只是赋值对象指针，指针所在内存空间仍是同一个
### 参数传递
    按值传递，由于引用类型的值是地址，函数内部修改的是指针指向的内存空间，外部也会改变
### 检测类型
 
[typeof](#typeof操作符)是检测基本类型的最佳方法(除了null)

**instanceof** 用于检测引用类型 
```code
 person instanceof Object // person是否是object类型
```

## 执行环境及作用域
### 垃圾收集
+ 标记清除：标记变量是否在环境中，每隔一段时间清除未在环境中的变量（因此全局变量需要手动清除）
+ 引用计数： 计算引用的次数，为0时清除，循环引用会导致永远不为0（ie BOM和DOM中的对象使用c++实现，会存在这个问题）
  ```code
  var element = document.getElementById('element')
  var obj = new Object()
  obj.element = element
  element.someObject = obj
  ```

### 小结
+ 基本类型保存在栈、引用类型保存在堆

# 第五章 引用类型

## 数组
  + 操作方法:
    + concat： a.concat(b) b拼接到a后面并返回新数组，不改变原有数组；b不是数组则等价于[...a,b]
    + slice(a,b)：截取 arr[a]~arr[b-a]，b不传默认截取到末尾，为负数则截取至arr[arr.length+b]
    + splice(a,b,[...arr]), a为开始位置, b为删除数量，arr为插入内容，改变原数组

  + 迭代方法（es5）：
    + every：遍历每个item是否符合要求，返回Boolean
    + filter： 过滤符合要求的item，返回数组
    + reduce：累加

## 正则

+ exec：返回matches数组，且包含input和index两个参数，matches为与正则每个子表达式匹配的字符串
+ test: 是否匹配正则

## 函数

+ 表达式与函数声明区别：函数声明会提升，定义的位置不会影响使用
+ arguments.callee指向当前函数，减少函数名的直接使用;arguments.callee.caller，调用当前函数的函数
+ apply、call：apply传的是数组

## 基本包装类型


和引用类型区别： 不通过包装类型声明的值，调用包装类型方法执行时被创建，使用完后销毁
> 需要注意的是，包装类型调用的是new Object(),而不是new String等基础类型，因为Symbol和BigInt无法使用这种方式创建。

### Boolean
  + Boolean(false) && Boolean(false) 为true，对象转boolean为true

### String
+ slice(a,b): a是开始位置，b是长度，a,b为负数都转化为len + b
+ substr(a,b): 和slice的不同是b为负数时b = 0
+ substring(a,b): a是开始位置, b是结束位置，a>b时等价于substring（b,a）,负数会转为0
+ trim(): 删除两边的空格（还有trimLeft、trimRight）
+ toLowerCase()、toUpperCase: 大小写
+ 正则相关：match()和RegExp的参数相反，结果一样；replace、search
+ fromChartCode()，将编码转为字符

### Symbol

> Symbol和BigInt为es6新增对象，无法通过new创建基本类型（其他基础类型可以但不建议这么做，历史遗留问题）

```Symbol(description)```会动态生成一个匿名的唯一值，能作为对象属性的标识符,description只是这个值得描述，不影响symbol的值
特性：
- 不会自动转换为String
- ```Symbol("Sym") == Symbol("Sym")```为false，每个值都是唯一的
- 跨文件，甚至跨域的Symbol，可以通过Symbol.for()或Symbol.keyFor()从全局的symbol注册表获取和设置symbol
- ```Object.getOwnPropertySymbols(obj)```可以获取对象里所有的Symbol属性并返回一个数组。
## 单体内置对象

ECMAScript提供的，不依赖宿主环境的，在程序执行前就存在的对象

### Global对象

+ uri编码：
  + encodeURI(): 不会对本身属于uri（如：/ : #）编码
  + encodeURIComponent(): 对所有特殊字符编码
  + decodeURI()、 decodeURIComponent(): 解码

+  eval(): 执行参数中的代码，作用域与eval一致。（存在代码注入的风险）
+ window
+ Math

# 第六章 面向对象的程序设计

## 理解对象

 ### 属性类型
  + 数据属性
    + Configurable： 是否能删除属性、修改writable（设为false后无法再设为true）
    + Enumerable： 是否可以通过for in遍历
    + Writable： 是否能修改属性的值
    
      ```code
        let person = {}
        // 不传参数时 configurable、enumerable、writabl默认为false
        Object.defineProperty(person, 'name',{
          configurable: false,
          enumerable: false,
          value: 'peter'
        })
      ```
  + 访问器属性
    + writable和value替换为setter、getter
    + 只指定getter则属性无法修改
    > vue的数据绑定通过defineProperty的getter和setter实现，因此只支持ie9+
  
  + **Object.getOwnPropertyDiscriptor()** 可以获取对象属性的*数据属性*和*访问器属性*

### 创建对象
为了解决创建很多同类型对象产生的重复代码，诞生了工厂模式
 #### 工厂模式
 将创建对象封装在函数中
 ```code
  function createPerson (name, age, job){
    var o = new Object()
    o.name = name
    o.age = age
    o.job = job
    o.sayName = function(){
      console.log(this.name)
    }
    return o
  }
 ```
 > 虽然可以大量创建对象，但无法识别对象类型

 #### 构造函数模式
```code
  function Person (name, age, job){
    this.name = name
    this.age = age
    this.job = job
    this.sayName = function(){
      console.log(this.name)
    }
  }
  var person1 = new Person("peter", "12", "student")

  person1 instanceof Person // true
  person1 instanceof Object // true
  person1.constructor == Person // true
  person1.constructor == Object // false
```
与工厂模式的不同
+ 没有显式创建对象 （new操作符创建了对象）
+ 赋值this （此时this指向new的新对象）
+ 无需return
+ 为了区别其他函数，Person首字母大写
+ 可以通过instanceof识别对象类型（constructor只能识别创建的类，不能识别原型链上的父类，且重写原型对象会改变constructor）
+ 箭头函数无法作为构造函数使用

通过new操作符调用构造函数时实际发生的步骤：
1. 创建对象
2. this指向新对象
3. 执行构造函数
4. 返回新对象

> 当构造函数里有如sayName的方法时会重复创建，而这也是不必要的，但把方法转移到外部又违背了封装的初衷，因此出现了原型模式

#### 原型模式

每个函数都有prototype（原型）属性，所有通过同个函数创建的对象都享有prototype里的方法和属性，通过__proto__访问，因此
```code
function Person() {}
Person.prototype.name = 'peter'
Person.prototype.sayName = function (){console.log(this.name)}
```
无需函数内部创建属性即可共用name和sayName

##### 原型对象

新函数都会拥有prototype属性，指向函数的原型对象，而原型对象会获得constructor属性，指向新函数
```code
  person.prototype.constructor // Person
```

+ **isPrototypeOf** 确认是否是对象的原型；**Object.getPrototypeOf** 获取对象原型（可用于实现继承）
+ 当原型与实例存在同名属性时，原型的被屏蔽
+ obj.**hasOwnProperty()** 可以判断属性是否存在于实例
+ Object.**keys(obj)** 可以获取obj中可迭代属性名并返回数组
+ Object.**getOwnPropertyNames(obj)** 获取所有属性名并返回数组

##### 重写原型对象
批量定义原型属性
```code
  person.property = { 
    name：'',
    age: 0,
    sayName: () => {}
  }
```
此时对象的constructor，即person.property.constructor为Object，因此使用instanceOf较为保险（但也可以在对象中定义constructor属性）

#### 动态原型模式
构造函数中构建实例属性，并动态判断是否定义公共属性
```code
function Person() {
  if(typeof this.sayName != 'function')
    Person.prototype.sayName = () =>{}
}
```
这样只会初次执行时初始化sayName

#### 寄生构造函数模式

```code
function SpecialArray (){
    let arr = new Array(...arguments)
    arr.fn = function() {
      return this.join("|")
    }
    return o
}
var arr = new SpecialArray(1,2,3)
arr.fn() // 1|2|3
```
不修改原生类型的构造函数，并自定义方法属性，缺点是对象类型还是原来的类型，无法通过instanceOf确定类型

#### 稳妥构造函数模式
> 稳妥对象: 没有公共属性，其方法也不引用this；适合在一些安全的环境中
```code
function Person (name){
    var o = new Object()
    o.getName = function() {
      return name
    }
    o.setName = function(v) {
      name = v
    }
    return o
}
```
通过闭包封装属性方法，相当于私有变量,通过getter和setter访问设置。

## 继承

### 原型链
*构造函数的prototype->原型对象<-实例的__proto__*
```code
function SuperType() {
  this.property = true
}
SuperType.prototype.getSuperValue = function() {
  return this.property
}
function SubType(){
  this.subProperty = false
}
// 重新制定SubType原型对象，在subType.prototype添加方法相当于子类的定义
SubType.prototype = new SuperType()

SubType.prototype.getSubValue = function() {
  return this.subProperty
}

var instance = new SubType()
console.log(instance.getSuperValue)
```

由于原型搜索机制，js寻找属性时会沿着原型链一路往上，才得以实现继承，因此原型链末端一定是Object，而**对象的constructor也是通过原型链获取的**，此时instance的constructor为SuperType，适用公共属性方法的继承。
> 因此，确定原型与实例间的关系得使用instanceOf或isPrototypeOf

### 原型链中引用类型的继承

为了区分原型与继承对象的引用类型变量，可以通过**借用构造函数**,在子类型构造函数中调用超类的构造函数创建引用类型的副本(构造函数本质是在当前作用域新建对象添加属性并返回，只要用call或apply把超类的作用域设为this)，适用于实例属性方法的继承。
```code
function SubType(){
  SuperType.call(this)
}
```

### 组合继承

原型链和借用构造函数共用互补的模式
```code
function SuperType(name){
  this.arr = [1,2,3]
  this.name = name
}

SuperType.prototype.sayName = function(){}

function SubType(name,age){
  SuperType.call(this, name)
  this.age = age
}

SubType.prototype = new SuperType()
SubType.prototype.constructor = SubType
```

### 原型式继承
创建一个临时的构造函数，将传入的对象作为原型，返回临时构造函数实例化的对象
```code
function object(o) {
  function F(){
  }
  F.prototype = o
  return new F()
}
```
> es5里的**Object.create()** 也是如此，不过多了第二个参数，可以传入自定义的属性对象。本质是对传入对象的浅复制

### 寄生式继承
原型式继承后在对象上添加方法并返回对象，并将这个过程封装

### 寄生组合式继承
>组合继承存在调用两次超类构造函数的情况，，第一次是改变子类原型的时候，第二次是在创建对象时子类构造方法调用call，寄生组合式可以解决这个问题

思想是不在改变子类原型时调用超类构造函数，因为只需要继承超类原型里的属性和方法，
所以通过object()创建超类原型副本，代替超类构造函数返回的对象。

```code
  function inheritPrototyoe(subType, superType){
    var prototype = object(superType.prototype) // 创建超类原型副本，替代原来的new SuperType()
    prototype.constructor = subType
    subType.prototype = prototype
  }
```

这种方式是实现基于类型继承最有效的方式

### 总结
继承思路：
1. 创建超类，公共方法添加到原型（原型链）
2. 创建子类
3. 子类原型指向超类实例，获取超类的实例属性和公共属性（实例属性指每个实例都单独拥有的属性，包括方法）
4. 但指向超类实例，超类中的实例属性是共用的，成为了公共属性，因此需要借用构造函数模式，在子类构造函数中调用超类构造函数，相当于java的super（到此则完成了组合继承）
5. 然而组合继承存在调用两次超类构造方法的问题，而第三步的超类实例中的实例属性已经通过第四步得到，只剩下超类原型中的方法，因此使用寄生式继承 *（即通过新建构造函数，将函数原型指向超类原型（原型式继承），并将构造函数的constructor指向子类（惯例，虽然这个属性好像没什么用））*，创建了一个拥有超类原型方法的构造函数，子类的原型指向它，此为寄生组合式继承。

# 第七章 函数表达式
## 递归
  在函数内部再次调用函数,arguments.callee可以防止函数引用变化寻找不到函数
  ```code
  function factorial(num){
    if(num<=1){
      return 1
    } else {
      return num * arguments.callee(num-1)
    }
  }
  ```
## 闭包
```code
function fn(name) {
  return function(){
    return name
  }
}

var a = fn('peter')
a()
a = null
```
函数内部定义的函数会将包含函数的活动对象添加到作用域链，函数被返回后，活动对象仍然被引用，因此传入的name不会销毁,直到解除引用，这也是闭包可能导致内存占用过多的原因

活动对象中存放的变量是可变的，若要保存每个阶段的值，可以使用闭包创建不同的活动对象
```
function createFn() {
  let result = []
  for(var i = 0;i<10;i++){
    result[i] = function(num){
      return function(){return num}
    }(i) // 执行函数创建了活动对象，此时result里的i都是不同的
  }
  return result
}
```

### 私有变量

在构造函数内创建变量和方法，并在this添加一个访问内部变量的方法，这种方法称为**特权方法**

### 静态私有变量
 通过私有作用域中创建变量，并在原型定义访问变量的方法即可创建。
 ```
 (function(){
   var privateName = 0
   Person.prototype.getName = function() {
     return privateName
   }
 })
 ```
 ## 模块模式

 # 第八章 BOM

 ## window对象

 ### 全局作用域
 + 全局变量与window上直接定义对象的区别是全局变量无法删除（configurable为false）

 ### 窗口关系及框架

 window.frames，页面中框架（frame/iframe）的集合
+ top对象指向最外层框架，即浏览器窗口，window只是当前框架的实例
+ parent对象指向上层框架，没有则等于top

### 窗口位置
+ ie、safari、opera、chrome：screenLeft和secreenTop
+ firefox、chrome、safari：screenX和screenY
+ moveTo,移动到指定位置；moveBy移动指定距离（可能会被浏览器禁用，且不适用与框架）

### 窗口大小

+ 视口大小：
  + window.innerWidth/innerHeight (ie9+)
  + document.documentElement.clientHeight/clientWidth(ie6 标准模式)
  + document.body.clientHeight/clientWidth(ie6 混杂模式)
  + resizeTo/resizeBy 调整浏览器窗口大小
+ 跳转页面
 + window.open( url,target,spec,replace )，打开窗口并返回指向新窗口的引用
    + target: 
      + _self 替换当前页
      + _parent 加载到父框架
      + _top 替换任何可加载的框架集 
      + _blank新的窗口
    + spec： 新窗口的属性（如大小位置等）
    + replace： 历史记录是否改为当前页
  + window.close可以关闭窗口（当前页面为弹出的页面或窗口引用）

### 系统对话框
  + alert()：警告对话框
  + confirm(str)： 询问对话框，返回boolean
  + prompt： 提示输入对话框，传入提示与默认输入框的值

## location对象
+ hash：url中#后面的字符串
+ host：域名及端口号
+ hostname：域名
+ href: 完整url
+ pathname：目录
+ port： 端口
+ protocol： 协议（http:或https）
+ search: url参数（带问号）
这些属性都可以修改，修改后会重新加载
### 位置操作
+ assign(url): 打开新url并生成历史记录，和修改href值一样

## navigator对象
存放浏览器信息的对象

## screen对象
获取屏幕相关的属性
## history对象
+ go(index): 回退或前进（也可以用back和forward）

<!-- # 第九章 客户端检测 -->
# 第十章 DOM
## 节点层次
### Node类型
DOM1级定义了Node接口实现DOM中的所有节点类型，nodeType表示节点类型

+ nodeName和nodeValue
+ childeNodes保存着子节点，为NodeList对象，不属于Array
+ parentNode：父节点
+ previosSibling/nextSibling：访问上/下一个同级节点
+ appendChild：添加子节点
+ insertBefore：添加子节点（头）
+ replaceChild（new，old）： 替换子节点
+ removeChild： 删除子节点
+ cloneNode(boolean)： 复制节点，false只复制当前节点，true则包括子节点

### Document类型
+ document.documentElement指向html
+ document.body指向body
+ document.domain: 域名，可以改为上级域名，不能改为子域名
+ geElementById/getElementsByTagName/getElementsByClassName

### Element类型
1. 基本特征
+ nodeType == 1
+ nodeName 为标签名
+ nodeValue为null

2. 操作特性的方法：
+ getAttribute()/setAttribute/removeAttriable

3. 创建元素: createElement()
  创建文本节点： createTextNode()

### Comment类型
即注释类型```<!-- comment -->```
+ nodeType为8
+ nodeName为#comment

### DocumentType类型

文档类型,可以通过document.doctype获取

# 第十一章 DOM扩展

## 选择符API
### querySelector()/querySelectorAll()
获取的是dom元素的快照，是静态的，而getElementByxxx获取的是动态的，指向真实dom元素。

## 元素遍历
以下方法不返回文本节点(文本或注释)
+ childElementCount: 子元素个数
+ firstElementChild： 第一个子元素
+ lastElementChild: 最后一个子元素
+ previousElementChild: 前一个同辈元素
+ nextElementChild:  后一个同辈元素

## html5
### classList类名列表
  + value：等同于className，影响当前元素所有类名
  + add()、contains()、remove()、toggle(): 添加类、是否包含类、删除类、有删除没有添加

### 焦点管理：
  + document.activeElement：始终引用当前获得焦点的元素（文档加载完默认是body，加载中为null）
  + document.hasFocus(): 确定文档是否获得焦点

### HTMLDocument变化
  - readyState属性：
    - loading： 文档加载中
    - complete：文档加载完成
  - compatMode: 兼容模式，标准模式下为 *CSS1Compat*，混杂模式为*BackCompat*
  - head属性： 引用head标签
  - charset： 字符集属性
  - 自定义数据属性：
    ```
      // DOM
      <div data-appId="123" data-myname="aaaa">

      element.dataset.appId == '123' 

    ```
### 插入标记
#### innerHTML:
  - 读，返回调用元素的所有子节点（包括元素、注释和文本节点）
  - 写，将传入字符串解析为html文档
  - 不支持的元素：frameset、head、html、stle、表格相关标签
#### outerHTML：
  与inner不同的是会返回当前元素层级
#### insertAdjacentHTML：
插入元素

  参数：beforeBegin/afterBegin/beforeend/afterend


> 采用这些方法直接修改或删除节点，节点绑定的事件和属性需要手动删除解除引用
### scrollIntoView
传入true：让调用元素顶部尽可能与视口顶部持平

传入false： 尽可能与底部齐平
## 专有扩展
### 插入文本

#### innerText
获取节点所有文本内容，或替换所有子节点为文本（html语法字符会进行转义）
#### outerText
包括当前节点

### 滚动
- scrollIntoViewIfNeeded(alignCenter): 当前元素不再视口时才会滚动，alignCenter为true时会尽量居中（safari和Chrome）

# 第十二章 DOM和DOM3

## 样式
### 访问元素样式
#### DOM样式属性和方法
style对象的属性方法：
- cssText： 获取所有style中不为空的样式字符串，与className类似
- length：css属性数量
- parentRule： 表示css信息的cssRule对象
- ...

### 元素大小

#### 偏移量
- offsetHeight: 垂直方向占用的空间大小（包括元素高度、水平滚动条高度、边框）
- offsetWidth：水平方向占用的大小（包括元素宽度、垂直滚动条宽度、边框）
- offsetLeft：元素左外边框到包含元素左内边框距离
- offsetTop: 同上

> offsetLeft和offsetTop与包含元素有关，包含元素不一定是parentNode
#### 客户区大小
指元素出去边框所占据的大小，clientHeight、clientWidth

#### 滚动大小
- scrollHeight：元素总高度
- scrollWidth： 元素总宽度
- scrollTop： 滚动区域隐藏的顶部内容高度
- scrollLeft： 滚动区域隐藏的左边内容宽度

> 确定文档总高度时取scrollHeight与clientHeight中的最大值，以消除浏览器间的差异

#### 确定元素大小

getBoundingClientReact() 返回包含x，y，top，left，right，bottom的对象

## 遍历

dom中的遍历为深度优先遍历

### NodeIterator
dom节点迭代器，document.createNodeIterator(),四个参数：
- root： 搜索起点
- whatToShow： 访问那些节点的数字代码，在NodeFilter中定义
- filter：NodeFilter对象或过滤函数
- ~~entityReferenceExpansion~~: 是否扩展实体引用，html页面用不到

### TreeWalker
NodeIterator加强版，使用document.createTreeWalker()创建，除了有NodeIterator的功能外还有：
- parentNode(): 遍历到当前节点的父节点
- firstChild()： 第一个子节点
- lastChild(): 最后一个子节点
- nextSibling(): 下一个同辈节点
- previousSibling(): 上一个同辈节点

> ie中没有对应方法

## 范围
### DOM中的范围
待续
<!-- createRange()创建范围Range实，包含以下属性
- startContainer：包含范围七点的七点
- startOffset -->

# 事件
DOM2级事件流包含三个阶段：捕获阶段、目标阶段、事件冒泡
## dom2级事件处理
addEventListener（type，option，userCapture），removeEventListener
- 添加的匿名事件无法删除
- userCapture： 默认为false，表示冒泡阶段才响应
- ie7/8中事件方法为attachEvent和detachEvent

## 事件对象
- type属性表示事件类型
- currentTarget表示当前处理事件的元素，即绑定事件的元素
- target： 实际触发事件的元素
- 事件处理程序中，this指向currentTarget
- cancelable，是否可以取消事件默认行为
- eventPhase， 调用事件处理程序的事件阶段
- preventDefault()：取消事件默认行为
- stopImmediatePropagation(): 取消事件的进一步传递，同时阻止相同事件类型的侦听器被（dom3）
- stopPropagation()：取消事件进一步传递

## 内存和性能

### 事件委托
利用冒泡，在最外层指定一个总的事件处理程序，减少事件绑定。

### 移除事件处理程序
使用innerHtml时只清除节点并没有清除事件，需要手动删除

## 模拟事件
```
//创建事件对象
var event = document.createEvent('MouseEvents')
//初始化事件
event.initMouseEvent('click', true,true,document.defaultView,0,0,0,0,0,false,false,false,false,0,null) // 事件类型 是否冒泡 是否可取消  关联视图 detail screenX screenY clientX clientY 是否按下ctrl 是否按下alt 是否按下shift 是否按下meta 按下哪个鼠标键(整数) 与事件相关的对象（只在模拟mouseover和mouseout时使用）

btn.dispatchEvent(event) // 触发事件
```

# 表单
## 表单的基础知识
- acceptCharset ： 服务器能够处理的字符集
- action：接受请求的URL
- elements：表单控件集合
- enctype： 请求的编码类型
- length： 表单控件数量
- method： http请求类型，get或post
- name： 表单名称
- reset()： 将表单重置为默认值
- submit()： 提交表单
- target： 发送请求和接受响应的窗口目标

获取表单元素的方式
- 通过getElement获取
- document.forms[index]
- document.forms[name]

### 提交表单
点击提交时可通过绑定submit事件判断参数，通过preventDefault阻止表单提交

### 重置表单
设置按钮或input的type为reset，触发时会恢复页面刚加载完毕是的初始值

### 表单字段
表单元素拥有额外的elements属性，为表单字段集合，可以通过name获取一类表单字段。
#### 共有的表单字段属性
- disabled： 当前字段是否被禁用
- form： 指向所属表单
- name： 表单字段名称
- readOnly： 是否只读
- tabIndex： 当前字段切换序号
- type： 字段类型，如checkbox、radio
- value： 提交给服务器的值。对文件字段来说只读。

#### 选择文本

获取焦点并全选
```
var selectBox = document.forms[0].elements['location']
selectBox.select()
```


#### 过滤输入
html5文本字段有pattern属性，可以设置正则

