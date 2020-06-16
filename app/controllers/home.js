const path = require('path');

class HomeCtl {
    index(ctx) {
        ctx.body = '<h1>首页</h1>';
    }
    upload(ctx) {
        const file = ctx.request.files.file;
        const basename = path.basename(file.path); // 接收一个 绝对路径 然后返回他的 basename（文件名 + 拓展名）
        ctx.body = { url: `${ctx.origin}/public/uploads/${basename}` };
    }
}

module.exports = new HomeCtl();