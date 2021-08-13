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
typescript源码1.5g，就挑一些核心部分了解一下，主要是src/compiler目录下的代码，包含了最重要的编译部分

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
- 首先我们需要读取`var`，保存为一个关键字类型的单词，而且遇到空格，分词，读下个词；
- 类似的步骤继续获取`b`、`=`、`1`
- 遇到换行，读取下个单词，由于是`var`，前面的语句结束，创建新的语句并添加`var`

上面读取字符生成单词过程称之为组词，而创建语句的过程为组句

#### 组词
组词的代码主要在scanner.ts中，顾名思义，在扫描字符串过程中组成单词。
组词过程主要设计一下代码
##### 1、CharacterCodes - 字符集
首先得知道字符是什么字符
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
然后定义字符类型，比如判断数字`isDigit`
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
其他字符类型类似，不再赘述

#### 3、SyntaxKind - 单词类型
接着就是定义多个字符组合类型，即单词类型，比如数字、变量、空格、操作符等等
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
`scan`方法，是扫描单词的核心方法，以上述代码为基础，读取字符生成单词并返回单词类型
```typescript
/**
 *  src/compiler/scanner.ts
*/
export interface Scanner {
    
    private pos     // 开始位置
    private end     // 结束位置
    private token   // 单词类型
    private tokenValue // 单词值
    scan(): SyntaxKind; // 扫描下一个标记
    setText(text: string, start?: number, length?: number): void; // 设置当前扫描的字符串
    getToken(): SyntaxKind; // 获取当前标记的类型
    getStartPos(): number; // 获取当前标记的完整开始位置
    getTokenPos(): number; // 获取当前标记的开始位置
    getTextPos(): number; // 获取当前标记的结束位置
    getTokenText(): string; // 获取当前标记的源码
    getTokenValue(): string; // 获取当前标记的内容。如果标记是数字，获取计算后的值；如果标记是字符串，获取处理转义字符后的内容
    // ...
}

function scan(): SyntaxKind{
    while(true){
        
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
                    tokenFlags |= TokenFlags.PrecedingLineBreak; // tokenFlags用来辅助判断，只在scanner内部使用
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

总结： `scan`方法读取字符，通过`CharacterCodes`判断需要走哪条对应单词类型的路径，比如`isDigit`，则调用`scanNumber`方法读取完整数字，最后设置tokenValue并返回单词类型`SyntaxKind`

### 语法分析

#### 什么是语法树
获得一个个单词后，我们需要进行语法分析，才能组合成一个句子，比如`php是世界上最好的语言`，可以分解为：
```
语句
├── php         名称
├── 是          代指
└── 语言        定义
    ├──世界上   补充定义
    └── 最好    补充定义
```
而一篇文章的结构又由很多语句组成,而且某个概念可能引用了其他文章的内容
```
文章
├── 语句         
├── 语句         
├── 语句
|      └── a
└── 语句（注明a来源的语句）
```
typescript编译时，会把代码分解成类似上面的结构，称之为语法树：

```javascript
sourceFile // 源文件
├── 语句节点    //  import react from 'React'
|       ├── 类型节点    (import)
|       ├── 类型节点    (react)
|       ├── 类型节点    (from)
|       └── 类型节点    ('React')
├── 语句节点  react
├── 语句节点  // var a = 1 + 1
|       ├── 类型节点    (var)
|       ├── 类型节点    (a)
|       ├── 类型节点    (=)
|       └── 表达式节点  (1+1)
|               ├── 类型节点 1
|               ├── 类型节点 +
|               └── 类型节点 1
├── 其它节点    //  比如case   
└── 语句节点    (import react from "React") 
```
其中，节点分成四大类：
- 类型节点 TypeNode
- 表达式节点 Expression
- 语句节点 Statement
- 其他节点

而得出这个语法树由`compiler/parser.ts`文件负责

#### 语法树的生成过程

##### 1、入口
`createSourceFile`是开始解析语法树的入口，传入文件名
```typescript

