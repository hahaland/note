# Typescript

## 基础

- 无返回值的可使用 void
- Null 与 undefined 可以赋值给其他类型
- 没设置类型的 ts 会进行类型推论，没有赋值为 any
- 联合类型，一个变量可以是多个类型
- 接口用来限制变量结构，属性要与接口保持一致，?表示属性可选
- 函数定义

```typescript
  let func: (a: number, b?: number, c = '可选'， ...restOfName: string[]) => number
  // 参数a数字类型，返回值数字类型，有默认值的都是可选，...restOfName收集剩余的参数(只能是最后一个参数)
```

### 类型断言
  用途
  - 联合类型只能使用类型的共同属性，断言可以使用其他属性，不过要避免断言后调用方法或引用深层属性，以减少不必要的运行时错误。
  ```typescript
  interface Cat {
    name: string;
    run(): void;
  }
  interface Fish {
    name: string;
    swim(): void;
  }
  
  function swim(animal: Cat | Fish) {
    (animal as Fish).swim();
  }

  const tom: Cat = {
      name: 'Tom',
      run() { console.log('run') }
  };

  swim(tom); // Uncaught TypeError: animal.swim is not a function`
  ```

  - 将一个父类/接口类型断言为更加具体的子类/接口类型（接口在js中无法使用instanceof判断）
  - 将变量断言为any解除所有限制
  - A兼容B类型时才能相互断言
- 声明文件：
  必须以.d.ts结尾，只定义类型，不定义具体实现



### 元组，合并不同类型的数组,越界时可以是其中一个类型
```typescript
  let arr: [string, number] = ['1',1]
```

- 枚举,可以通过index或key访问
```typescript
  enum Days {Sun, Mon, Tue, Wed, Thu, Fri, Sat}
  Days.Sun === 0
  Days[0] === 'Sun'
```

## 进阶
### 运算符
#### 非空断言!
```typescript
    function onClick(callback?: () => void) {
        callback!();	// 断言callback非空，虽然callback参数是可选但ts不会报错
    }
```
#### ?. ??
和es规范的操作符一样
#### 数字分隔符_
用来分隔数字，编译后自动去除
```typescript
    const num = 1_23

    // 编译后
    var num = 123
```
### 类型
#### `unkonw` 和 `any`
在不确定类型时，我们经常会指定为`any`，但这样ts会忽略语法检查，比如
```typescript
const uncertain: any = 'Hello world!';
uncertain.hello();
```

而使用``unknow`时，需要我们收缩类型才能使用对应的方法
```typescript
function func(value: unknown) {
  value.toFixed(2);

  // Type assertion:
  (value as number).toFixed(2); // OK
}
```

#### void

#### never

### typescript的数据结构操作
- 模拟数组操作

- 取数据结构（interface/tuple）的子类型
```typescript
    type key = {

    }
```

[TypeScript 高级用法](https://juejin.cn/post/6926794697553739784)

[深入理解 TypeScript 高级用法](https://zhuanlan.zhihu.com/p/136254808)