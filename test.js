const os = require('os');
const execSync = require("child_process").execSync;


// node版本
nodeVersion = execSync("node -v");
console.log('nodejs版本' + nodeVersion.toString().trim())

// npm版本
npmVersion = execSync("npm -v");
console.log('npm版本' + npmVersion.toString().trim())

// 当前文件夹
console.log('当前文件夹' + __dirname)

// 操作系统名称，基于linux的返回linux,基于苹果的返回Darwin,基于windows的返回Windows_NT
var type = os.type();
console.log('操作系统名称', type);

// 操作系统类型,返回值有'darwin', 'freebsd', 'linux', 'sunos' , 'win32'
var platform = os.platform();
console.log('操作系统类型', platform);

// cpu架构
var arch = os.arch();
console.log('获取cpu(处理器架构)', arch);

// 操作系统主机名
var hostname = os.hostname()
console.log('操作系统主机名', hostname);

// 操作系统版本
var release = os.release();
console.log('操作系统版本', release);
