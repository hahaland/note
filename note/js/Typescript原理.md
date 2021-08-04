# Typescript原理

首先，简单介绍下typescript，ts是js的超集，能实现静态检查，帮助开发者减少代码错误，且ts代码经过编译后都是符合es规范的代码，不存在兼容性问题，目前由微软在维护。

## 为什么需要Typescript

- 提前知道代码中可能的错误
- 语法提示
- 强大的类型系统，包括函数类型、泛型、类型推导
- 良好的兼容性（es5+）
- 静态检查，不需要运行时调试

## 为什么要了解typescript原理

- 更好的了解和使用typescript
- 了解编译原理相关知识
- 能自定义代码解析和打包过程
- 写一门语言
- 写一个操作系统

## 进入正题
- 项目结构
- 编译过程
    - 词法分析
    - 语法分析
    - 作用域分析
    - 流程分析
    - 语义分析
    - 语法转换

## 项目结构
typescript源码1.5g，就挑一些核心部分了解一下

```
├── bin         最终给用户用的 tsc 和 tsserver 命令
├── doc         语言规范文档
├── lib         系统标准库（定义了es标准的方法和编译提示的国际化文件）
├── loc         （一些lcl文件，没搞懂是干什么的）
├── scripts     开发项目时的一些工具脚本
├── src         源码
│   ├── compiler        编译器代码（核心代码）
│   ├── services        语言服务，主要为 VSCode 使用，比如查找定义之类的功能
    └── ...             待补充
└── tests       测试文件
```

compiler目录结构

```
  ├── core.ts               工具函数
  ├── sys.ts                文件操作
  ├── types.ts              类型定义
  ├── scanner.ts            词法分析
  ├── parser.ts             语法分析
  ├── utilities.ts          内部工具类
  ├── utilitiesPublic.ts    内部工具类
  ├── binder.ts             作用域分析
  ├── checker.ts            类型检查
  ├── transformer.ts        代码转换
  ├── transformers/          代码转换
  ├── emitter.ts            生成文件
  ├── tsbuild.ts            
  ├── tsbuildPublic.ts  
  ├── visitorPublic.ts  
  ├── watch.ts              监听日志相关
  ├── watchPublic.ts        监听日志相关
  ├── watchUtilities.ts     监听日志相关
  ├── visitorPublic.ts      访问ts内部对象的方法
  ├── program.ts
  └── ...
  
```

## ts编译流程
### 词法分析
代码文件本质上是一个字符串，包括空格、字母、符号、汉字等各种字符，我们可以将一个文件当成一篇文章，而一行行代码就是一个语句，而一个个变量和关键字就是一个个单词。

举个例子：
```javascript
var b = 1
var a = b >= 1
```
首先我们需要读懂字符，才能组成单词，借助‘字典’，我们就能知道字符代表的意义：
```typescript
/**
 *  src/compiler/types.ts
*/
export const enum CharacterCodes {
        _0 = 0x30,
        _1 = 0x31,
        // 2-8(略)
        _9 = 0x39,

        a = 0x61,
        // ...b-y(略)
        z = 0x7A,

        A = 0x41,
        // B-Y...(略)
        Z = 0x5a,

        ampersand = 0x26,             // &
        asterisk = 0x2A,              // *
        // 各类字符(略)
}
```

比如说判断一个数字
```typescript
function isDigit(ch: number): boolean {  // 参数 ch 表示一个编码值
    return ch >= CharacterCodes._0 && ch <= CharacterCodes._9;
}
```
判断是否是空格
```typescript
export function isWhiteSpaceLike(ch: number): boolean {
    return isWhiteSpaceSingleLine(ch) || isLineBreak(ch);
}

/** Does not include line breaks. For that, see isWhiteSpaceLike. */
export function isWhiteSpaceSingleLine(ch: number): boolean {
    // Note: nextLine is in the Zs space, and should be considered to be a whitespace.
    // It is explicitly not a line-break as it isn't in the exact set specified by EcmaScript.
    return ch === CharacterCodes.space ||
        ch === CharacterCodes.tab ||
        ch === CharacterCodes.verticalTab ||
        ch === CharacterCodes.formFeed ||
        ch === CharacterCodes.nonBreakingSpace ||
        ch === CharacterCodes.nextLine ||
        ch === CharacterCodes.ogham ||
        ch >= CharacterCodes.enQuad && ch <= CharacterCodes.zeroWidthSpace ||
        ch === CharacterCodes.narrowNoBreakSpace ||
        ch === CharacterCodes.mathematicalSpace ||
        ch === CharacterCodes.ideographicSpace ||
        ch === CharacterCodes.byteOrderMark;
}
```
其他字符类似，不再赘述，接下来开始判断单词
#### 判断标识符
通过`isUnicodeIdentifierStart` 判断第一个字符是否符合规范，剩下的字符由`isUnicodeIdentifierPart`判断

### 语法分析
### 作用域分析
### 流程分析
### 语义分析
### 语法转换
