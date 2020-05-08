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

## ref转发