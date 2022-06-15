# 装饰器与router

监听接口时，使用koa-router的方式，需要定义router文件，编写路由，这样无疑很麻烦，且不直观

我们看下使用了装饰器语法的实现
```javascript

  @Controller('/user')
  class USerController {
    @Get('/info')
    getInfo(): string {
      return '';
    }

    @Get('/:id')
    fn2(): string {
      return '';
    }
  }

```

这样能直接在controller中实现，只需注入controller就行


## routing-controller的实现方式
- 在装饰器外封装一层函数用来获取路由
- 装饰器可以获取类的构造函数、类的原型对象
- 对应装饰器添加到routing-controller的storage中

### 装饰器
下面的例子展示了不同类型的装饰器
```javascript
  @classDecorator // 类装饰器
  class Hero {
      @propertyDecorator // 属性装饰器
      name: string = "";

      @propertyDecorator
      _hp: number = 100;

      @methodDecorator // 方法装饰器
      attack(@paramDecorator enemy: Enermy /* 参数装饰器 */) {

      }

      @propertyDecorator  // 访问符装饰器
      get hp() {
          return this._hp;
      }
  }
```
#### 类装饰器
对于类装饰器，会传入类作为参数，你可以添加属性，也可以修改原型
```javascript
  const classDecorator = (targetClass) => {
    targetClass.test = '123'
    targetClass.prototype.xx = () =>{}
}
```

#### 属性装饰器
接收三个参数：
- target 被修饰的类
- name 类成员名字
- descriptor 属性描述符，对象会将这个参数传给Object.defineProperty

```javascript
  function readonly(target, name, descriptor) {
    // descriptor对象原来的值如下
    // {
    //   value: specifiedFunction,
    //   enumerable: false,
    //   configurable: true,
    //   writable: true
    // };
    descriptor.writable = false;
    return descriptor;
  }

  class Person {
    @readonly name = 'person'
  }

  const person = new Person();
  person.name = 'tom'; 
```
方法也是属性的一种，所以也是同理

### 反射 Reflect
`routing-controller`使用reflect获取每个方法的参数和参数属性

要使用 Metadata API，我们需要引用 **reflect-metadata** 这个库

https://www.myfreax.com/typescriptzhong-de-zhuang-shi-qi-he-yuan-shu-ju-fan-she-cong-xin-shou-dao-zhuan-jia/

### Controller

代码大致如下：
```javascript
  // 返回一个函数用作装饰器
  var index = require('./index.js')
  export const Controller = (baseRoute) => {
    return (target) => {

      index.getMetadataArgsStorage.controllers.push({
        type:'default',
        target: target,
        route: baseRoute
      })
    };
  };
```
把传入的路由包装一下，然后缓存到index变量中

### get方法
```javascript
  // 返回一个函数用作装饰器
  var index = require('./index.js')
  export const Get = (route) => {
    return (target) => {

      index.getMetadataArgsStorage.actions.push({
        type:'get',
        target: target,
        route: route
      })
    };
  };
```
和controller类似，不过是先加到actions, 

### 具体流程
前面收集完了路由和回调，下一步就是将其添加到koa-router中了
- 调用`useKoaServer`
  ```javascript
    function useKoaServer(koaApp, options) {
      const driver = new KoaDriver_1.KoaDriver(koaApp);
      return createServer(driver, options);
    }
  ```
- createExecutor 会执行下面代码
  ```javascript
    new RoutingControllers_1.RoutingControllers(driver, options)
        .initialize()
        .registerInterceptors(interceptorClasses)
        .registerMiddlewares('before', middlewareClasses)
        .registerControllers(controllerClasses)
        .registerMiddlewares('after', middlewareClasses)
  ```

其中会组装controllers和actions为router的结构，最后调用koa-router的`router.routes`方法，完成传递，之后就是koa-router的工作了
-----------------待补充-----------------

https://blog.csdn.net/u011748319/article/details/105296621


