import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial } from '@react-three/drei';
import { Progress } from 'antd';
import './App.css';

function App() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pointsData, setPointsData] = useState(null);
  const workerRef = useRef(null);

  // WebSocket客户端
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => console.log('WebSocket连接已建立');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'status') {
        if (message.message === '处理完成') setIsProcessing(false);
      } else if (message.type === 'progress') {
        setProcessingProgress(message.progress);
        if (message.progress === 0) setIsProcessing(true);
      }
    };
    return () => ws.close();
  }, []);

  // 处理文件上传
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);

    try {
      await axios.post('http://localhost:3000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
    } catch (error) {
      console.error('上传失败:', error);
    }
  };

  // 下载并加载点云
  const handleDownload = async () => {
    try {
      const startTime = Date.now();
      const chunkSize = 1024 * 1024;
      let chunks = [];

      const headResponse = await axios.head('http://localhost:3000/download');
      const totalSize = parseInt(headResponse.headers['content-length'], 10);
      const chunkCount = Math.ceil(totalSize / chunkSize);
      const alignedChunkSize = Math.floor(chunkSize / 12) * 12;

      const downloadTasks = [];
      for (let i = 0; i < chunkCount; i++) {
        const start = i * alignedChunkSize;
        const end = Math.min(start + alignedChunkSize - 1, totalSize - 1);
        const rangeHeader = `bytes=${start}-${end}`;
        downloadTasks.push(
          axios.get('http://localhost:3000/download', {
            responseType: 'arraybuffer',
            headers: { Range: rangeHeader }
          })
        );
      }

      const responses = await Promise.all(downloadTasks);
      chunks = responses.map(response => new Uint8Array(response.data));
      setUploadProgress(100);

      workerRef.current = new Worker(new URL('./mergeWorker.js', import.meta.url));
      const transferBuffers = chunks.map(chunk => chunk.buffer);
      workerRef.current.postMessage({ chunks }, transferBuffers);

      workerRef.current.onmessage = (e) => {
        const { data } = e.data;
        setPointsData(new Float32Array(data));
      };

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
      };
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  // 组件卸载时清理Worker
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  return (
    <div className="App">
      <div className="upload-section">
        <input type="file" accept="video/*" onChange={handleFileUpload} />
        <div>上传/下载进度: <Progress percent={uploadProgress} /></div>
        <div>处理进度: <Progress percent={processingProgress} /></div>
        <button onClick={handleDownload} disabled={isProcessing}>
          下载点云模型
        </button>
      </div>
      <div className="three-container">
        <Canvas camera={{ position: [0, 0, 100], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            screenSpacePanning={false}
            minDistance={10}
            maxDistance={500}
            maxPolarAngle={Math.PI / 2}
          />
          {pointsData && (
            <Points positions={pointsData}>
              <PointMaterial
                size={0.001}
                color="#00ff00"
                transparent
                sizeAttenuation
              />
            </Points>
          )}
        </Canvas>
      </div>
    </div>
  );
}

export default App;