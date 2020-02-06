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

组件中可以通过```this.$router```访问路由，```this.$route```a访问当前路由
  
当```<router-link>```匹配成功后会添加class
```.router-link-active```

## 动态路由匹配

路由参数，可以通过this.$route.params获取
```javascript
    const router = new VueRouter({
      routes: [
        // 参数以冒号开头（/user/a /user/b)
        // this.$route.params.id
        { path: '/user/:id', component: User}
      ]
    })
```
监听路由参数的变化方法：
- watch中监听$router属性
  ```javascript
    const User = {
      template: '...',
      watch: {
        '$route' (to, from) {
          // 对路由变化作出响应...
        }
      }
    }
  ```
- ```beforeRouteUpdate``` [导航守卫](##导航守卫)

> 匹配所有路径 ```path: '*'```, 用于路径错误的路由跳转,匹配user开头的所有路径 ```path: '/user*'```


# 进阶


## 导航守卫
