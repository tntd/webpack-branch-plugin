#### 💡当静态资源发布到服务器上 傻傻分不清 是谁打的包？哪个版本？什么时候打的？
此插件会获取构建静态资源的用户、邮箱、分支、时间。同时会拉取最后一次的提交信息

<br/>

#### ❓怎么使用
```javascript
const BranchPlugin = require("@tntd/webpack-branch-plugin");

module.exports = {
    plugins: [
        // 要记得写你的输出文件哟
        new BranchPlugin({
			filename: config.common.sourcePrefix + ".branch_info.txt"
		})
    ]
}
```

#### 🔍预览
```javascipt
资源包提供者：**
邮箱：**.**@qq.com
生成日期：2020-05-06 18:24:39
发布分支：dev/2.3.0-model-sp
************************************************
最近一次提交:
作者：王小明<xiaoming.wang@qq.com>
日期：2020-5-6 18:7
message：选中箭头为绿色
commitId：173b669a6d48f86615588**94519f45e3f36b
************************************************
环境信息：
node版本：v13.12.0
npm版本：6.14.4
项目文件夹：/Users/tntd/webpack-branch-plugin
操作系统名称：Darwin
操作系统类型：darwin
处理器架构：x64
操作系统主机名：HI-xiaoming
作系统版本：20.6.0
************************************************
```
