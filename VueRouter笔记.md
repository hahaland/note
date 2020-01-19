# 基础

## 起步
1. 在模版中调用```<router-link to="/foo">```（router-link标签会自动设置class属性```.router-link-active```）
2. 定义路由
    ```javascript
    const routes = [
      { path: '/foo', compoment: Foo }
    ]
    ```
3. 创建router实例,并挂在到vue实例中
    ```javascript
    const router = new VueRouter({
      routes
    })

    const app = new Vue({
      router
    })
    ```

组件中可以通过```this.$router```访问路由，```this.$route```访问当前路由

