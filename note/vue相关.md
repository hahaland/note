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

## vue初始化页面-修改数据-刷新页面ui的过程

- create阶段，遍历data的属性，通过defineProperty设置getter/setter实现数据劫持，初始化watch、computed，订阅data中的属性，在vm实例上挂在method。
- Compiler 解析模板，生成ast语法树，最后生成对应的虚拟dom，mounted阶段完成
- 修改数据：触发getter后会通知Dep收集到的的依赖。

## 虚拟dom

- 收集数据驱动的变化，进行dom的统一渲染，可以减少性能的损耗（diff算法减少重复的渲染）
- 更好的跨平台，因为虚拟dom本身是js对象，可以由服务端渲染

## 知识点
- data中的属性能通过this.key直接访问是因为设置了代理 ```proxy(vm, `_data`, key)```
- 数组响应式是因为用代理原型，创建对应的数组方法并加上vue的监听
- 组件的name选项：keep-alive的include和exclude需要（keep-alive无法在函数式组件中使用，因为没有缓存）

## 和react的区别

### 监听数据变化不同
vue的dom更新由于getter/setter机制会更精确，而react需要开发者优化

### 模板定义方式不同
- react的jsx更接近js，函数式组件，更灵活，所以也更难掌握
- vue的模板更像html，和指令的结合对简单的功能实现很有帮助

### 虚拟dom的优化
react中组件的变化会影响到所有子组件，需要用shouldComponentUpdate 等方法手动避免，而vue会自动使用diff算法减少不必要的渲染

## 高阶组件

高阶组件的抽象也更难（就是能对组件进行一定处理来提高泛用性）

- mixin，提取公共部分，但是需要知道组件内部结构，可能会有命名冲突，会带来隐式依赖，很难追踪。
- hoc：用一个函数包装组件，不需要对组件进行改动

## vue3
- 组件函数化api,setup函数返回组件对象，函数中共有的部分就可以抽出，相比mixin，ide可以进行代码补全和依赖追踪。
  ```javascript
    <script>
      import { ref, computed, onMounted } from 'vue'

      export default {
        setup() {
          const count = ref(0)
          const double = computed(() => count.value * 2)

          function increment() {
            count.value++
          }

          onMounted(() => console.log('component mounted!'))

          return {
            count,
            double,
            increment
          }
        }
      }
    </script>
  ```
- 全局挂载/配置api的变化：
  ```javascript
    // 原来是在全局Vue对象上添加上
    import Vue from 'vue'
    import App from './App.vue'

    Vue.config.ignoredElements = [/^app-/]
    Vue.use(/* ... */)
    Vue.mixin(/* ... */)
    Vue.component(/* ... */)
    Vue.directive(/* ... */)

    // vue3
    // 需要通过createApp创建，减少第三方对全局对象修改产生的bug
    import { createApp } from 'vue'
    import App from './App.vue'

    const app = createApp(App)

    app.config.ignoredElements = [/^app-/]
    app.use(/* ... */)
    app.mixin(/* ... */)
    app.component(/* ... */)
    app.directive(/* ... */)
  ```

  - 片段：之前template中只能有一个父节点，片段不受限制
  - Suspense： 组件未渲染完成时显示后备组件。
  - v-model可以用在组件上，而且可以指定多个不同的属性。
  - Portals: 可以让子组件的定位不受父组件影响
  - 新的自定义指令api，与组件生命周期保持一致,更加直观
    ```javascript
      //旧的
      const MyDirective = {
        bind(el, binding, vnode, prevVnode) {},
        inserted() {},
        update() {},
        componentUpdated() {},
        unbind() {}
      }
      // vue3
      const MyDirective = {
        beforeMount(el, binding, vnode, prevVnode) {},
        mounted() {},
        beforeUpdate() {},
        updated() {},
        beforeUnmount() {}, // new
        unmounted() {}
      }
    ```