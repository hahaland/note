# react源码

## 目录结构
在index.js中可以看到日常使用的api（class api、hook api等）
```typescript
export {
  Children,
  createRef,
  Component,
  PureComponent,
  // ...
} from './src/React';
```
## classApi
classApi显然得从`Component`开始

```typescript

function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  // 如果一个组件有字符串 refs，稍后会分配一个不同的对象。
  this.refs = emptyObject;
  // 初始化默认更新程序，但真正的更新程序通过渲染器（renderer）注入.
  this.updater = updater || ReactNoopUpdateQueue;
}

/**
 * 设置状态的子集。 总是用它来变异状态。 您应该将 `this.state` 视为不可变的。
 *
 * 不能保证 `this.state` 会立即更新，所以调用此方法后访问`this.state` 可能会返回旧值。（异步更新）
 *
 * 不能保证对 `setState` 的调用会同步运行，因为它们最终可能会被分批在一起。 您可以提供一个可选的实际调用 setState 时将执行的回调完全的。（react的批量更新）
 *
 * 当一个函数被提供给 setState 时，它将在未来的某个时间点被调用（非同步）。 它将使用最新的组件参数（状态、道具、上下文）调用。 这些值可能与 this.* 不同，因为您的函数可能会在 receiveProps 之后但在 shouldComponentUpdate 之前被调用，并且这个新的状态、道具和上下文尚未分配给 this。
 *
 * @param {object|function} partialState 需要更新的state.
 * @param {?function} callback 更新后的回调.
 * @final
 * @protected
 */
Component.prototype.setState = function(partialState, callback) {
  invariant(
    typeof partialState === 'object' ||
      typeof partialState === 'function' ||
      partialState == null,
    'setState(...): takes an object of state variables to update or a ' +
      'function which returns an object of state variables.',
  );
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
```
