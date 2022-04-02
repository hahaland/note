# redis
http://www.redis.net.cn
## redis简介
一种高性能的key-value数据库，可用作数据库、缓存、流引擎和消息代理

### 特点
- 运行在内存中，因此读写速度快，操作复杂的数据结构也更检点
和其他key-value缓存相比，redis有三个特点：
- 支持数据持久化，内存中的数据会储存在磁盘，重启时可再次加载
- 可存储更多数据结构（set、zset、hash、stream等）
### 优势


### 数据类型
- Strings
- Lists 列表
- Sets 集
- Hash Map
- Sorted Sets 排序集
- Bitmaps HyperLogLogs 

  基于 String 基本类型的数据类型，但有自己的语义

- stream 流

  对于按事件发生的顺序记录事件很有用