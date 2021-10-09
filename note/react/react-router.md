# react-router
## react-router v3升级v4
*`react-router-redux` 废弃 可以使用`connected-react-router`代替*
- [根路由Router](#根路由Router)
- [路由](#路由)
  - [Nesting Routes](#nesting-routes)
  - [on\* properties](#on-properties)
  - [Optional Parameters](#optional-parameters)
  - [Query Strings](#query-strings)
  - [Switch](#switch)
  - [Redirect](#redirect)
- [Link](#link)

## 根路由Router
v3版本中，<Router>组件的history和routes通过props的方式传入：
``` jsx
<Router history={browserHistory} routes={routes} />
```
v4中，history通过\<HashRouter>/\<BrowserRouter>/\<MemoryRouter>创建，而routes不在是通过props传入：
```jsx
<BrowserRouter>
    <div>
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
    </div>
</BrowserRouter>
```
**注意**：Router只能有一子元素，所以需要用`div`包裹`route`

### 路由
---
v3中 `<Route>`更多的像是配置项，最终会创建一个包含路径和渲染组件的对象：
```jsx
// in v3 the element
<Route path='contact' component={Contact} />
// was equivalent to
{
  path: 'contact',
  component: Contact
}
```
而v4中的`<Route>`是真正的组件，Route会真实渲染出来，当`path`匹配上时，会渲染props(`component`, `render`, `children`) ，否则渲染`null`

### 嵌套路由
v3中，嵌套路由的组件通过props.children传递给`<Route>`的component渲染，例如：
```jsx
<Route path="parent" component={Parent}>
  <Route path="child" component={Child} />
  <Route path="other" component={Other} />
</Route>
```
最终会将`Child`传入`Parent`的`props.children`
```jsx
<Parent {...routeProps}>
  <Child {...routeProps} />
</Parent>
```
在v4中，需要在Parent中创建`<Route>`
```jsx
<Route path="parent" component={Parent} />;

function Parent() {
  return (
    <div>
      <Route path="child" component={Child} />
      <Route path="other" component={Other} />
    </div>
  );
}
```

### 路由钩子
v3中提供的`onEnter`, `onUpdate`, 和 `onLeave`方法，本质上是react的组件生命周期，因此在v4中使用`componentDidMount`、`componentDidUpdate`、`componentWillUnmount`代替

### 路由参数
v3: `path="/entity/:entityId(/:parentId)"`

v4: `path="/entity/:entityId/:parentId?"`

### query字符串
v4不会对query进行解析，所以没有`location.query`属性，未解析的query在`location.search`中，可以通过[qhistory](https://github.com/Hypnosphi/qhistory)解析;

传入的query可以通过封装的组件重新拼接成`search`
```jsx
const QueryLink = (props) => (
  <Link {...props} to={{ ...props.to, search: stringifyQuery(props.to.query) }}/>
)
```

### Switch

v3中只会渲染匹配上的第一个路由，v4中使用Switch
```jsx
<Route path="/" component={App}>
  <IndexRoute component={Home} />
  <Route path="about" component={About} />
  <Route path="contact" component={Contact} />
</Route>
```

### Redirect
- `IndexRedirect`由`Redirect`代替
    ```jsx
        // v3
        <Route path="/" component={App}>
            <IndexRedirect to="/welcome" />
        </Route>
        
        // v4
        <Route exact path="/" render={() => <Redirect to="/welcome" component={App} />} />

        <Switch>
            <Route exact path="/" component={App} />
            <Route path="/login" component={Login} />
            <Redirect path="*" to="/" />
        </Switch>
    ```

.... 待续

### Link
`Link` 必须传`to`
