# Nest笔记

## 各类型文件

### 1、Controllers

控制器负责处理 requests 并将 responses 返回给客户端，即接口处理层

几个特性：
#### routing 路由映射
- 通过装饰器分发路由对应的controller，比如`@Controller('xxx')` 
- 通配符：路径可以包含`? + * ()`，和正则规则一致，还有`- .`（这两个符号的规则需要确认）
- 子域路由:

    可以要求传入请求的host匹配特定值：

    `@Controller({ host: 'admin.example.com' })`

#### 请求对象相关的装饰器
| 装饰器 | 代表的对象|
|:-|-:|
|@Request(), @Req() |	req|
|@Response(), @Res()* |	res|
|@Next() |	next|
|@Session() |	req.session|
|@Param(key?: string) |	req.params / req.params[key]|
|@Body(key?: string) |	req.body/req.body[key]|
|@Query(key?: string) |	req.query/req.query[key]|
|@Header                                                                     s(name?: string) |	req.headers/req.headers[name]|
|@Ip() |	req.ip|
|@HostParam() |	req.hosts|

注：@Res和@Response是因为底层框架别名的不同（Express、Fastify）

#### 相应标准HTTP方法的装饰器
- `@Get()、@Post()、@Put()、@Delete()、@Patch()、@Options()和@Head()`
- `@All()`，可以统一接受上述所有请求
- 动态参数，可以通过params获取相应参数： 
    ```javascript
        @Get(':id')
            findOne(@Param() params): string {
            
            console.log(params.id);
            return `This action returns a #${params.id} cat`;
        }
    ```


#### 另外的装饰器
- `@HttpCode(code)` 可以方便的设置默认的httpcode
- `@Header(key, val)` 自定义响应头
- `@Redirect(url, statusCode)` 重定向，可以在方法里返回`{ url, statusCode }`来覆盖装饰器的参数
  

#### payload(请求载荷)
通过`@body()`和class定义payload数据结构

```javascript

class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
```

#### 错误处理
通过[`Exception filters`](##Exception-filters)（异常过滤）处理

#### 挂载controller
controller定义完成后，需要通过`@Module`将controller添加到`AppModule`中,在通过`NestFactory.create`完成实例化

``` javascript
// app.module.ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller.ts'

@Module({
    controllers: [CatsController],
})

export class AppModule {}

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```


### 2、Provider

provider可以理解为提供某种功能的模块，在nest中泛指能**依赖注入**的模块，比如服务、存储库、工厂、helper等

***依赖注入： 通过Ioc（控制反转）容器，统一管理依赖服务的实例创建和绑定，来实现代码与依赖模块的解耦***

想注入依赖，需要三步：
- 1、通过 `@Injectable`将类标记为Provider
- 2、调用的类在初始化时，将类绑定到this
- 3、将Provider注册到Nest Ioc容器:
    ```javascript
        // app.modules.ts
        import { Module } from '@nestjs/common';
        import { CatsController } from './cats/cats.controller';
        import { CatsService } from './cats/cats.service';

        @Module({
            controllers: [CatsController],
            providers: [CatsService],
        })
        export class AppModule {}
    ```

而具体发生了什么：

**1、`@Injectable` 做了什么？**

```javascript
// injectable.decorator.ts
import { INJECTABLE_WATERMARK, SCOPE_OPTIONS_METADATA } from '../../constants';

export function Injectable(options?: InjectableOptions): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
  };
}
```
可以看到，`Injectable`给target添加了两个常量，标记是否是依赖注入的类

**2、@Module 做了什么？**

```javascript
// module.decorator.ts

import { ModuleMetadata } from '../../interfaces/modules/module-metadata.interface';
import { validateModuleKeys } from '../../utils/validate-module-keys.util';

export function Module(metadata: ModuleMetadata): ClassDecorator {
  const propsKeys = Object.keys(metadata);
  // 校验传入的对象是否合法
  validateModuleKeys(propsKeys);

  return (target: Function) => {
    for (const property in metadata) {
      if (metadata.hasOwnProperty(property)) {
        Reflect.defineMetadata(property, (metadata as any)[property], target);
      }
    }
  };
}
```
主要是校验对象合法性，添加到AppModule

**3、NestFactory.create 做了什么**
```typescript
  // 重载声明
  public async create<T extends INestApplication = INestApplication>(
    module: any,
    options?: NestApplicationOptions,
  ): Promise<T>;
  public async create<T extends INestApplication = INestApplication>(
    module: any,
    httpAdapter: AbstractHttpAdapter,
    options?: NestApplicationOptions,
  ): Promise<T>;
  public async create<T extends INestApplication = INestApplication>(
    module: any,
    options?: NestApplicationOptions,
  ): Promise<T>;
  public async create<T extends INestApplication = INestApplication>(
    module: any,
    serverOrOptions?: AbstractHttpAdapter | NestApplicationOptions,
    options?: NestApplicationOptions,
  ): Promise<T> {
    const [httpServer, appOptions] = this.isHttpServer(serverOrOptions)
      ? [serverOrOptions, options]
      : [this.createHttpAdapter(), serverOrOptions];

    const applicationConfig = new ApplicationConfig();
    const container = new NestContainer(applicationConfig);
    this.setAbortOnError(serverOrOptions, options);
    this.registerLoggerConfiguration(appOptions);

    await this.initialize(module, container, applicationConfig, httpServer);

    const instance = new NestApplication(
      container,
      httpServer,
      applicationConfig,
      appOptions,
    );
    const target = this.createNestInstance(instance);
    return this.createAdapterProxy<T>(target, httpServer);
  }
```


参考： 

https://docs.nestjs.com/fundamentals/custom-providers

https://github.com/nestjs/nest

### Exception-filters（异常过滤）
