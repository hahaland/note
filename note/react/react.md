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
- 组合
## 派生state

即子组件的state对应props的某些属性，属性改变时state也要相应改变。

> 避免使用派生state和props更新时的生命周期函数（`getDerivedStateFromProps、componentWillReceiveProps`），代码不清晰且难以维护。

如果要使用，需要注意一些问题：
- 派生state在内部也有方法触发更新，调试时难以确定更改源头。

### 组件设计
- 设计组件时，重要的是确定组件是受控（通过父组件的props控制）还是非受控的（组件内的state可以自行变化）。
- 尽量实现一个受控的组件，由父组件的props统一控制，可以在父组件中管理`state.drafValue`和`state.committedValue`来控制子组件的值。
- 不受控的组件更新
    - 可以绑定key（比如id），key改变时相当于初始化state
    - 只更改某些字段
    - 使用ref
- 当底层

## render prop
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

> 需要注意的是，每次父组件重新渲染，匿名函数都不一样，所以会重新生成组件，所以Mouse组件继承`PureComponent`时并没有用，可以在Mousetracker中定义一个函数，比如`renderCat`；而当没法定义一个静态的函数时，就应该重新定义组件

## Context


