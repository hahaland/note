# 深入浅出Nodejs
## 一、Node简介

### 为什么选择javascript
创建node的作者目标是开发事件驱动、非阻塞I/O的语言，js无疑满足要求
- 开发门槛低（相比c语言）
- 基于事件驱动
- 后端历史包袱少，使用非阻塞I/O（相比Lua）
- 高性能（相比ruby）

### node特点
- 异步I/O
- 事件与回调函数，需要对业务划分和流程控制
- 单线程，为了解决大计算量问题，使用子进程解决（对应web端的Web Worker）
- 跨平台，通过Libuv实现windows兼容

### 应用场景

#### I/O密集型
利用事件循环机制处理，不需要启动一个线程对应服务一个请求

#### CPU密集型业务
书中一个斐波那契数列的计算时间表格展现了node的计算能力，证明v8实现的node性能不弱，但还是存在长任务和大型计算占用CPU时间片，导致阻塞的场景，这时就需要对任务进行分解，使用C/C++库优化计算速度，还有使用子进程利用多核cpu

#### 兼容遗留系统？
#### 分布式应用？

## 二、模块机制

### 2.1 CommonJS规范

#### 2.1.1解决的问题
- js没有模块系统
- 标准库很少
- 没有标准接口
- 缺乏包管理系统

#### 2.1.2 CommonJS的模块规范
##### 模块应用
```javascript
  var math = require('math')
```
##### 2.1.3模块定义
```javascript
  export.add = function () {
    return 0
  }
```
### 2.2 模块的实现
node中引入模块需经历三个步骤
- 路径分析
- 文件定位
- 编译执行

node中的模块分两类：node提供的模块，称为核心模块；用户编写的模块，称为文件模块
- 核心模块已经在node源代码编译过程中编译成二进制执行文件，node进程启动时会直接加载进内存，所以只有路径分析的步骤，并且优先判断

#### 2.2.1 优先缓存加载？
引入过的模块会以类似浏览器静态资源的方式进行缓存

#### 2.2.2 路径分析和文件定位
1. 标识符的分析：
- 核心模块

  优先级次于缓存加载，同名的自定义模块不会加载成功，需要更换路径
- 路径形式的文件模块

  以..和/开始的标识符；

- 自定义模块

  首先需要了解**模块路径**，即node定位文件模块的查找策略，具体表现为一个路径组成的数组。规则如下：
  - 当前文件目录的node_modules下
  - 父目录下的node_modules目录
  - 父目录的父目录的node_modlues
  - 往上递归查找node_modules

2. 文件定位
- 文件扩展名的分析

  不输入.js等文件扩展名的话，会以.js、.json、.node的顺序补全，依次尝试，输入扩展名能提升解析速度
- 目录分析和包
  查找过程有可能的不到文件，但却能的到一个目录，


### 2.2.3 模块编译
编译过程中，node会对文件进行包装，比如：
```javascript
(function(exports,require,module,__filename,__dirname)) {
  var math = require('math')
  exports.fn = function () {}
}
```
这样能实现作用域隔离。

之后会通过`vm.runInThisContext(code)`(类似eval，但是具有明确上下文)
#### 2.3.1 JavaScript核心模块的编译过程

1、转存为c/c++代码

