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

- 
