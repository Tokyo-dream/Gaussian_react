const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', 'pointcloud.bin');
  const fileSize = fs.statSync(filePath).size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    let start = parseInt(parts[0], 10);
    let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    start = Math.floor(start / 12) * 12;
    end = Math.ceil((end + 1) / 12) * 12 - 1;
    end = Math.min(end, fileSize - 1);

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable ' + start + ' >= ' + fileSize);
      return;
    }

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': 'application/octet-stream'
    });

    const fileStream = fs.createReadStream(filePath, { start, end });
    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'application/octet-stream'
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

module.exports = router;