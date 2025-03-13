const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const setupUploadRoute = require('./routes/uploadRoute');
const downloadRouter = require('./routes/downloadRoute');

const app = express();
const wss = new WebSocketServer({ port: 8080 });

// 添加CORS中间件
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// 注册路由
app.use('/upload', setupUploadRoute(wss));
app.use('/download', downloadRouter);

// 启动HTTP服务器
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});