export const enum Phase {
    Parse = "parse",
    Program = "program",
    Bind = "bind",
    Check = "check", // Before we get into checking types (e.g. checkSourceFile)
    CheckTypes = "checkTypes",
    Emit = "emit",
    Session = "session",
}
export function createSourceFile(fileName: string, sourceText: string, languageVersion: ScriptTarget, setParentNodes = false, scriptKind?: ScriptKind): SourceFile {
    
    tracing?.push(tracing.Phase.Parse, "createSourceFile", { path: fileName }, /*separateBeginAndEnd*/ true); // parse阶段
    performance.mark("beforeParse"); // performance 性能监测
    let result: SourceFile;

    perfLogger.logStartParseSourceFile(fileName);
    // ScriptKind 标识文件类型（ts、js、json、jsx）
    if (languageVersion === ScriptTarget.JSON) {
        result = Parser.parseSourceFile(fileName, sourceText, languageVersion, /*syntaxCursor*/ undefined, setParentNodes, ScriptKind.JSON);
    }
    else {
        result = Parser.parseSourceFile(fileName, sourceText, languageVersion, /*syntaxCursor*/ undefined, setParentNodes, scriptKind);
    }
    
    /* 略 */

    return result;
}
```
可以看出，其中的核心方法是`parseSourceFile`

```typescript
export function parseSourceFile(fileName: string, sourceText: string, languageVersion: ScriptTarget, syntaxCursor: IncrementalParser.SyntaxCursor | undefined, setParentNodes = false, scriptKind?: ScriptKind): SourceFile {

    /* 略 */

    // 初始化
    initializeState(fileName, sourceText, languageVersion, syntaxCursor, scriptKind);

    // parseSourceFileWorker 读取单词解析语句
    const result = parseSourceFileWorker(languageVersion, setParentNodes, scriptKind);

    clearState();

    return result;
}

function initializeState(_fileName: string, _sourceText: string, _languageVersion: ScriptTarget, _syntaxCursor: IncrementalParser.SyntaxCursor | undefined, _scriptKind: ScriptKind) {
    // 初始化构造函数
    NodeConstructor = objectAllocator.getNodeConstructor();
    TokenConstructor = objectAllocator.getTokenConstructor();
    IdentifierConstructor = objectAllocator.getIdentifierConstructor();
    PrivateIdentifierConstructor = objectAllocator.getPrivateIdentifierConstructor();
    SourceFileConstructor = objectAllocator.getSourceFileConstructor();

    fileName = normalizePath(_fileName);
    sourceText = _sourceText;
    languageVersion = _languageVersion; // es版本
    syntaxCursor = _syntaxCursor; // 增量解析，用于重复解析源码的性能优化
    scriptKind = _scriptKind; // 文件类型（js ts jsx json...）

    parseDiagnostics = [];
    parsingContext = 0;
    identifiers = new Map<string, string>(); // 存放单词字符串的引用，节省内存
    /* 略 */
    switch (scriptKind) {
        case ScriptKind.JS:
        case ScriptKind.JSX:
            contextFlags = NodeFlags.JavaScriptFile;
            break;
        case ScriptKind.JSON:
            contextFlags = NodeFlags.JavaScriptFile | NodeFlags.JsonFile;
            break;
        default:
            contextFlags = NodeFlags.None;
            break;
    }
    parseErrorBeforeNextFinishedNode = false;

    // 初始化scanner
    scanner.setText(sourceText);
    scanner.setOnError(scanError);
    scanner.setScriptTarget(languageVersion);
}

