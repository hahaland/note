# Vue3笔记
### 侦听器
#### watch

- 监听响应式对象的属性

    需要一个 getter 函数
    ```javascript
        // getter 函数
        watch(
            () => x.value + y.value,
            (sum) => {
                console.log(`sum of x + y is: ${sum}`)
            }
        )
    ```
#### watchEffect
- 相比watch，不需要手动指定依赖，watchEffect初始化时会先执行代码，这个过程中还会自动收集依赖
  
#### watchPostEffect

watch和watchEffect的**调用时机**都在**Vue组件更新前**，因此获取到的DOM是更新前的
```javascript
watch(source, callback, {
  flush: 'post'
})
watchEffect(callback, {
  flush: 'post'
})
watchPostEffect(() => {
  /* 在 Vue 更新后执行 */
})
```
添加`flush: 'post'`或者使用`watchPostEffect`可以获取到更新后的DOM

#### 侦听器的卸载

在异步函数中添加的侦听器由于脱离了组件创建周期，并不会挂载到组件上，因此组件卸载后并不会随之自动卸载，需要手动卸载

### 组件相关
- 通过`defineProps`声明props
- `defineEmits`声明emit
- `defineExpose` 声明要暴露到ref的属性
- `useSlots`和`useAttrs`获取slots和attrs
- 普通的`<script>`标签，场景：
  - 需要在模块作用域执行，但只需执行一次
  - 声明模块的具名导出 （？？？）
  - 声明无法在 `<script setup>` 中声明的选项，例如 inheritAttrs 或插件的自定义选项。（？？？）
- 透传atributes

    - 

### 深入响应式系统
响应式的大致实现：

- 通过 `reative` 方法为变量创建`proxy`对象，以追踪变量的更改
- `proxy`的 `get` 方法会调用`track`方法收集副作用，`set`方法调用`trigger`触发 `track` 收集到的副作用
- 在运行副作用时，会有一个外层的变量保存当前副作用，即 `activeEffect`，`track` 内部将activeEffect添加到相应的`target-effect`数组中
    ```javascript
        // 在运行副作用前，外层的whenDepsChange会将effect保存到activeEffect
        let activeEffect

        function track(target, key) {
        if (activeEffect) {
            const effects = getSubscribersForProperty(target, key)
            effects.add(activeEffect)
        }
        }
    ```
- `trigger` 会根据target获取对应的数组，依次执行
- 副作用函数被`watchEffect`或者`computed`等函数包裹，有点类似下面的`whenDepsChange`方法，用来收集副作用

    ```javascript
        function whenDepsChange(update) {
            // 创建了一个函数，包裹了副作用函数，并存放到activeEffect，供track引用
            const effect = () => {
                activeEffect = effect
                update()
                activeEffect = null
            }
            effect()
        }
    ```

参考：
https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#how-reactivity-works-in-vue

*上述只是大概的过程，批量更新、渲染机制待补充*

#### 外部的状态管理系统
一些外部状态管理也是使用proxy，直接集成会有冲突，可以使用`shaollowRef`，放在除`value`的值中

比如：

**1、不可变数据**

不可变数据，用来提升数据结构复杂情况下的操作性能

推荐使用`Immer`，侵入性较小

```javascript
    import produce from 'immer'
    import { shallowRef } from 'vue'

    export function useImmer(baseState) {
        const state = shallowRef(baseState)
        const update = (updater) => {
            state.value = produce(state.value, updater)
        }

        return [state, update]
    }

```
### 渲染机制

与react的虚拟dom树不同，vue不需要通过遍历比较新旧虚拟dom树来获知需要更新的节点，vue在编译层面优化来提升性能：

1、静态提升

- 与响应式无关的vnode节点会被提升至渲染函数之外，比较差异时也会跳过，渲染时也不会重新创建
- 当连续的静态元素较多，会保存为字符串，通过innerHtml提升创建速度，之后重用也会使用 `cloneNode()` 方法


2、更新类型标记

编译时对节点可能需要更新的类型合并成数字，通过位运算精确更新相应属性

3、树结构打平

简化虚拟dom树结构，只保留需要追踪的节点，比如:
```html
<div> <!-- root block -->
  <div>...</div>         <!-- 不会追踪 -->
  <div :id="id"></div>   <!-- 要追踪 -->
  <div>                  <!-- 不会追踪 -->
    <div>{{ bar }}</div> <!-- 要追踪 -->
  </div>
</div>
```

树最终只会剩下id和bar相关的节点，减少了层级和数量

### 一些注意事项

- 因为使用proxy，所以只能监听对象，基础类型需要使用`ref`。(语法糖`$ref`可以简化`.value`的写法，不过还是实验性功能)
- 由于使用proxy代理，原对象和响应对象不再强相等(`===`)
- v-if和v-for同时使用时，由于v-if优先级更高导致获取不到v-for的数据，可以使用template先包一层
    ```html
        <template v-for="todo in todos">
            <li v-if="!todo.isComplete">
                {{ todo.name }}
            </li>
        </template>
    ```
    
