# react组件通信
## redux相关

### redux链路
- createStore创建存储中心
- reducer管理不同的action对应的操作
- 对应的action函数，接收一个dispatch方法，调用dispatch触发对应的reducer
- 然后通过`Provider`将store放到顶层，如果子组件需要则自己关联
- 接下来需要关联想获取或者改变store的组件，通过`connect(mapStateToProps, mapDispatchToProps)(Component)`，将store和dispatch添加到组件props中
- 如果路由是懒加载，那reducer的插入时机需要在组件创建时添加
### redux-thunk
可以传入异步的action，需要使用applyMiddleware引入redux-thunk

## context

- 顶层使用provider，子组件用consumer包裹后可以获取到context
- 就近获取context，class Component通过`contextType`取值，函数组件则可以通过函数传参的方式在自行组装

## mobx
- action: 改变状态的动作函数
- store 管理state和action
- observer 监听属性， autorun、Reaction 设置监听函数

响应式监听

### 和redux区别
- redux store是不可变对象，mobx可以直接更新对象
- redux的数据变化比较清晰可见，在哪触发的变化，触发了什么变化都很容易知道，还有相应的插件能跟踪状态和回溯变化
- ssr的支持redux更完善