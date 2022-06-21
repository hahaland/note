# react笔记
- `this.setState()`改变属性值
- 自定义组件通过`this.props.on[event]`触发父组件绑定的事件
- `shouldComponentUpdate(nextProps, nextState)`来判断是否更新组件, 如果使用浅比较可以继承原生`React.PureCompoent`
- 修改state中的引用类型（比如数组和对象）时需要创建新的类型（{...obj}/ [...arr]），因为react只能浅比较，如果处理深层的嵌套对象，可以使用
    > vue是通过proxy和重写数组方法监听深层的改变。
- 函数式组件：如果没有内部的state，使用函数创建组件更方便
    ```js
        function Square(props){
            return (
                <button
                className="square"
                onClick={() => props.onClick()}>
                {props.value}
                </button>
            );
        }
    ```
    
- 表单元素通常由state维护，通过绑定元素value与监听变化同步（相当于`v-model`），也能用ref的方式绑定表单减少代码，但不容易维护（`React.createRef`）

- react中的props可以是任何的值，可以约定props的属性，传jsx实现插槽slot的功能。
- React.Fragments可以将多个jsx分组而不会创建新的节点，可以用便捷语法`<></>`

## 派生state

即子组件的state对应props的某些属性，属性改变时state也要相应改变。

> 避免使用派生state和props更新时的生命周期函数（`getDerivedStateFromProps、componentWillReceiveProps`），代码不清晰且难以维护。

如果要使用，需要注意一些问题：
- 派生state在内部也有方法触发更新，调试时难以确定更改源头。

## 组件设计
- 设计组件时，重要的是确定组件是受控（通过父组件的props控制）还是非受控的（组件内的state可以自行变化）。
- 尽量实现一个受控的组件，由父组件的props统一控制，可以在父组件中管理`state.drafValue`和`state.committedValue`来控制子组件的值。
- 不受控的组件更新
    - 可以绑定key（比如id），key改变时相当于初始化state
    - 只更改某些字段
    - 使用ref

## 组件复用
### 组合
通过porps传递jsx来组合组件，相当于插槽

### render prop
> 组合组件的缺点是没法使用父组件的数据，这时可以使用render prop将参数传入

Mouse组件接受一个render参数，一个可以返回组件的函数，比如
```js
    class MouseTracker extends React.Component {
        render() {
            return (
                <div>
                    <h1>移动鼠标!</h1>
                    <Mouse 
                        render = {mouse => (
                            <Cat mouse={mouse} />
                        )}
                    />
                </div>
            );
        }

        renderCat(mouse) {
            return <Cat mouse={mouse} />
        }
    }
    // mouse组件
    class Mouse extends React.Component {
        render(){
            <div>
                {this.props.render(this.state)}
            </div>
        }
    }
```
Mouse执行render在自己内部渲染外部的组件，还能将需要的参数传入，实现复用。

> 需要注意的是，每次父组件重新渲染，匿名函数都不一样，所以会重新生成组件，所以Mouse组件继承`PureComponent`时并没有用，可以在Mousetracker中定义一个函数，比如`renderCat`；而当props不是静态的，就应该继承React.component。

> render props一般用来封装一些公共行为（比如浏览器相关的鼠标点击），更关注功能的实现，组件的state供传入的子组件任意组装。
### HOC
高阶组件，一个将组件转换为新组件的函数
- 不修改传入的组件，同构将组件包装在容器中组合成新的组件
- 使用hoc有个约定俗成的规则，

### HOOK
React 16.85的新增属性，在不编写class的情况下使用state等react特性
#### 解决的痛点
- 一些相关逻辑往往需要拆分在不同的生命周期函数中
- 旧的复用组件方式需要`重新组织组件结构`，还会导致`层层嵌套`
#### 怎么使用
- useState会返回state和更新state的函数，和this.setState不同，useState细粒度更高，相当于创建this.state中的变量,所以每次改变都会替换原来的，而不是合并
    ```js
        import {useState} from 'react'
        function example() {
            const [count, setCount] = useState(0)
            return (
                <div>
                    <p>You clicked {count} times</p>
                    <button onClick={() => setCount(count + 1)}>Click me</button>
                </div>
            )
        }
    ```
    点击按钮时触发setCount函数，改变state 重新渲染组件。
