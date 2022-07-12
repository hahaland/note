# koa 源码

核心是中间件

### 中间件是什么

当你需要对请求做一些统一处理时，就可以通过中间件的方式，就像流水线一样，每一个环节代表一个中间件。涉及到的功能有很多，比如：
- IP筛选
- 查询字符串传递
- 请求体解析
- cookie信息处理
- 权限校验
- 日志记录
- 会话管理中间件(session)
- gzip压缩中间件(如compress)
- 错误处理

可以当做过滤器，根据某些条件丢弃一部分请求；也可以当做转换器，添加一些属性或者做一些转换
## 代码部分

目录结构
```
├── __tests__ ------------------------ 单元测试
├── docs ----------------------------- 文档
├── lib ------------------------------ 源码目录
│   ├── application.js --------------- 运行
│   ├── context.js ------------------- 上下文
│   ├── request.js ------------------- 请求
│   ├── response.js ------------------ 响应
```

先看下入口文件 `application.js`
```javascript
// application.js
class Application extends Emitter{ // 继承Emitter 能自定义事件

  constructor(options) {
    super();
    options = options || {};
    this.proxy = options.proxy || false;
    this.env = options.env || process.env.NODE_ENV || 'development';
    if (options.keys) this.keys = options.keys;
    this.middleware = [];
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }
}
```
省略了一些代码，列了一些重要的变量，比如`middleware`、`context`、`request`、`response`

先看一个简单的demo:
```javascript
  const Koa = require("koa");
  const app = new Koa();
  app.use(async (ctx, next) => {
    ctx.body = "hello，KOA";
  });
  app.listen(3000);
```
可以看到，显示添加了一个中间件，再调用listen启动监听，这个过程发生了什么呢：

### use方法

use方法添加中间件，将中间件push到middleware数组中
```javascript

  use(fn){
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    this.middleware.push(fn);
    return this;
  }
```
### listen方法

返回一个http server，传入的回调经过了callback的封装
```javascript

  listen(...args) {
    // callback函数是关键
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
```
### callback 方法
这里是实现洋葱模型的关键，compose将中间件按顺序连接起来
```javascript

  callback() {
    // compose传入中间件数组
    const fn = compose(this.middleware);

    // 事件数为0，则绑定onerror方法
    if (!this.listenerCount('error')) this.on('error', this.onerror);

    // 封装createServer的传参，每个请求都创建一个ctx
    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }
```
### compose 方法
先看下中间件结构：
```javascript
async (ctx, next) => {
  // 代码
  await next()
  // 代码
}
```
可以看到，核心是传入`ctx`和执行`next`方法，中间件共享一个ctx。
  
这个`next`就是来自`compose`返回函数的执行结果，即`dispatch`函数，流程大致如下：
- compose包装一个函数
- 收到请求时，执行这个函数，返回dispatch(0)
- 尝试执行第一个中间件，并用promise封装，
- 中间件传入ctx和下一个中间件，中间件函数通过bind绑定下标
- 过程中tyr catch，出错时终止循环

```javascript
  

  function compose (middleware) {
    if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
    for (const fn of middleware) {
      if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
    }

    /**
     * @param {Object} context
     * @return {Promise}
     * @api public
     */

    return function (context, next) {
      // last called middleware #
      // 初始值
      let index = -1
      // 执行第一个中间件
      return dispatch(0)
      function dispatch (i) {
        // 这里是为了防止中间件重复执行
        if (i <= index) return Promise.reject(new Error('next() called multiple times'))
        index = i
        let fn = middleware[i]
        // 边界值处理
        if (i === middleware.length) fn = next
        if (!fn) return Promise.resolve()

        try {
          // 传入了ctx，dispatch下标绑定为i+1
          return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
        } catch (err) {
          // 捕获到错误终止传递
          return Promise.reject(err)
        }
      }
    }
}
```

### createContext 方法

创建context，并添加一些属性

```javascript
  createContext (req, res) {
    // 创建基础context、request和response，包含一些通用属性和方法
    const context = Object.create(this.context)
    const request = context.request = Object.create(this.request)
    const response = context.response = Object.create(this.response)

    // 将实例挂载到app属性中
    context.app = request.app = response.app = this
    // 挂载Node原生的req和res
    context.req = request.req = response.req = req
    context.res = request.res = response.res = res
    request.ctx = response.ctx = context
    request.response = response
    response.request = request
    context.originalUrl = request.originalUrl = req.url
    // 可自定义的状态，例如koa-jwt库就使用了该属性
    context.state = {}
    return context
  }
```

### handleRequest 方法

初始化一些属性，并开始执行中间件流水

```javascript
  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    // 默认404
    res.statusCode = 404;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    onFinished(res, onerror);
    // fnMiddleware就是上面compose返回的函数，最后执行respond处理返回值
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }
```
respond()函数，主要是对body的一些处理

```javascript
function respond(ctx) {
  // 允许跳过koa的处理则return
  if (false === ctx.respond) return;

  if (!ctx.writable) return;

  const res = ctx.res;
  let body = ctx.body;
  const code = ctx.status;

  // code不是已知的状态码
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null;
    return res.end();
  }

  // HEAD请求 只需要返回响应头，不需要处理body
  if ('HEAD' === ctx.method) {
    if (!res.headersSent && !ctx.response.has('Content-Length')) {
      const { length } = ctx.response;
      if (Number.isInteger(length)) ctx.length = length;
    }
    return res.end();
  }

  // body为空
  if (null == body) {
    if (ctx.response._explicitNullBody) {
      ctx.response.remove('Content-Type');
      ctx.response.remove('Transfer-Encoding');
      return res.end();
    }
    if (ctx.req.httpVersionMajor >= 2) {
      body = String(code);
    } else {
      body = ctx.message || String(code);
    }
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // buffer和string正常返回
  if (Buffer.isBuffer(body)) return res.end(body);
  if ('string' === typeof body) return res.end(body);
  // 流类型的body调用pipe()
  if (body instanceof Stream) return body.pipe(res);

  // 其他类型转为json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}
```
## 总结
- 先通过use收集中间件，存放到数组中
- listen方法封装了 http.createServer逻辑，createServer时调用this.callback返回一个回调，这个函数包含了链式调用的逻辑
- callback函数会执行compose方法，这个方法完成了中间件的连接并返回一个函数
- compose返回的函数里，通过闭包里的index记录中间件顺序，按顺序执行的同时避免重复调用中间件，直到全部执行完成，过程中try/catch监听错误并返回
