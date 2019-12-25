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
构造函数用于构建实例属性，原型模式用于创建公共属性，但两者分开创建离封装还差点意思
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

由于原型搜索机制，js寻找属性时会沿着原型链一路往上，才得以实现继承，因此原型链末端一定是Object，而**对象的constructor也是通过原型链获取的**，此时instance的constructor为SuperType。
> 因此，确定原型与实例间的关系得使用instanceOf或isPrototypeOf

### 原型链中引用类型的继承

引用类型修改会影响所有原型，可以通过**借用构造函数**,在子类型构造函数中调用超类的构造函数创建引用类型的副本(构造函数本质是在当前作用域新建对象添加属性并返回，只要用call或apply把超类的作用域设为this)，单纯使用这种模式存在无法复用的问题
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

思想是不在改变子类原型时调用超类构造函数，因为只需要继承超类原型里的属性和方法，所以通通过object()创建超类原型副本，代替超类构造函数返回的对象。

```code
  function inheritPrototyoe(subType, superType){
    var prototype = object(superType.prototype) // 创建超类原型副本
    prototype.constructor = subType
    subType.prototype = prototype
  }
```

这种方式是实现基于类型继承最有效的方式
















