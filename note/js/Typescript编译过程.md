# Typescript编译过程

## 什么是Typescript
- 基于javascript (js) 开发的语言
- 在js基础上添加了静态类型检查
- 代码能通过ts的编译器或babel转译成js

## 为什么需要Typescript

- 语法提示
- 类型检测系统弥补了Js的隐式类型转换导致的开发问题
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
- 编译过程 (program)
    - 词法分析 (parse)
    - 语法分析 (parse)
    - 语法绑定 (bind)
    - 代码检查 (check)
    - 语法转换 (transform)
    - 生成代码 (emit)

## 项目结构
typescript源码1.5g，就挑一些核心部分了解一下，主要是src/compiler目录下的代码，包含了最重要的编译部分

```
├── bin         最终给用户用的 tsc 和 tsserver 命令
├── doc         文档
├── lib         系统标准库（定义了es标准的方法、代码提示的国际化文件）
├── loc         （一些lcl文件，vscode的提示，有点类似html文件）
├── scripts     开发项目时的一些工具脚本
├── src         源码
│   ├── compiler        编译器代码（核心代码）
│   ├── services        语言服务，主要为 VSCode 使用，比如查找定义之类的功能
|   └── ...             
└── tests       单元测试
```

compiler目录结构

```
  ├── factory/              封装了一些工厂方法
  ├── build.ts              入口
  ├── program.ts            编译过程集合
  ├── sys.ts                文件操作
  ├── types.ts              类型定义
  ├── scanner.ts            词法分析
  ├── parser.ts             语法分析
  ├── utilities.ts          内部工具类
  ├── utilitiesPublic.ts    内部工具类
  ├── binder.ts             语法绑定
  ├── checker.ts            代码检查
  ├── transformer.ts        代码转换
  ├── transformers/         
  ├── emitter.ts            生成文件
  ├── tsbuild.ts            存放ts构建过程的状态类型
  ├── watch.ts              监听日志相关
  ├── visitorPublic.ts      访问ts内部对象的方法
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

![alt text](/static/img/word_tree.jpg "tree")

上面读取字符生成单词过程称之为组词，而创建语句的过程为组句

#### 组词
组词的代码主要在scanner.ts中，顾名思义，在扫描字符串过程中组成单词。
组词过程主要涉及以下代码
##### 1、CharacterCodes - 字符集
首先得辨识字符
```typescript
/**
 *  src/compiler/types.ts
*/
export const enum CharacterCodes {
        _0 = 0x30,
        _1 = 0x31,
        // 2-8
        _9 = 0x39,

        a = 0x61,
        // b-y
        z = 0x7A,

        A = 0x41,
        // B-Y
        Z = 0x5a,

        // 各类字符(略)
}
```
##### 2、 判断类型的方法
然后定义字符类型，比如判断数字`isDigit`
```typescript
/**
 *  src/compiler/scanner.ts
*/
function isDigit(ch: number): boolean {
    return ch >= CharacterCodes._0 && ch <= CharacterCodes._9;
}
```
判断是否是空格`isWhiteSpaceLike`
```typescript
export function isWhiteSpaceLike(ch: number): boolean {
    return isWhiteSpaceSingleLine(ch) || isLineBreak(ch);
}

