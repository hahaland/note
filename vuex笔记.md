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
默认情况下模块中的action、mutation 和 getter为全局属性，
设置命名空间```namespaced:true```则为局部属性；getter第三个参数可以获取根状态
```javascript
modules:{
  a:{
    namespaced: true,
    state,
    getters: {
      getA(state, getters, rootState) {
        return rootState.num + 1
      } // getters['a/getA']
    }
  }
}
```

在命名空间中注册全局action，需要设置```root:true```，并在handler中定义action
```javascript
actions: {
  someAction: {
    root: true,
    handler(namespacedContext, payload){...}
  }
}
```

模块map方法的批量导入: 将相同模块的路径抽出
```javascript
computed: {
  ...mapState('some/nested/module', {
    a: state => state.a,
    b: state => state.b
  })
},
methods: {
  ...mapActions('some/nested/module', [
    'foo', // -> this.foo()
    'bar' // -> this.bar()
  ])
}
```

```createNamespacedHelpers``` 可以创建特定命名空间的批量导入方法
```javascript
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapActions } = createNamespacedHelpers('some/nested/module')
```

### 模块的动态注册

store创建后，可以使用```store.registerModule```方法注册模块：
```javascript
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapActions } = createNamespacedHelpers('some/nested/module')
```
```store.unregisterModule(moduleName)``` 可卸载动态模块

### 模块重用
当需要创建一个模块多个实例时，为了避免对象浅复制造成引用同个实例：
```javascript
const module = {
  state() {
    return {
      num: 0
    }
  }
  // mutation等类似
}
```


## 项目结构

使用vuex需要遵守以下规则：
- store
- 只能通过mutation改变状态。
- 异步逻辑使用action
```
├── index.html
├── main.js
├── api
│   └── ... # 抽取出API请求
├── components
│   ├── App.vue
│   └── ...
└── store
    ├── index.js          # 我们组装模块并导出 store 的地方
    ├── actions.js        # 根级别的 action
    ├── mutations.js      # 根级别的 mutation
    └── modules
        ├── cart.js       # 购物车模块
        └── products.js   # 产品模块
```

## 插件

store接受plugins选项，为一个函数。接受store为唯一参数:
```javascript
const myPlugin = store => {
  // 当 store 初始化后调用
  store.subscribe(mutation, state) =>{
    // 每次 mutation 之后调用
    // mutation 的格式为 { type, payload }
    if(mutation.type == 'UPDATE_DATA'){
      socket.emit('update',mutation.payload)
    }
  }
}

const store = new Vuex.Store ({
  plugins: [myPlugin]
})
```

## 严格模式
不是由mutation发起的状态变更都会抛出错误

**不要在严格模式启用**，严格模式的深度检测状态数会有性能损耗。