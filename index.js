"use strict";

var execSync = require("child_process").execSync;
var fs = require("fs");
var path = require("path");

// 格式化时间
var dateFormat = function dateFormat(fmt, date) {
	var ret = void 0;
	var opt = {
		"Y+": date.getFullYear().toString(), // 年
		"m+": (date.getMonth() + 1).toString(), // 月
		"d+": date.getDate().toString(), // 日
		"H+": date.getHours().toString(), // 时
		"M+": date.getMinutes().toString(), // 分
		"S+": date.getSeconds().toString() // 秒
		// 有其他格式化字符需求可以继续添加，必须转化成字符串
	};
	for (var k in opt) {
		ret = new RegExp("(" + k + ")").exec(fmt);
		if (ret) {
			fmt = fmt.replace(ret[1], ret[1].length === 1 ? opt[k] : opt[k].padStart(ret[1].length, "0"));
		};
	};
	return fmt;
};

// 分支插件
var BranchPlugin = function BranchPlugin(options) {
	options = options || {};
	this.options = options;
};
BranchPlugin.prototype.apply = function (compiler) {
	var _this = this;

	compiler.hooks.afterEmit.tap("branch-plugin", function () {
		// 发布信息
		var branchInfo = "\n",
		    commandInfo = "\n",
		    userName = "\n",
		    mailName = "\n",
		    publishTime = "\n",
		    publishStr = "\n";

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

		publishStr = "\u8D44\u6E90\u5305\u63D0\u4F9B\u8005:" + userName + "\u6267\u884C\u811A\u672C:" + commandInfo + "\n\u90AE\u7BB1:" + mailName + "\u751F\u6210\u65E5\u671F:" + publishTime + "\n\u53D1\u5E03\u5206\u652F:" + branchInfo + new Array(80).join("*") + "\n";

		// 最后一次提交记录信息
		var commit = "",
		    name = "",
		    email = "",
		    date = "",
		    message = "",
		    versionStr = "";

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
			versionStr = "\u6700\u8FD1\u4E00\u6B21\u63D0\u4EA4:\ngit:" + commit + "\n\u4F5C\u8005:" + name + "<" + email + ">\n\u65E5\u671F:" + (date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()) + "\n\u8BF4\u660E:" + message + "\n" + new Array(80).join("*") + "\n";
		}
		// 写入目录

		var _ref = compiler.options.output || {},
		    pathUrl = _ref.path;

		var _ref2 = _this.options || {},
		    filename = _ref2.filename;

		if (!filename.startsWith("/")) {
			filename = "/" + filename;
		}
		try {
			fs.writeFileSync(path.join(pathUrl + filename), publishStr + versionStr, {
				encoding: "utf-8",
				mode: 438 /* =0666*/
				, flag: "w"
			});
		} catch (e) {}
	});
};

module.exports = BranchPlugin;
