# Quickr

A Node.js framework for future🚀

面向 Serverless 的 Node.js 框架

## 特性

- 底层运行时无关，服务器、云函数内均可高性能运行
- 开发范式约束
- 零配置

## Install 安装

```js
$ npm i -g quickr
```

## Quick Start 快速开始

首先我们创建目录 `quickr-demo`，然后在此目录下创建 `api` 目录和 `api/index.js` 文件：

```sh
$ mkdir quickr-demo
$ cd quickr-demo
$ mkdir api
$ touch api/index.js
```

以下是 `api/index.js` 的内容：

```js
// api/index.js
export default function() {
    return 'Hello World'
}
```

然后运行：

```sh
$ quickr start
```

这条命令在本地启动了一个 Web 服务器：http://localhost:3000

## Guides 开发指南

### Hot Reload 热重载

开发时，使用以下命令即可在本地开启开发服务器，任何文件的变更都会使服务器自动重启。

```sh
$ quickr dev
```

### Routing 路由

#### 路由规则
Quickr 使用了**基于文件系统的路由**，在 `api` 目录下的文件，会被自动设置为路由的「终点」。例如：

| 路由 | 文件路径 |
| ---- | -------- |
| `/` | `api/index.js` |
| `/foo` | `api/foo.js` |
| `/user/:uid` | `api/user/[uid].js` |
| `/:id/get` | `api/[id]/get.js` |

#### 路由处理函数

每个路由文件应当暴露一个或多个**路由处理函数**，Quickr 会将这些函数绑定到对应的路由方法上，绑定规则如下：

- 如果路由文件导出了多个 HTTP 处理函数（函数名诸如 `get()`, `post()`, `put()`, `delete()`, `options()`），那么这些方法会直接绑定到对应的路由方法上；
- 否则会使用默认导出（`export default`）的函数，如果没有，则不进行绑定。

```js
// 所有的 HTTP 方法，都会返回 "hello world"
export default async function(req, res) {
    return 'hello world'
}
```

```js
// GET 方法，会返回 "This is a get method"
export function get() {
    return 'This is a get method'
}

// POST 方法，会返回 "This is a post method"
export function post() {
    return 'This is a post method'
}

// 除去 GET 和 POST 以外，都会返回 "hello world"
export default async function(req, res) {
    return 'hello world'
}
```

路由处理函数的返回值，会被转换为 HTTP 响应体：

```js
// text/plain
export default async function(req, res) {
    return 'hello world'
}

// text/html
export default async function(req, res) {
    return '<h1>hey!</h1>'
}

// application/json
export default async function(req, res) {
    return {
        foo: 'bar'
    }
}
```

### 日志

#### 默认日志

在[路由处理函数](#路由处理函数)内，可以调用 `this.logger.log(message)`，以默认格式打印日志：

```js
// api/index.js
export default async function(req, res) {
    this.logger.log('loglog')
    return 'hello world'
}
```

输出日志格式如下：

```
      date          type   route    requestId  message
2020-6-11 15:37:18 [INFO] [GET /]  [YFMyFC7V_] loglog
```

#### 日志分级

日志分为 `DEBUG`、`INFO`、`WARN`、`ERROR` 四个级别，可以调用 logger 下对应的方法：

```js
// DEBUG
this.logger.debug('this is debug log')

// INFO
this.logger.info('this is info log')
this.logger.log('this is info log')

// WARN
this.logger.warn('this is warning log')

// ERROR
this.logger.error('this is error log')
```

#### 自定义 Logger

开发者可以使用自定义 Logger，自行实现日志逻辑。

在项目下创建 `logger/index.js` 目录，在导出的默认函数内，实现自己的日志逻辑即可：

```js
// logger/index.js
export default function(meta) {
    const {
        requestId, // 请求 ID
        time,      // 日志时间
        method,    // HTTP 请求方法
        path,      // HTTP 请求路径
        type,      // 日志级别
        payload    // 日志内容，以数组形式
    } = meta
    console.log(`${time} ${payload.join(' ')}`)
}
```

### 中间件

施工中

### 错误处理

施工中
