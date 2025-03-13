const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const setupUploadRoute = (wss) => {
  router.post('/', upload.single('video'), (req, res) => {
    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const videoPath = req.file.path;
    const sessionId = uuidv4();
    const outputDir = path.join(__dirname, '..', 'frames', sessionId);

    fs.mkdirSync(outputDir, { recursive: true });

    //执行ffmpeg命令

    //执行python代码

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        
        wss.clients.forEach(client => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({
              type: 'progress',
              progress: 100
            }));
          }
        });
        //模拟生成Gaussian点云数据
        const pointCloud = generatePointCloud(10000000);
        const compressed = Buffer.from(pointCloud.buffer);
        fs.writeFileSync(path.join(__dirname, '..', 'pointcloud.bin'), compressed);

        wss.clients.forEach(client => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({
              type: 'status',
              message: '处理完成',
              downloadUrl: '/download'
            }));
          }
        });
        res.json({ success: true, sessionId });
      } else {
        wss.clients.forEach(client => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({
              type: 'progress',
              progress: progress
            }));
          }
        });
      }
    }, 500);
  });

  return router;
};

function generatePointCloud(count) {
  const buffer = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    buffer[i] = Math.random() * 100;
    buffer[i+1] = Math.random() * 100;
    buffer[i+2] = Math.random() * 100;
  }
  return buffer;
}

module.exports = setupUploadRoute;