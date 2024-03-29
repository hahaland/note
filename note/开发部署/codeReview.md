# 代码审核

## 目的和作用
1、提高代码可维护性和质量

2、避免只有一个人知道代码作用的情况

3、统一团队代码风格与质量，更好的提升团队成员水平

## 审核点

1、 代码性能（运行时的性能）
- 常见的性能优化（react、webpack、html、js、css、animation）
- 框架开发时常见的注意点（比如react hook的一些注意事项）
- 内存泄漏问题（比如全局变量、事件解绑、闭包）
- 组件通信问题
  - 单向数据流，避免内部隐式修改上层变量
  - 状态管理 ？

2、代码组织
- 代码可维护性，比如实现尽量职责单一，模块化，便于复用和扩展
- 代码鲁棒性，是否有考虑异常情况，有相应的异常处理
- 代码侵入性，对原有代码的改动是否是必要，且影响范围是否有评估及测试，特别是公用库代码（模块化可以减少侵入性代码的产生）

3、 代码风格
- 代码风格，比如命名、格式（可以通过代码提交前的自动化检查）
- 代码可读性，比如必要的注释、逻辑是否简单清晰、日志易读

## 模块化

模块化的目的是为了更好的复用和扩展，最终还是为了提高效率和方便维护，过度拆分也会影响可读性和复用

模块化代码可以从以下几点着手：

- 相同或相似代码多处使用
- 根据代码间的关联拆分
  - 比如常见的初始化，可能由很多个步骤完成，比如数据初始化，渲染初始化，这些都可以拆分成多个初始函数，在上层包裹一层init，即功能模块化、流程模块化
- 从函数用途出发，工具函数更偏向单一职责，而业务函数偏向单一业务功能（比如完成一个业务操作，可能需要*请求数据 - 校验参数 - 数据处理 - 分发数据*等，这一系列操作完成才算操作完成，那么这就能抽成一个业务函数）

## 怎么做

- 确定可执行的规范
  
  从上述角度出发，根据项目类型、团队情况因地制宜，制定相应的规范，并在团队内达成共识
  - 比如项目是通用库，就需要更严格的代码审核
  - 比如项目重业务，那审核时还需要更多的业务考量
- 逐渐实施，可以在某些项目实践，过程中可以根据需要优化规范



*参考资料：*
- https://juejin.cn/post/7014730244280025118
- https://zhuanlan.zhihu.com/p/344108356
- https://www.yinwang.org/blog-cn/2015/11/21/programming-philosophy