export function isWhiteSpaceSingleLine(ch: number): boolean {

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

#### 3、SyntaxKind - 单词类型
接着就是定义字符组合成词之后的类型，比如数字、变量、空格、操作符等等
```typescript
// 语法类型，除了存放单词类型外还存放了节点类型
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
在执行词法分析时，会调用`createScanner`方法，返回`Scanner`对象，其中的`scan`方法作用就是扫描字符串并分词

```typescript
/**
 *  src/compiler/scanner.ts
*/
export interface Scanner {
    private pos     // 开始位置
    private end     // 结束位置
    private token   // 标记，存放当前的单词类型
    private tokenValue // 当前单词的值
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

总结： `scan`方法会循环读取字符，通过`CharacterCodes`判断需要走哪条对应单词类型的路径，比如数字 1-9 调用`scanNumber`方法读取完整数字，最后更新当前位置和单词缓存并返回单词类型`SyntaxKind`

### 语法分析

#### 什么是语法树
获得一个个单词后，我们还需要组合成一个句子，比如`php是世界上最好的语言`，可以分解为：
```
语句
├── php         名称
├── 是          代指
└── 语言        定义
    ├──世界上   修饰
    └── 最好    修饰
```
而一篇文章的结构又由很多语句组成
```
文章
├── 语句         
├── 语句         
└── 语句
```
typescript编译时，会把代码分解成类似上面的结构，称之为语法树：

```javascript
sourceFile // 源文件
├── 语句节点    //  import react from 'React'
|       ├── 类型节点    (import)
|       ├── 类型节点    (react)
|       ├── 类型节点    (from)
|       └── 类型节点    ('React')
├── 语句节点  // var a = 1 + 1
|       ├── 类型节点    (var)
|       ├── 类型节点    (a)
|       ├── 类型节点    (=)
|       └── 表达式节点  (1+1)
|               ├── 类型节点 1
|               ├── 类型节点 +
|               └── 类型节点 1
├── 其它节点    //  比如switch case   
```
其中，节点分成四大类：
- 类型节点 TypeNode
- 表达式节点 Expression
- 语句节点 Statement
- 其他节点（开始/结束/switch/case）

node的基本结构：
```typescript
export interface Node extends ReadonlyTextRange {
    readonly kind: SyntaxKind;            // 节点类型
    readonly parent: Node;                // 父节点
    id?: NodeId;                          
    locals?: SymbolTable;                 // 符号表
    flowNode?: FlowNode;                  // 流程节点
}
```
而这个语法树则由`compiler/parser.ts`文件负责

#### 语法树的生成过程

##### 1、入口
parser的运行过程大致如下
```
    createSourceFile ->
        parseSourceFile ->
            initializeState,
            parseSourceFileWorker ->
                parseList -> parseStatement -> parseXXXStatement 
```
`createSourceFile`是开始解析语法树的入口，传入文件名
```typescript
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

    // parseSourceFileWorker 开始解析
    const result = parseSourceFileWorker(languageVersion, setParentNodes, scriptKind);

    //清除状态
    clearState();

    return result;
}
```

`initializeState`会初始化一些构造函数、文件相关的信息（格式、es版本）、解析过程中的缓存变量、初始化scanner
```typescript
function initializeState(_fileName: string, _sourceText: string, _languageVersion: ScriptTarget, _syntaxCursor: IncrementalParser.SyntaxCursor | undefined, _scriptKind: ScriptKind) {
    // 初始化一些构造函数
    NodeConstructor = objectAllocator.getNodeConstructor();
    //...

    // 初始化文件相关的信息
    fileName = normalizePath(_fileName);
    sourceText = _sourceText;
    languageVersion = _languageVersion; // es版本
    syntaxCursor = _syntaxCursor; // 增量解析，用于重复解析源码的性能优化
    scriptKind = _scriptKind; // 文件格式（js ts jsx json...）

    parseDiagnostics = [];
    parsingContext = 0;
    identifiers = new Map<string, string>(); // 存放单词字符串的引用，节省内存
    /* 略 */
    //判断文件类型
    switch (scriptKind) {
        //..
    }
    parseErrorBeforeNextFinishedNode = false;

    // 初始化scanner
    scanner.setText(sourceText);
    scanner.setOnError(scanError);
    scanner.setScriptTarget(languageVersion);
}

```

开始解析
```typescript
function parseSourceFileWorker(languageVersion: ScriptTarget, setParentNodes: boolean, scriptKind: ScriptKind): SourceFile {

    // 获取单词 nextToken中会调用scan方法
    nextToken();
    // parseList遍历列表，调用parseStatement解析语句，返回nodeList
    const statements = parseList(ParsingContext.SourceElements, parseStatement);

    // 内部方法，调用了nodeFactory中的createSourceFile，会创建一个根结点挂载statements和其他信息
    const sourceFile = createSourceFile(fileName, languageVersion, scriptKind, isDeclarationFile, statements, endOfFileToken, sourceFlags);
    /* 略 */
    return sourceFile;
}

```
`parseList`组句
```typescript
function parseList<T extends Node>(kind: ParsingContext, parseElement: () => T): NodeArray<T> {
    const saveParsingContext = parsingContext;
    parsingContext |= 1 << kind;
    const list = [];
    const listPos = getNodePos();

    // 文件未结束时循环
    while (!isListTerminator(kind)) {
        // 如果是语句开头
        if (isListElement(kind, /*inErrorRecovery*/ false)) {
            const element = parseListElement(kind, parseElement);
            list.push(element);

            continue;
        }

        // 否则abortParsingListOrMoveToNextToken会抛出错误
        if (abortParsingListOrMoveToNextToken(kind)) {
            break;
        }
    }

    parsingContext = saveParsingContext;
    return createNodeArray(list, listPos);
}
```

这就是语法树的大致解析流程，其实就是根据语句开头的单词类型选择对应的方法解析，而具体的解析，举个例子，比如解析变量声明（`var a,b = 1`）

```typescript
// 解析语句
function parseStatement(): Statement {
    switch (token()) { // 获取当前单词类型
        case SyntaxKind.SemicolonToken: // 分号
            return parseEmptyStatement();
        case SyntaxKind.VarKeyword: // var关键字
            return parseVariableStatement(getNodePos(), /* 前面是否有JSDoc注释 */ hasPrecedingJSDocComment(), /*decorators*/ undefined, /*modifiers*/ undefined);
        case SyntaxKind.FunctionKeyword: // function关键字
            return parseFunctionDeclaration(getNodePos(), hasPrecedingJSDocComment(), /*decorators*/ undefined, /*modifiers*/ undefined);
        case ...
        /* 略 */
    }
    // 都没有则解析成表达式或标签语句
    return parseExpressionOrLabeledStatement();
}

// 解析var语句
function parseVariableStatement(pos: number, hasJSDoc: boolean, decorators: NodeArray<Decorator> | undefined, modifiers: NodeArray<Modifier> | undefined): VariableStatement {
    // 解析声明列表
    const declarationList = parseVariableDeclarationList(/*inForStatementInitializer*/ false);
    parseSemicolon();
    // 创建var语句节点
    const node = factory.createVariableStatement(modifiers, declarationList);
    node.decorators = decorators;
    // withJSDoc 添加注释 finishNode设置node剩下的一些属性
    return withJSDoc(finishNode(node, pos), hasJSDoc);
}
```

#### 上下文判断
除此之外，一些单词类型的检测需要前后单词判断，比如
- `await`，需要在`async`中使用，那前面遍历时遇到`async`就会设置允许`await`的`flag`（通过`doInAwaitContext`、`doInsideOfContext`方法来改变对应的`flag`）;
- `x => {...}`，在未读取 => 之前，x可以是变量，但此时x是参数，这就需要使用`lookAhead`提前获取箭头才能正确解析

### 语法绑定
前面的parser.ts完成了代码到语法树的转换，但语法树节点之间并没有关联起来，比如：
```typescript

function fn(){
    var a = 1
    return a
}
function fn1(){
    a = 1
    return a
}
```
`fn`中的`a`是同个作用域下的节点，`fn1`里的不是，这些关系在语法数树上也还没体现

这时候就需要`binder.ts`建立节点之间的联系了


![alt text](/static/img/statement_tree.jpg "tree")

binder会在声明变量或者引入外部文件的变量时创建符号，变量的Symbol属性存放着对应的引用，所以可以看到`fn1`的语法书没有对应的符号表
```javascript
    createBinder ->
        bindSourceFile->
            bind
```



与之前的`parser`过程类似，`createBinder`初始化`binder`，传入之前`parser`得到的语法树根节点`sourceFile`，执行`bind`方法。

bind方法
``` typescript
function bind(node: Node | undefined): void {
    if (!node) {
        return;
    }
    // 给当前节点绑定parent
    setParent(node, parent);
    const saveInStrictMode = inStrictMode;

    // 根据节点选择对应的绑定方法
    bindWorker(node);

    // 绑定作用域和子节点
    if (node.kind > SyntaxKind.LastToken) {
        const saveParent = parent;
        parent = node;
        const containerFlags = getContainerFlags(node);
        // 如果没有创建容器（独立的作用域，比如块级作用域、class、method等）
        if (containerFlags === ContainerFlags.None) {
            // 绑定子节点
            bindChildren(node);
        }
        else {
            // 绑定container后再绑定子节点
            bindContainer(node, containerFlags);
        }
        parent = saveParent;
    }
    else {
        const saveParent = parent;
        if (node.kind === SyntaxKind.EndOfFileToken) parent = node;
        bindJSDoc(node);
        parent = saveParent;
    }
    inStrictMode = saveInStrictMode;
}
```
```typescript
// 根据节点类型选择对应的方法
function bindWorker(node: Node) {
    switch (node.kind) {
        // 如果是变量类型
        case SyntaxKind.Identifier:
            // 如果在命名空间定义。
            if ((node as Identifier).isInJSDocNamespace) {
                let parentNode = node.parent;
                // 需要循环找到最上层的父节点
                while (parentNode && !isJSDocTypeAlias(parentNode)) {
                    parentNode = parentNode.parent;
                }
                // 绑定在父节点
                bindBlockScopedDeclaration(parentNode as Declaration, SymbolFlags.TypeAlias, SymbolFlags.TypeAliasExcludes);
                break;
            }
        // ...
    }
}

// 根据块级作用域类型绑定节点
function bindBlockScopedDeclaration(node: Declaration, symbolFlags: SymbolFlags, symbolExcludes: SymbolFlags) {
    switch (blockScopeContainer.kind) {
        case SyntaxKind.ModuleDeclaration:
            // declareModuleMember 创建模块引入的符号，以便之后的文件关联
            declareModuleMember(node, symbolFlags, symbolExcludes);
            break;
        case SyntaxKind.SourceFile:
            if (isExternalOrCommonJsModule(container as SourceFile)) {
                declareModuleMember(node, symbolFlags, symbolExcludes);
                break;
            }
        default:
            // 没有locals属性(没有创建块级作用域)
            if (!blockScopeContainer.locals) {
                // 创建符号表 存放在locals
                blockScopeContainer.locals = createSymbolTable();
                // addToContainerChain会将当前作用域与上个作用域（lastContainer）关联，即作用域链的实现
                addToContainerChain(blockScopeContainer);
            }
            // 将当前节点添加到符号表
            declareSymbol(blockScopeContainer.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes);
    }
}

// 给对应的符号表
function declareSymbol(symbolTable: SymbolTable, parent: Symbol, node: Declaration, includes: SymbolFlags, excludes: SymbolFlags): Symbol {
    const isDefaultExport = hasModifier(node, ModifierFlags.Default);

    // The exported symbol for an export default function/class node is always named "default"
    const name = isDefaultExport && parent ? "default" : getDeclarationName(node);

    let symbol: Symbol;
    // 根据name在symbolTable中找到相同的symbol，否则创建一个新的
    if (name === undefined) {
        // createSymbol负责更新symbolCount和创建symbol
        symbol = createSymbol(SymbolFlags.None, "__missing");
    }
    else {
        // 这里负责查找已有的symbol，还有判断是否有命名冲突
    }
    
    // 将symbol与node关联
    addDeclarationToSymbol(symbol, node, includes);
    symbol.parent = parent;
    return symbol;
}

```
除了词与词之间的联系，语句的顺序也需要考虑，比如
```typescript
function fn(){
    let res 
    try {
        // 1
    } catch(err){
        // 2
    } finally{
        // 3
    }

    return res // 4
}
```
`try catch`语句，`binder.ts`会通过检测关键字给节点添加`flowNode`，比如 3 部分的语句节点会存放两个流程，分别指向1和2的末尾。

总结：`binder`通过`container`和`symoblTable`完成作用域的区分和节点之间的关联，通过`flowNode`完成流程关联
### 代码检查
这部分和代码检查都由`checker.ts`负责，checker的流程如下：
```
    createTypeChecker ->
        initializeTypeChecker ->
            bindSourceFile (绑定节点)，
            mergeSymbolTable (合并符号表)
                ->返回checker  
```

如果当前文件是公共方法，`initializeTypeChecker`会将符号表放到`globals`中，比如`Array`、`Symbol`等
```typescript
// 初始化checker
function initializeTypeChecker() {
    // 调用binder绑定节点
    for (const file of host.getSourceFiles()) {
        bindSourceFile(file, compilerOptions);
    }

    amalgamatedDuplicates = new Map();

    // 存放了各种依赖
    let augmentations: LiteralExpression[][]; 
    // 将公共包的符号表合并到globals中
    for (const file of host.getSourceFiles()) {
        if (!isExternalOrCommonJsModule(file)) {
            mergeSymbolTable(globals, file.locals!);
        }
        // file.moduleAugmentations是在createProgram时收集的依赖，program是整个解析的启动器
        if (file.moduleAugmentations.length) {
            (augmentations || (augmentations = [])).push(file.moduleAugmentations);
        }
        if (augmentations) {
            // merge _global_ module augmentations.
            // this needs to be done after global symbol table is initialized to make sure that all ambient modules are indexed
            for (const list of augmentations) {
                for (const augmentation of list) {
                    if (!isGlobalScopeAugmentation(augmentation.parent as ModuleDeclaration)) continue;
                    mergeModuleAugmentation(augmentation);
                }
            }
        }
        // ...
    }
    // ...
}

// 遍历符号表并合并符号
function mergeSymbolTable(target: SymbolTable, source: SymbolTable, unidirectional = false) {
    source.forEach((sourceSymbol, id) => {
        const targetSymbol = target.get(id);
        target.set(id, targetSymbol ? mergeSymbol(targetSymbol, sourceSymbol, unidirectional) : sourceSymbol);
    });
}
```
至此，语法检查的基础完成了

#### 语法检查
首先看下入口：
```
    checkSourceFile ->
        checkSourceFileWorker ->
            checkGrammarSourceFile(检查顶级声明)，
            checkSourceElement


```
其实套路基本和前面的一样，直接看worker
```typescript
function checkSourceFileWorker(node: SourceFile) {
    const links = getNodeLinks(node);
    if (!(links.flags & NodeCheckFlags.TypeChecked)) {
        if (skipTypeChecking(node, compilerOptions, host)) {
            return;
        }

        // 检查顶级声明
        checkGrammarSourceFile(node);

        // clear(potentialThisCollisions);
        // clear(potentialNewTargetCollisions);
        // clear(potentialWeakMapSetCollisions);
        // clear(potentialReflectCollisions);

        // 检查所有节点
        forEach(node.statements, checkSourceElement);
        // 检查是否正常结束
        checkSourceElement(node.endOfFileToken);

        //...
    }
}
```
其中的关键方法是`checkGrammarSourceFile`,`checkSourceElement`，分别负责顶级声明和节点的语法检查，直接看`checkSourceElement`.

```typescript
function checkSourceElementWorker(node: Node): void {
    // 根节点忽略
    if (isInJSFile(node)) {
        forEach((node as JSDocContainer).jsDoc, ({ tags }) => forEach(tags, checkSourceElement));
    }

    const kind = node.kind;
    if (cancellationToken) {
        // cancellationToken 终端类型检查，用于性能优化
        switch (kind) {
            case SyntaxKind.ModuleDeclaration:
            case SyntaxKind.ClassDeclaration:
            case SyntaxKind.InterfaceDeclaration:
            case SyntaxKind.FunctionDeclaration:
                cancellationToken.throwIfCancellationRequested();
        }
    }

    // 是否是不可到达的流程节点（比如return语句之后的代码）
    if (kind >= SyntaxKind.FirstStatement && kind <= SyntaxKind.LastStatement && node.flowNode && !isReachableFlowNode(node.flowNode)) {
        errorOrSuggestion(compilerOptions.allowUnreachableCode === false, node, Diagnostics.Unreachable_code_detected);
    }

    switch (kind) {
        // 表达式语句
        case SyntaxKind.ExpressionStatement:
            return checkExpressionStatement(node as ExpressionStatement);
        case SyntaxKind.ImportDeclaration:
            return checkImportDeclaration(node as ImportDeclaration);
        // .. 
    }
}
```


接下来看个例子，比如:
```typescript
import b from 'test'
let a
a = b
```

赋值场景，checker的检测过程，赋值语句属于表达式语句，调用`checkExpressionStatement`方法，大致流程如下：

```
checkExpressionStatement ->
    checkExpressionWorker ->
        checkExpression ->
            checkExpressionWorker,
            instantiateTypeWithSingleGenericCallSignature（获取表达式的计算类型）
```

`checkExpression`检查表达式
```typescript
function checkExpression(node: Expression | QualifiedName, checkMode?: CheckMode, forceTuple?: boolean): Type {
    tracing?.push(tracing.Phase.Check, "checkExpression", { kind: node.kind, pos: node.pos, end: node.end });
    const saveCurrentNode = currentNode;
    currentNode = node;
    instantiationCount = 0;
    // 
    const uninstantiatedType = checkExpressionWorker(node, checkMode, forceTuple);
    // 推断整个表达式类型的
    const type = instantiateTypeWithSingleGenericCallSignature(node, uninstantiatedType, checkMode);
    if (isConstEnumObjectType(type)) {
        checkConstEnumAccess(node, type);
    }
    currentNode = saveCurrentNode;
    tracing?.pop();
    return type;
}
```
由于我们是赋值语句，所以不需要看表达式的返回类型, 直接看`checkExpressionWorker`
```typescript
function checkExpressionWorker(node: Expression | QualifiedName, checkMode: CheckMode | undefined, forceTuple?: boolean): Type {
    switch(kind){
        // 检查变量是否合法
        case SyntaxKind.Identifier:
            return checkIdentifier(node as Identifier, checkMode);
        // 检查二元表达式, 即赋值语句的类型
        case SyntaxKind.BinaryExpression:
            return checkBinaryExpression(node as BinaryExpression, checkMode);
        // ...
    }
}

const trampoline = createBinaryExpressionTrampoline(onEnter, onLeft, onOperator, onRight, onExit, foldState);

function checkBinaryExpression(node: BinaryExpression, checkMode: CheckMode | undefined) {
    const result = trampoline(node, checkMode);
    Debug.assertIsDefined(result);
    return result;
};
```

`createBinaryExpressionTrampoline`会创建一个状态机，因为二元表达式可以嵌套（a = a ... = a + 1），这里我们知道最终会判断具体的变量类型，比如`a`和 1就行了
``` typescript
/**
    * 创建一个状态机，它使用堆遍历 `BinaryExpression` 以减少大树上的调用堆栈深度。
    * @param onEnter 输入`BinaryExpression` 时评估回调。返回新的用户定义状态以在行走时与节点关联。
    * @param onLeft 回调在走`BinaryExpression` 的左侧时进行评估。返回一个 `BinaryExpression` 以继续行走，或返回一个 `void` 以前进到右侧。
    * @param onRight 回调在“BinaryExpression”的右侧行走时评估。返回一个 `BinaryExpression` 以继续行走，或返回一个 `void` 以前进到节点的末尾。
    * @param onExit 退出`BinaryExpression` 时评估回调。返回的结果将被折叠到父状态，或者如果在顶部框架，则从 walker 返回。
    * @param foldState 回调在嵌套`onExit` 的结果应该被折叠到该节点的父节点的状态中时进行评估。
    * @returns 一个函数，它使用上述回调遍历一个 `BinaryExpression` 节点，从最外层的 `BinaryExpression` 节点返回对 `onExit` 的调用结果。
*/
export function createBinaryExpressionTrampoline<TOuterState, TState, TResult>(
    onEnter, onLeft, onOperator, onExit, foldState: ((userState: TState, result: TResult, side: "left" | "right") => TState) | undefined,
) {
    const machine = new BinaryExpressionStateMachine(onEnter, onLeft, onOperator, onRight, onExit, foldState);
    return trampoline;

    function trampoline(node: BinaryExpression, outerState?: TOuterState) {
        const resultHolder: { value: TResult } = { value: undefined! };
        // 从enter开始 BinaryExpressionState.enter会执行onEnter
        const stateStack: BinaryExpressionState[] = [BinaryExpressionState.enter];
        const nodeStack: BinaryExpression[] = [node];
        const userStateStack: TState[] = [undefined!];
        let stackIndex = 0;
        while (stateStack[stackIndex] !== BinaryExpressionState.done) {
            stackIndex = stateStack[stackIndex](machine, stackIndex, stateStack, nodeStack, userStateStack, resultHolder, outerState);
        }
        Debug.assertEqual(stackIndex, 0);
        return resultHolder.value;
    }
}

export function nextState<TOuterState, TState, TResult>(machine: BinaryExpressionStateMachine<TOuterState, TState, TResult>, currentState: BinaryExpressionState) {
    switch (currentState) {
        case enter:
            // 从onLeft开始
            if (machine.onLeft) return left;
            // falls through
        case left:
            if (machine.onOperator) return operator;
            // falls through
        case operator:
            if (machine.onRight) return right;
            // falls through
        case right: return exit;
        case exit: return done;
        case done: return done;
        default: Debug.fail("Invalid state");
    }
}
```

由于b是变量，最终会调用`checkIdentifier`检查
```typescript
function checkIdentifier(node: Identifier, checkMode: CheckMode | undefined): Type {
    // 获取符号
    const symbol = getResolvedSymbol(node);
    // 不知道的类型，报错
    // if (symbol === unknownSymbol) {
    //     return errorType;
    // }

    // // 作为参数的语法判断
    // if (symbol === argumentsSymbol) {
    //     //...
    // }

    // // 将别名标记为引用
    // if (!(node.parent && isPropertyAccessExpression(node.parent) && node.parent.expression === node)) { // 排除属性表达式
    //     markAliasReferenced(symbol, node);
    // }

    // // 在合并后的符号表中找到符号
    // const localOrExportSymbol = getExportSymbolOfValueSymbolIfExported(symbol);
    // // 如果有别名（a as b）, 转换
    // const sourceSymbol = localOrExportSymbol.flags & SymbolFlags.Alias ? resolveAlias(localOrExportSymbol) : localOrExportSymbol;
    // // 声明未调用的提示
    // if (sourceSymbol.declarations && getDeclarationNodeFlagsFromSymbol(sourceSymbol) & NodeFlags.Deprecated && isUncalledFunctionReference(node, sourceSymbol)) {
    //     addDeprecatedSuggestion(node, sourceSymbol.declarations, node.escapedText as string);
    // }
    // ...
    let type = getTypeOfSymbol(localOrExportSymbol);
    // ...
    //根据不同情况返回type...
}
```
上面的代码可以看到其中的关键是符号的获取`getResolvedSymbol`和`getTypeOfSymbol`，这个方法最终会调用`resolveNameHelper`，会向外循环直到找到对应的符号，然后`getTypeOfSymbol`获取符号的类型，

```typescript
function resolveNameHelper(
    location: Node | undefined,
    name: __String,
    meaning: SymbolFlags,
    nameNotFoundMessage: DiagnosticMessage | undefined,
    nameArg: __String | Identifier | undefined,
    isUse: boolean,
    excludeGlobals: boolean,
    lookup: typeof getSymbol, issueSuggestions?: boolean): Symbol | undefined {
    const originalLocation = location; // needed for did-you-mean error reporting, which gathers candidates starting from the original location
    let result: Symbol | undefined;
    let lastLocation: Node | undefined;

    loop: while (location) {
        // 如果有符号表
        if (location.locals && !isGlobalSourceFile(location)) {
            // 如果获取到符号（lookup即getSymbol）
            if (result = lookup(location.locals, name, meaning)) {
                let useResult = true;
                if (isFunctionLike(location) && lastLocation && lastLocation !== (location as FunctionLikeDeclaration).body) {
                    // 函数类型
                    // ...
                }
                else if (location.kind === SyntaxKind.ConditionalType) {
                    // 条件类型
                    // ...
                }
                // 找到后退出循环
                if (useResult) {
                    break loop;
                }
                else {
                    result = undefined;
                }
            }
        }
        withinDeferredContext = withinDeferredContext || getIsDeferredContext(location, lastLocation);
        switch (location.kind) {
            // 各种类型判断，符合的返回对应symbol
            // ...
        }
        // ...
        lastLocation = location;
        location = location.parent;
    }

    // ... 
    return result;
}

// 获取符号对应的类型
function getTypeOfSymbol(symbol: Symbol): Type {
    const checkFlags = getCheckFlags(symbol);
    // ...
    // import b from 'test'中的b是Alias类型
    if (symbol.flags & SymbolFlags.Alias) {
        return getTypeOfAlias(symbol);
    }
    return errorType;
}
```
由于`b`是定义在`test.ts`文件，就需要跨语法树查找
#### 跨语法树查找

由于获取到的符号是import语句定义的别名，需要调用`getTypeOfAlias`在获取对应文件的符号表找到对应类型
```
    getTypeOfAlias ->
        resolveAlias ->
            getDeclarationOfAliasSymbol ->
                getTargetOfAliasDeclaration ->
                    getTargetOfImportSpecifier->
                getTypeOfSymbol (这时候获取的就是对应文件里的symbol了) ->
                    getTypeOfVariableOrParameterOrProperty
```
具体代码旧不贴了，在获取到类型后，二元表达式最终会调用 `checkBinaryLikeExpressionWorker`
```typescript
checkBinaryLikeExpressionWorker(node.left, node.operatorToken, node.right, leftType, rightType, node)
```
判断左右的类型，返回对应结果，这就是赋值语句大致的语法检测过程
## 总结
typescript编译过程

