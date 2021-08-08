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
  ├── factory/              封装了一些工厂方法
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
  ├── transformers/         代码转换
  ├── emitter.ts            生成文件
  ├── tsbuild.ts            存放ts构建过程的状态类型
  ├── tsbuildPublic.ts      ts构建的方法（包括构建、监听，错误处理）
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
词法分析的代码在scanner.ts中，首先ts会执行scan方法开始扫描，然后根据字符类型

代码文件本质上是一个字符串，包括空格、字母、符号、汉字等各种字符，我们可以将一个文件当成一篇文章，而一行行代码就是一个语句，而一个个变量和关键字就是一个个单词。

举个例子：
```javascript
var b = 1
var a = b >= 1
```

#### 组词
组词的代码主要在scanner.ts中，顾名思义，在扫描字符串过程中组成单词。
在组词前，首先需要了解以下类和方法
##### 1、CharacterCodes - 字符集

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
##### 2、 判断类型的方法
比如判断数字`isDigit`
```typescript
/**
 *  src/compiler/scanner.ts
*/
function isDigit(ch: number): boolean {  // 参数 ch 表示一个编码值
    return ch >= CharacterCodes._0 && ch <= CharacterCodes._9;
}
```
判断是否是空格`isWhiteSpaceLike`
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
其他字符类似，不再赘述

##### 3、SyntaxKind - 单词类型
指明单词属于哪种类型，比如数字、变量、空格、操作符等等
```typescript
export const enum SyntaxKind {
        Unknown,
        EndOfFileToken,
        NewLineTrivia,
        WhitespaceTrivia,
        NumericLiteral,
        BigIntLiteral,
        StringLiteral,
        JsxText,
        Identifier, // 标识符
        //...
}
```

#### 4、 scan方法
scan方法，读取若干个字符，返回单词类型
```typescript
function scan(): SyntaxKind{
    while(true){
        // pos开始位置 end结束位置
        if (pos >= end) {
            // 遍历完成结束循环
            return token = SyntaxKind.EndOfFileToken;
        }

        // 获取字符
        const ch = codePointAt(text, pos);

        // 执行对应字符类型的方法
        switch(ch){
            // 数字类型
            case CharacterCodes._0:
                if (pos + 2 < end && (text.charCodeAt(pos + 1) === CharacterCodes.X || text.charCodeAt(pos + 1) === CharacterCodes.x)) {
                    // 16进制
                    pos += 2;
                    // scanMinimumNumberOfHexDigits 会读取后续字符组成16进制数
                    tokenValue = scanMinimumNumberOfHexDigits(1, /*canHaveSeparators*/ true);
                    if (!tokenValue) {
                        // 取不到值时就会抛出错误Diagnostics.Hexadecimal_digit_expected 
                        // 值为diag(1125, ts.DiagnosticCategory.Error, "Hexadecimal_digit_expected_1125", "Hexadecimal digit expected.")，即IDE的报错
                        error(Diagnostics.Hexadecimal_digit_expected);
                        tokenValue = "0";
                    }
                    return token = checkBigIntSuffix();
                }
                else if (pos + 2 < end && (text.charCodeAt(pos + 1) === CharacterCodes.B || text.charCodeAt(pos + 1) === CharacterCodes.b)) {
                    //2进制
                    // ...
                }
                else if (pos + 2 < end && (text.charCodeAt(pos + 1) === CharacterCodes.O || text.charCodeAt(pos + 1) === CharacterCodes.o)) {
                    // 8进制
                    // ...
                }
                // Try to parse as an octal
                if (pos + 1 < end && isOctalDigit(text.charCodeAt(pos + 1))) {
                    // 8进制 08

                }
            case CharacterCodes._1:
            case CharacterCodes._2:
            case CharacterCodes._3:
            case CharacterCodes._4:
            case CharacterCodes._5:
            case CharacterCodes._6:
            case CharacterCodes._7:
            case CharacterCodes._8:
            case CharacterCodes._9:
                ({ type: token, value: tokenValue } = scanNumber());
                return token;
            // ...
            default:
                // scanIdentifier判断是否是标识符（变量）
                const identifierKind = scanIdentifier(ch, languageVersion);
                if (identifierKind) {
                    return token = identifierKind;
                }
                else if (isWhiteSpaceSingleLine(ch)) {
                    pos += charSize(ch);
                    continue;
                }
                else if (isLineBreak(ch)) {
                    // 换行则读取下个字符重新开始
                    tokenFlags |= TokenFlags.PrecedingLineBreak;
                    pos += charSize(ch);
                    continue;
                }
                const size = charSize(ch);
                error(Diagnostics.Invalid_character, pos, size);
                pos += size;
                return token = SyntaxKind.Unknown;
        }
    }
}
```


### 语法分析
### 作用域分析
### 流程分析
### 语义分析
### 语法转换
