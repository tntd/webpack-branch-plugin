const execSync = require("child_process").execSync;
const fs = require("fs");
const path = require("path");

// 格式化时间
const dateFormat = (fmt, date) => {
	let ret;
	let opt = {
		"Y+": date.getFullYear().toString(), // 年
		"m+": (date.getMonth() + 1).toString(), // 月
		"d+": date.getDate().toString(), // 日
		"H+": date.getHours().toString(), // 时
		"M+": date.getMinutes().toString(), // 分
		"S+": date.getSeconds().toString() // 秒
		// 有其他格式化字符需求可以继续添加，必须转化成字符串
	};
	for (let k in opt) {
		ret = new RegExp("(" + k + ")").exec(fmt);
		if (ret) {
			fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")));
		};
	};
	return fmt;
};

// 分支插件
const BranchPlugin = function(options) {
	options = options || {};
	this.options = options;
};
BranchPlugin.prototype.apply = function(compiler) {
	compiler.hooks.afterEmit.tap("branch-plugin", ()=>{
		// 发布信息
		let [branchInfo, commandInfo, userName, mailName, publishTime, publishStr] = ["\n", "\n", "\n", "\n", "\n", "\n"];
		try {
			commandInfo = process.env["npm_lifecycle_script"].toString().trim();
		} catch (e) {}
		try {
			branchInfo = execSync("git rev-parse --abbrev-ref HEAD");
		} catch (e) {}
		try {
			userName = execSync("git config user.name");
		} catch (e) {}
		try {
			mailName = execSync("git config user.email");
		} catch (e) {}
		try {
			publishTime = dateFormat("YYYY-mm-dd HH:MM:SS", new Date());
		} catch (e) {}

		publishStr = `资源包提供者:${userName}执行脚本:${commandInfo}\n邮箱:${mailName}生成日期:${publishTime}\n发布分支:${branchInfo}${new Array(80).join("*")}\n`;

		// 最后一次提交记录信息
		let [commit, name, email, date, message, versionStr] = ["", "", "", "", "", ""];
		try {
			commit = execSync("git show -s --format=%H").toString().trim();
		} catch (e) {}
		try {
			name = execSync("git show -s --format=%cn").toString().trim();
		} catch (e) {}
		try {
			email = execSync("git show -s --format=%ce").toString().trim();
		} catch (e) {}
		try {
			date = new Date(execSync("git show -s --format=%cd").toString());
		} catch (e) {}
		try {
			message = execSync("git show -s --format=%s").toString().trim(); // 说明
		} catch (e) {}

		if (commit || name || email || date || message) {
			versionStr = `最近一次提交:\ngit:${commit}\n作者:${name}<${email}>\n日期:${date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()}\n说明:${message}\n${new Array(80).join("*")}\n`;
		}
		// 写入目录
		let { path: pathUrl } = compiler.options.output || {};
		let { filename } = this.options || {};
		if (!filename.startsWith("/")) {
			filename = "/" + filename;
		}
		try {
			fs.writeFileSync(path.join(pathUrl + filename), publishStr + versionStr, {
				encoding: "utf-8",
				mode: 438 /* =0666*/,
				flag: "w"
			});
		} catch (e) {
		}
	});
};

module.exports = BranchPlugin;
