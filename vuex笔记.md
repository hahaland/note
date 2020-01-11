## 引入
需要Vue.use引入Vuex
```javascript
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

new Vue({
  store: new Vuex.store({
    state: {
      num: 0
    }
  })
})
```
引入后可在全局通过```this.$store.state```调用

## 核心概念
### state
在组件中可以使用computed监听state的变化
```javascript
computed: {
  num() {
    return this.$store.state.num
  }
}
```
**为了简化写法可以使用```mapState(['num'])```(直接得到同名的属性),可以指定多个属性：**
```javascript
computed: {
  ...mapState({
    num: state => state.num,
    num1: 'num' // 字符串为键值名
  })
}
```
### getter
一些需要依赖与state的全局属性或方法可以在store的getter中设置
```javascript
store: new Vuex.store({
  state: {
    num: 0,
    nums: [1,2,3]
  },
  getters: {
    numsFormat(state,getters){ // getters可以获取其他getter属性
      return state.nums.map(item => item + 1)
    }
  }
})
```
mapGetters与mapState类似

## Mutation
- 先在 ```mutatuin``` 中的定义方法（相当于注册时间）
  ```javascript
  store: new Vuex.store({
    state: {
      num: 0,
    },
    mutations: {
      add(state,payload) {
        state.num++
      }
    }
  })
  ```
- 通过 ```store.commit('method', payload)``` 触发
- mutation中参与的state属性需要初始化（响应式），引用对象增加属性使用```Vue.set(obj, 'newPro', value)```,或者重新创建对象
- 可以通过常量定义方法
 ```javascript
 const ADD = 'add'

 mutations:{
   [ADD]: (state){
     // mutate state
   }
 }
 ```
 - mutation 必须是同步函数，devtool才能确定mutation的前后状态
 - mapMutations 与前面类似
  ```javascript
  methods: {
    ...mapMutations({
      mapAdd: 'add' // 相当于添加了mapAdd(payload)方法
    })
  }
  ```

## Action
mutation用于同步方法，action适用于异步方法，action中包含着mutation
```javascript
actions: {
  add(context) {
    setTimeout(() => {
      context.commit('add', payload)
    },1500)
  }
}
```

context与store有相同方法和属性；也可以用解构简化代码：
```javascript
add({commit}){
  setTimeout(() => {
    commit('add', payload)
  },1500)
}
```
### 分发action

action通过store.dispatch触发
```store.dispatch('add')```

## Module
 Vuex允许将store分割成模块，每个模块都可以拥有上面的属性
```javascript
const moduleA = {
  state: {
    num: 0
  }, 
  mutations: {
    add(state){
      // mutations和getters的state为模块a的state
    }
  },
  actions:{
    add({state, commit, rootState}){
      // rootState为根节点状态
    }
  },
  getters: {
    numGetter(state, getters, rooState){
      // getter第三个参数为rooState
    }
  },
}

const store = new Vuex.Store({
  modules: {
    a: moduleA
  }
})
```
默认情况下模块中的action、mutation 和 getter为全局属性，命名空间可以设置为局部属性
```javascript
modules:{
  a:{
    namespaced: true,
    state,
    getters: {
      getA() {...} // getters['a/getA']
    }
  }
}
```
> 我的理解是，mutation负责修改状态，action是为了修改状态需要做的事