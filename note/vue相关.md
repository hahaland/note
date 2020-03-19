## vue的特点
- MVVM框架：将视图的更新抽象出来，开发者只需要关心业务逻辑的编写，数据变化时，与之相关的视图自动实现更新。
- 虚拟dom：频繁修改dom会严重影响页面性能，vue中数据的改变会先反映在虚拟dom中，每隔一段时间虚拟dom变化的部分就会映射到相应的dom中，比react的性能更好（react由于是jsx实现，每次修改整个dom都会重新渲染）

## 生命周期
- beforeCreate：初始化前
- created： 完成data、computed、watch等的初始化，虚拟dom还不可用（$el）。
- mounted： $el可以使用，但不保证子组件也一起完成挂载，除非在mounted中调用$nextTick
- beforeUpdate：数据更新后，虚拟dom更新dom前调用
- updated：数据更新导致的dom改变后调用
- activated/dactivated：keep-alive缓存的组件激活/停用时调用
- beforeDestroy：实例销毁前调用
- destroyed： 实例销毁后调用（实例销毁：清理与其他实例的链接，子实例的销毁，解绑与dom的联系）

## 数据响应式的实现
核心有三点：
- observe：Object.defineProperty()来定义getter和setter。
- dep： 每个属性都有自己的消息订阅器dep，通过getter收集订阅这个属性的观察者，属性变化时会通过setter通知收集到的观察者
- watcher： 观察者，通过$watch触发getter，订阅该属性。


## 知识点
- data中的属性能通过this.key直接访问是因为设置了代理 ```proxy(vm, `_data`, key)```
- 数组响应式是因为用代理原型，创建对应的数组方法并加上vue的监听