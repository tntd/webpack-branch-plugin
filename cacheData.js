const path = require('path');
const fs = require('fs');

const dirCache = {};

function mkdir(filePath) {
  const arr = filePath.split('/');
  let dir = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (dir && !dirCache[dir] && !fs.existsSync(dir)) {
      dirCache[dir] = true;
      fs.mkdirSync(dir);
    }
    dir = dir + '/' + arr[i];
  }
}

module.exports = function (proxy, { open, distPath }) {
  if (!open) {
    return proxy;
  }

  let mockData = {};
  const rootPath = path.join(distPath, 'index.js');
  try {
    // 获取当前配置
    mockData = require(rootPath);
  } catch (error) {
    // 首次自动创建
    mkdir(rootPath);
    fs.writeFileSync(rootPath, 'module.exports = {}');
  }

  const saveEntry = (err, url) => {
    if (err) {
      console.error('保存响应数据时出错:', err);
    } else {
      if (!mockData[url]) {
        mockData[url] = url.slice(1);
        fs.writeFileSync(
          rootPath,
          `module.exports = ${JSON.stringify(mockData, null, 2)}`
        );
      }
    }
  };

  return Object.keys(proxy).reduce((obj, key) => {
    obj[key] = {
      ...proxy[key],
      onProxyRes: (proxyRes, req) => {
        // 数据类型
        const contentType = proxyRes.headers['content-type'];
        const url = req.originalUrl.split('?')[0];
        let body = [];
        proxyRes.on('data', (chunk) => {
          body.push(chunk);
        });
        proxyRes.on('end', () => {
          body = Buffer.concat(body);
          const fileDistPath = path.join(distPath, url);

          if (!fs.existsSync(fileDistPath)) {
            // 创建文件夹
            mkdir(fileDistPath);
          }

          if (contentType.includes('application/json')) {
            // 处理其他类型的响应，例如JSON
            try {
              const filePath = path.join(distPath, url + '.js');
              fs.writeFile(
                filePath,
                `module.exports = ${JSON.stringify(JSON.parse(body), null, 2)}`,
                (err) => {
                  saveEntry(err, url);
                }
              );
            } catch (err) {
              console.error('保存响应数据时出错:', err);
            }
          } else if (contentType.includes('application/octet-stream')) {
            const contentDisposition = proxyRes.headers['content-disposition'];
            const pathList = url.split('/').filter((i) => !!i);
            fs.writeFileSync(path.join(distPath, url + '_'), body);
            fs.writeFile(
              path.join( distPath, url + '.js'),
              `const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // 设置Content-Disposition头
  res.setHeader('content-disposition','${contentDisposition}');
  res.setHeader('content-type', '${contentType}');
  return fs.readFileSync(path.resolve(__dirname, '${pathList[pathList.length - 1]}_'));
}`,
              (err) => {
                saveEntry(err, url);
              }
            );
          }
        });
      }
    };
    return obj;
  }, {});
};