function parseSourceFileWorker(languageVersion: ScriptTarget, setParentNodes: boolean, scriptKind: ScriptKind): SourceFile {
    const isDeclarationFile = isDeclarationFileName(fileName);
    if (isDeclarationFile) {
        contextFlags |= NodeFlags.Ambient;
    }

    sourceFlags = contextFlags;

    // 获取单词 nextToken中会调用scan方法
    nextToken();

    // parseList使用传入的方法解析列表 parseStatement是解析语句的方法
    const statements = parseList(ParsingContext.SourceElements, parseStatement);
    Debug.assert(token() === SyntaxKind.EndOfFileToken);
    const endOfFileToken = addJSDocComment(parseTokenNode<EndOfFileToken>());

    const sourceFile = createSourceFile(fileName, languageVersion, scriptKind, isDeclarationFile, statements, endOfFileToken, sourceFlags);

    // A member of ReadonlyArray<T> isn't assignable to a member of T[] (and prevents a direct cast) - but this is where we set up those members so they can be readonly in the future
    processCommentPragmas(sourceFile as {} as PragmaContext, sourceText);
    processPragmasIntoFields(sourceFile as {} as PragmaContext, reportPragmaDiagnostic);

    sourceFile.commentDirectives = scanner.getCommentDirectives();
    sourceFile.nodeCount = nodeCount;
    sourceFile.identifierCount = identifierCount;
    sourceFile.identifiers = identifiers;
    sourceFile.parseDiagnostics = attachFileToDiagnostics(parseDiagnostics, sourceFile);
    if (jsDocDiagnostics) {
        sourceFile.jsDocDiagnostics = attachFileToDiagnostics(jsDocDiagnostics, sourceFile);
    }

    if (setParentNodes) {
        fixupParentReferences(sourceFile);
    }

    return sourceFile;

    function reportPragmaDiagnostic(pos: number, end: number, diagnostic: DiagnosticMessage) {
        parseDiagnostics.push(createDetachedDiagnostic(fileName, pos, end, diagnostic));
    }
}
function parseStatement(): Statement {
    switch (token()) {
        case SyntaxKind.SemicolonToken: // 分号
            return parseEmptyStatement();
        case SyntaxKind.VarKeyword: // var关键字
            return parseVariableStatement(getNodePos(), hasPrecedingJSDocComment(), /*decorators*/ undefined, /*modifiers*/ undefined);
        case SyntaxKind.FunctionKeyword: // function关键字
            return parseFunctionDeclaration(getNodePos(), hasPrecedingJSDocComment(), /*decorators*/ undefined, /*modifiers*/ undefined);
        /* 略 */
    }
    // 都没有则解析成表达式或
    return parseExpressionOrLabeledStatement();
}

```


节点`Node`结构如下：
```typescript
export interface ReadonlyTextRange {
    // 起止位置
    readonly pos: number;
    readonly end: number;
}
export interface Node extends ReadonlyTextRange {
        readonly kind: SyntaxKind;
        readonly flags: NodeFlags;
        readonly transformFlags: TransformFlags;       // 转换标志
        readonly decorators?: NodeArray<Decorator>;    // 装饰器数组（按文档顺序）
        readonly modifiers?: ModifiersArray;           // 修饰符数组
        id?: NodeId;                                   // 唯一ID（用于查找NodeLinks）
        readonly parent: Node;                         // 父节点（通过绑定初始化）
        original?: Node;                               // 如果这是更新的节点，则为原始节点。
        symbol: Symbol;                                // 由节点声明的符号（binding时初始化）
        locals?: SymbolTable;                          // 与节点关联的局部变量（binding时初始化）
        nextContainer?: Node;                          // 声明顺序中的下一个容器（binding时初始化）
        localSymbol?: Symbol;                          // 节点声明的局部符号（仅针对导出节点binding时初始化）
        flowNode?: FlowNode;                           //关联的FlowNode（binding时初始化）
        emitNode?: EmitNode;                           // 关联的 EmitNode（transforms时初始化）
        contextualType?: Type;                         // 用于在重载解析期间临时分配上下文类型
        inferenceContext?: InferenceContext;           // 上下文类型的推理上下文
        // ......
    }
```
### 作用域分析
binder.ts
### 流程分析
binder.ts
### 语义分析
checker.ts
### 语法转换
transformer.ts 

### 代码生成
emitter.ts