- useEffect 用于执行副作用的操作（数据获取/设置订阅/手动更改 React 组件中的 DOM），可以看作是`componentDidMount`，`componentDidUpdate` 和 `componentWillUnmount` 这三个函数的组合。

    useEffect返回一个函数时，react会在组件卸载时执行函数，可以用来清楚订阅
- 自定义Hook，用来抽出重复的逻辑，必须要以use开头才能保证其中的hook运行
- useMemo，会在渲染期间执行，仅在某个依赖改变时重新计算
- useRef, 返回一个ref对象，可以绑定jsx中的dom，也可以绑定任何可变的值，比如`intervalRef.current = id`
- useImperativeHandle， 

## Context
创建一个组件树的上下文，方便不同层级的组件访问一样的数据，使用的场景有管理当前locale theme等
- React.createContext(value), 创建上下文，value为默认值，返回一个包含Provider和Consumer组件的对象，通过render prop传入组件
- 可以给组件添加`contextType`，在组件中通过`this.context`调用
- 可以在context中加入回调函数来通知顶层修改context
- 设置`Context.displayName`便于在devtool中查看
- context的变化触发Consumer的刷新不受`shouldComponents`的影响

## 错误边界
设置错误边界可以捕获子组件的js错误（不包括自己的错误/异步操作/事件错误），渲染备用 ui
- 设置`static getDeviceStateFromError()`控制显示备用ui
    ```js
        static getDerivedStateFromError(error) {
            // 更新 state 使下一次渲染能够显示降级后的 UI
            return { hasError: true };
        }
    ```
- 设置`componentDidCatch()`处理错误信息
- React 16之后，发生错误的组件树会被整个移除


## react 17新特性
https://zh-hans.reactjs.org/blog/2020/10/20/react-v17.html
### jsx的使用
使用jsx不需要导入 react，编译时会自动插入

### 事件委托的变更

事件不再挂载到顶层的document，而是react组件树的root节点

旧版本中react事件中，要阻止document的原生事件需要通过 `e.nativeEvent.stopImmediatePropagation`阻止，17之后使用`e.stopPropagation`就行了

### 移除事件池

旧版的事件对象在事件结束后会被回收，因此异步里调用`e.xx.xx`会报错，新的不在回收，交由浏览器完成垃圾回收

一些事件的修改：
- onScroll 事件不再冒泡
- onFocus 和 onBlur切换为原生的focusin、focusout 
- 捕获使用的浏览器的捕获监听

### 副作用清理时间
旧版本中，组件卸载时，清理函数会同步执行，可能会阻塞渲染，但这些代码大都没有同步执行的必要性，现在useffect回调会在渲染后异步执行，如果想同步进行可以使用 `useLayoutEffect`，相当于componentDidUpdate或didMount

https://github.com/yaofly2012/note/issues/149

## react 18新特性

### 1、并发渲染 （Concurrent React ）
- 渲染可中断，以提升页面流畅度

### 2、服务端渲染api更新 
以完全支持服务器上的 Suspense 和流式 SSR
- renderToNodeStream -> renderToPipeableStream
- 新增 renderToReadableStream

https://github.com/reactwg/react-18/discussions/37

### 3、自动批处理

旧：

setState在react的事件处理程序中才会批量处理，如果在异步中调用（比如setTimeout、promise、本机事件处理程序或任何其他事件内部）则不会批量执行

新：

所有更新都会批量执行，目的是为了减少渲染次数，可以使用`flushSync`来退出自动批处理
```javascript
function handleClick() {
  flushSync(() => {
    setCounter(c => c + 1);
  });
  // React has updated the DOM by now
  flushSync(() => {
    setFlag(f => !f);
  });
  // React has updated the DOM by now
}
```

### 4、新api
- useTransition
  为了避免破坏性改动，批量处理在18中需要两个启用条件：
  
  1、先使用createRoot，前提条件
  
  2、使用useTransition
  
  startTransition里的setstate会被标记为不紧急的更新，统一批处理，遇到大量渲染的性能问题时，可以通过这个方法优化性能
  ```javascript
    function App() {
      const [isPending, startTransition] = useTransition();
      const [count, setCount] = useState(0);
      
      function handleClick() {
        // 里面的更像完成后，isPending变为true，才会渲染Spinner
        startTransition(() => {
          setCount(c => c + 1);
        })
      }

      return (
        <div>
          {isPending && <Spinner />}
          <button onClick={handleClick}>{count}</button>
        </div>
      );
    }
  ```

  https://juejin.cn/post/7020621789172613157

