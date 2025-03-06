import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const addControls = (camera, renderer) => {
  const controls = new OrbitControls(camera, renderer.domElement);

  // 启用鼠标左键旋转
  controls.enableRotate = false;
  controls.rotateSpeed = 1.0;

  // 启用鼠标右键平移
  controls.enablePan = true;
  controls.panSpeed = 1.0;

  // 启用滚轮缩放
  controls.enableZoom = true;
  controls.zoomSpeed = 1.2;

  // 更新控制器
  controls.update();

  return controls;
};