node通过v8附带的`js2c.py`，将内置js代码（src/node.js和lib/*.js）通过`字符串数组`的形式保存在`node_natives.h`头文件中，好处是启动时代码已经加载到内存。

2、编译JavaScript核心模块

与文件模块的区别： 获取代码的方式、缓存执行结果的位置
- 首先通过`process.binding(moduleName)`加载代码
- 编译成功后缓存带`NativeModule._cache`(文件模块是在`Module._cache`)


## 3 异步I/O
同步执行的代码，遇到I/O操作时会阻塞，浪费时间与资源
### 3.2.3 现实的异步I/O
windows通过IOCP实现，其他环境则是*nix（自定义线程池）

### 3.3 node的异步I/O
#### 3.3.1 事件循环
进程启动后，node会创建一个类似`while(true)`的循环，每次循环成为`Tick`，每次`Tick`判断是否有事件，有的话会取出事件及相关回调函数，执行完成后，进入下一个`Tick`，当没有事件时，结束进程.

#### 3.3.2 观察者

是否有事件处理是通过询问观察者.比如文件I/O观察者，网络I/O观察者，这些观察者对事件进行了分类。

事件循环是一个典型的`生产者/消费者模型`，异步I/O、网络请求等则是事件的生产者，这些事件被传递到对应的观察者，事件循环则从观察者消费事件

#### 3.3.3 请求对象

异步函数从发出调用，到回调的执行过程如下（`fs.open`方法举例）会产生

1、调用阶段

- 执行时会创建`请求对象`,文件类型是 `FSReqWrap` ，包含参数和要执行的方法，回调函数被设置在该对象的`oncomplete_sym`属性上
- 调用`QueueUserWorkItem`方法，将请求对象push到线程池等待执行
- javascript调用立即返回，继续执行后续代码。
#### 3.3.4 执行回调
2、执行阶段
- 线程可用时，执行线程池中的请求对象对应的方法
- 将执行结果放入请求对象中
- 调用`PostQueuedCompletionStatus`通知 IOCP ，告知对象操作完成，并归还线程到线程池
- 事件循环中，I/O观察者调用`GetQueuedCompletionStatus`检查线程池中是否有执行完成的请求对象，将完成的加入队列中当做事件处理
- 执行事件队列中的回调

#### 3.3.5 小结

异步io关键词： 单线程、事件循环、观察者、io线程池
node的单线程：指的是js代码执行单线程，io通过多线程并行，这也是node处理高并发高效的原因，高并发实际上就是处理大量网络io

### 3.4 非IO的异步APi
包括setTimeout、setInterval、setImmediate、process.nextTick。


#### 3.4.1 定时器
过程如下：
- setTimeout、setInterval 创建的定时器会被插入`定时器观察者`内部的红黑树
- 每次Tick执行时会在红黑树中迭代取出定时器对象，检查是否超过时间，超过就形成一个事件，并执行回调函数

***上述过程可以看到定时器的时间并不精确，最近一次的事件循环占用时间过长会导致超时***

#### 3.4.2 

#### 3.4.3 process.nextTick 与 setImmediate

上述所有异步的执行顺序，参考下图（***https://nodejs.org/zh-cn/docs/guides/event-loop-timers-and-nexttick/***）
```
// 每个框被称为事件循环机制的一个阶段
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```
- timers：定时器，setTimeout() 和 setInterval() 的调度回调函数
- pending callbacks：挂起的回调，比如，TCP套接字尝试连接时收到ECONNREFUSED，某些*nix系统希望等待报告错误，会在这个阶段执行
- idle, prepare： Node内部的闲置和预备阶段
- poll：轮询，计算应该阻塞和轮询 I/O 的时间，处理该时间段内轮询队列里的事件（比如I/O回调），
  - 如果队列未空，但未超过时间，且之前setImmediate添加了回调，则立即结束，到check阶段
- chec: 执行setImmediate的回调
- close回调：执行一些关闭的回调函数

而上述每个阶段，可以理解为浏览器的宏任务队列，而nextTick和promise的回调则是微任务，宏任务执行完后执行微任务队列里的，但是和浏览器有不同的地方：
- 每个阶段执行完后会检查微任务队列
- 浏览器的微任务队列只有一个，按先进先出的顺序执行，而node会区分类型，比如nextTick queue、promise queue，nextTick优先级更高。
``` javascript
// 这段代码,timer中的宏队列有两个回调，会先执行第一个timeout，然后执行nextTick和promise队列里的回调，再执行下一个timeout
function fn() {
  setTimeout(() => {
    console.log('timeout', 0)
    process.nextTick(() => {
      console.log('nextTick')
    })
    new Promise((resolve) => {
      resolve()
    }).then(res => {
      console.log('Promise resolve')
    })
  }, 0)

  setTimeout(() => {
    console.log('timeout', 1)
  }, 0)
}
```
可以看到setImmediate是在check阶段执行;而nextTick，则是在每个阶段结束时检查










