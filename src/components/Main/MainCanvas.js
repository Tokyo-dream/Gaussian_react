import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import PubSub from 'pubsub-js';
// import { CameraController } from './CameraController';
import { Controls } from './Controls.js';

const MainCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const mainCanvas = canvasRef.current;
    
    // 初始化 three.js 场景
    const threeScene = new THREE.Scene();

    // 添加相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const cameraController = new Controls(camera, mainCanvas);
    cameraController.enableKeyboardMovement(0.04);
    PubSub.subscribe('LookAtArea', (_, data) => {
      switch(data){
        case '大厅':
          camera.position.set(0.79,-0.0028,-0.85572);
          cameraController.target.set(0.03745, 0.42985, 0.06832);
          camera.up.set(0.06431, -0.99760, -0.02570);
          camera.updateProjectionMatrix();
          break;
        case '电梯':
          camera.position.set(0.66275, 0.01383, -5.29234);
          cameraController.target.set(0.66769, 1.38689, 0.216);
          camera.up.set(0.04012, -0.99889, -0.02454);
          camera.updateProjectionMatrix();
          break;
        case '走廊':
          camera.position.set(0.42357, 0.08244, -6.14497);
          cameraController.target.set(5.37338, 2.30555, -2.34959);
          camera.up.set(0.04012, -0.99889, -0.02455);
          camera.updateProjectionMatrix();
          break;
        default:
          break;
      }
    });
    camera.position.set(0.79,-0.0028,-0.85572);
    camera.up.set(0.06431, -0.99760, -0.02570);
    cameraController.target.set(0.03745, 0.42985, 0.06832);    
    // 修改viewer配置
    const viewer = new GaussianSplats3D.Viewer({
        'splatAlphaRemovalThreshold': 5,
        'showLoadingUI': true,
        'progressiveLoad': false,
        'threeScene': threeScene,
        'useBuiltInControls': false,
        'camera': camera,
        'rootElement': mainCanvas,
        'selfDrivenMode': true,
    });

    // 添加动画循环
    function animate() {
        requestAnimationFrame(animate);
        cameraController.update();
        cameraController.updateKeyboardMovement(camera); // 更新相机位置
    }

    viewer.addSplatScene('/good1.ply')
    .then(() => {
        viewer.start();
        animate(); // 启动动画循环
    });

    // 清理函数
    return () => {
        if (viewer) {
            viewer.dispose();
        }
        if (cameraController) {
            cameraController.dispose();
        }
    };

  }, []);

  return (
    <div 
      ref={canvasRef} 
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative'
      }}
    />
  );
};

export default MainCanvas;