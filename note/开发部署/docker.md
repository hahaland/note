# DOCKER
go开发的应用容器引擎，特点是容器化、沙箱机制，不同容器之间互不影响，也是serverless（无服务器架构）的基础

## 基本概念
镜像（Image）、容器（Container）、仓库（Repository）
- 镜像（Image）
    
    使用Dockerfile脚本执行创建的一个应用包，比如
    ```docker
        docker build -t mydocker/node-server:v1 .
        // . 指的当前目录
    ```
    通常包含应用的启动命令
    
-  容器

    ```docker
        docker run --name ${容器名} ${镜像} ${命令}
    ```
    通过上述命令给镜像创建一个独立的运行环境，并执行镜像里的指令

- 仓库

    存放镜像的地方

## 镜像与dockerfile脚本

### 基础镜像

构建镜像时，可以依赖一个父镜像作为底层镜像，一起打包后，成为一个全新的镜像，这个被依赖的叫基础镜像。

常见的基础镜像：
- 操作系统镜像
- 开发语言镜像
- 应用镜像（nginx tomcat等）
- 其他镜像（gitlab镜像、jenkins镜像等）

```docker
// From 指定依赖的基础镜像
From registry.cn-hangzhou.aliyuncs.com/sessionboy/node:7.5
```

## Dockerfile命令

基础镜像指令
- From 指定依赖的基础镜像
- MAINTAINER 描述镜像的维护者信息


操作指令
- COPY 拷贝宿主机的源目录/文件到容器内的某个目录
```docker
COPY ${source} ${target}
```
- ADD 与COPY类似，压缩文件会自动解压（仅在需要自动解压时使用）
- WORKDIR，指定RUN、CMD、ENTRYPOINT 指令的工作目录
- RUN，接受命令作为参数并用于创建镜像。（命令较多时可用"\"换行）
```docker
RUN ["/bin/bash", "-c", "echo hello"]
RUN rm ./tmp \
    npm install
```
- USER: 设置运行容器的UID
- VOLUME：容器数据卷相关的命令。可以创建/删除数据卷，指定容器可以访问的目录
- ONBUILD：接受其他命令做为参数，在作为基础镜像时执行命令（From）,用来根据参数作差异化编译
- ENV 设置环境变量
- EXPOSE 指定暴露的端口

容器启动时执行的指令
- CMD 指定启动容器时执行的命令，每个Dockerfile只能有一个，参数会被RUN覆盖
- ENTRYPOINT 启动后执行，参数不会被覆盖

更多命令


...

## 镜像管理
## 操作容器
## 数据管理
### 数据卷
供一个或多个容器使用的特殊目录。提供了以下特性
- 容器之间的共享
- 修改即刻生效
- 数据卷的更新不会影响镜像
- 容器删除也会存在

```docker
docker volume create my-vol
```

## 底层实现
### 联合文件系统

## Kubernetes - 开源容器编排引擎
一个容器的调度服务，用户能透过 Kubernetes 管理不同服务器的不同容器，而无需用户进行复杂的设置工作
### 基本概念
- node（节点）： 一个运行Kubernetes的主机
- pod（容器组）：包含若干个容器，同个组内的容器共享一个存储卷
- pos-states（容器组生命周期），包括所有容器组状态集合（状态类型，生命周期、时间、重启策略、 replication controllers）
-  replication controllers：复制控制器？复制容器组
- services（服务）：
-卷
- 标签
- 接口权限：端口，ip地址、代理、防火墙规则
- web界面
- cli命令行

## 远程开发
vscode通过docker来创建远程开发的服务