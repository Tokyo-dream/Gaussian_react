import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { addControls } from './controls';
import { handleMeshClick } from './clickHandler';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';

const OverlayCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const overlayCanvas = canvasRef.current;

    // 创建场景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, overlayCanvas.clientWidth / overlayCanvas.clientHeight, 0.1, 1000);
    camera.position.y = 10;

    const renderer = new THREE.WebGLRenderer({
      canvas: overlayCanvas,
      alpha: true // 确保支持透明度
    });
    renderer.setSize(overlayCanvas.clientWidth, overlayCanvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0.2); // 设置为黑色但完全透明

    const controls = addControls(camera, renderer);
    // 添加坐标轴
    // const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);

    // 加载本地 PLY 点云文件
    const loader = new PLYLoader();
    loader.load(
      '/output.ply', // 替换为你的 PLY 文件路径
      (geometry) => {
        geometry.computeVertexNormals(); // 计算顶点法线
        const material = new THREE.PointsMaterial({
          size: 0.01, // 点的大小
          vertexColors: true, // 保留原始颜色
        });
        const points = new THREE.Points(geometry, material);
        scene.add(points);
      },
    );

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 窗口大小调整时更新渲染器和相机
    const handleResize = () => {
      camera.aspect = overlayCanvas.clientWidth / overlayCanvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(overlayCanvas.clientWidth, overlayCanvas.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    const handleMouseEnter = () => {
      overlayCanvas.style.transform = 'scale(2)';
      overlayCanvas.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      overlayCanvas.style.transform = 'scale(1)';
      overlayCanvas.style.opacity = '0.4';
    };

    let mouseDownPosition = null;

    const handleMouseDown = (event) => {
      mouseDownPosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = (event) => {
      if (mouseDownPosition) {
        const deltaX = event.clientX - mouseDownPosition.x;
        const deltaY = event.clientY - mouseDownPosition.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // 如果鼠标移动距离小于一定阈值，则认为是一次点击
        if (distance < 5) {
          handleMeshClick(event, overlayCanvas, camera, scene);
        }

        mouseDownPosition = null;
      }
    };

    // 添加事件监听器
    overlayCanvas.addEventListener('mouseenter', handleMouseEnter);
    overlayCanvas.addEventListener('mouseleave', handleMouseLeave);
    overlayCanvas.addEventListener('mousedown', handleMouseDown);
    overlayCanvas.addEventListener('mouseup', handleMouseUp);

    // 清理事件监听器
    return () => {
      overlayCanvas.removeEventListener('mouseenter', handleMouseEnter);
      overlayCanvas.removeEventListener('mouseleave', handleMouseLeave);
      overlayCanvas.removeEventListener('mousedown', handleMouseDown);
      overlayCanvas.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="overlayCanvas"
      style={{ width: '20%', height: '20%', transition: 'transform 0.3s, opacity 0.3s', transformOrigin: 'top right' }}
    />
  );
};

export default OverlayCanvas;