const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const error = require('koa-json-error');
const parameter = require('koa-parameter');
const mongoose = require('mongoose');
const path = require('path');
const app = new Koa();
const routing = require('./routes');
const { connectionStr } = require('./config');

// 连接MongoDB
mongoose.connect(connectionStr, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => console.log('MongoDB 连接成功了！'));
mongoose.connection.on('error', console.error);

app.use(koaStatic(__dirname, 'public'));
// 格式化异常处理的返回格式
app.use(error({
    postFormat: (e, {
            stack,
            ...rest
        }) =>
        process.env.NODE_ENV === 'production' ? rest : {
            stack,
            ...rest
        }

}));

app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true
    }
}));
// 注册请求参数校验中间件
app.use(parameter(app));
// 注册路由中间件
routing(app);

app.listen(3000, () => {
    console.log('程序已启动在3000端口');
});