- useId 用于服务端与客户端生成的id，且能保持一致

  先了解下ssr的大致过程：

  在服务端，我们会将 React 组件渲染成为一个字符串，这个过程叫做脱水「`dehydrate`」。字符串以 html 的形式传送给客户端，作为首屏直出的内容。到了客户端之后，还有一些服务端未能完成的工作，比如绑定事件，加载js，这个过程叫做「`hydrate`」,

  可以看出，服务端只渲染结构，客户端还需要重新执行一遍，那随机id在服务端生成后，在客户端再次执行就会变化，为了保证两端一致，可以通过全局自增id来保持一致
  
  **但**！`React Fizz`(React新的服务端流式渲染器)导致代码执行顺序不在确定，自增id无法保持一致，**react根据组件层级生成id来保证稳定**
  关于服务端渲染：

  https://blog.csdn.net/weixin_39945523/article/details/110137731

  关于useId实现：

  https://juejin.cn/post/7034691251165200398

- useDeferredValue

  与useTransition类似，都是用于延迟到批量更新，只是useDeferredValue 用于值的包装

  ```javascript
    function App() {
      const [isPending, startTransition] = useTransition();
      const [count, setCount] = useState(0);
      
      function handleClick() {
        setCount(c => c + 1);
      }

      const deferCount = useDeferredValue(count)
      
      return (
        <div>
          {isPending && <Spinner />}
          <button onClick={handleClick}>{deferCount}</button>
        </div>
      );
    }
  ```
## react 渲染过程

### 16以前（旧）

diff算法，比较新旧虚拟dom，采用递归深度遍历比较节点，完成后对dom进行更新
### fiber(新)
由于diff的不可中断，会导致页面可能被阻塞，因此react采取新的`fiber`架构，将diff和更新分为两个阶段：
- render

  原有的diff算法从深度递归改造成异步可中断的遍历，一些概念如下：

  1、fiber节点的数据结构
    - 节点信息（tag操作类型、key、elementType元素类型、stateNode真实dom节点...）
    - 指针（父节点return、子节点child、兄弟节点sibling、双重缓存对应的节点alternate）
    - 计算state相关的属性（props、dependencies...）
    - effect相关
    - 优先级相关，schedule执行优先级高的任务

  2、diff算法
    - 只比较同级
    - 类型不同时删除节点重新创建
    - key和type相同时可以复用，老节点会根据key或index存放在map中，新节点也根据key去获取，没有再创建新节点
- commit阶段

  主要是收集effectList进行处理，分三个阶段：
  - 收集effectList
  - before mutation： 类组件调用getSnapshotBeforeUpdate（在componentDidUpdate之前），函数类调度usEeffect，在dom变更前获取组件实例信息，
  - mutation 执行对应dom操作，并执行useLayoutEffect的销毁函数
  - layout 完成渲染，执行渲染完成的回调，比如componentDidMount、componentDidUpdate、useLayoutEffect
  遍历fiber树，执行对应tag的操作

### concurrent mode(并发)
在fiber的基础上
上述的render阶段没有切片调度的说明，调度由`scheduler`完成，，超过则创建为宏任务
- scheduler 调度
  - 每一次fiber的diff后会判断执行事件是否超过5ms
  - 超过 则转为宏任务，由浏览器事件队列自行分配
  - 有用户操作优先执行
- lane（车道） 即优先级：

  同步(flushSync) > 连续事件 > 默认优先级(普通的state更新) > 过渡 > 重试 > 离屏幕
- 每个任务都有过期时间，过期后会放到taskQuene中优先执行，以保证不会被一直抢占

**总结**
Fiber -- 增加节点信息，为任务拆分提供基础。
Scheduler -- 在fiber的diff过程中根据优先级安排任务或者diff。
Lane -- 为Scheduler提供合理的调度优先级（通过小顶堆存放任务）

上层实现了batchedUpdates和Suspense