import * as THREE from 'three';
import PubSub from 'pubsub-js';
// 预设的区域
const predefinedAreas = [
  { name: '大厅', minX: -2, maxX: 1.5, minZ: -0.5, maxZ: 4, color: 0xff0000 },
  { name: '电梯', minX: 0, maxX: 1.5, minZ: -5, maxZ: -0.5, color: 0x00ff00 },
  { name: '走廊', minX: 0, maxX: 10, minZ: -7, maxZ: -5, color: 0x0000ff },
];

let highlightedMesh = null;

export const handleMeshClick = (event, canvas, camera, scene) => {
  const rect = canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    const intersect = intersects[0];
    const point = intersect.point;

    // 判断点击位置所在的区域
    for (const area of predefinedAreas) {
      if (
        point.x >= area.minX &&
        point.x <= area.maxX &&
        point.z >= area.minZ &&
        point.z <= area.maxZ
      ) {
        console.log('Clicked area:', area.name);

        // 移除之前高亮的区域
        if (highlightedMesh) {
          scene.remove(highlightedMesh);
        }

        // 高亮对应区域
        const highlightMaterial = new THREE.MeshBasicMaterial({
          color: area.color,
          transparent: true,
          opacity: 0.5,
        });
        const highlightGeometry = new THREE.BoxGeometry(
          area.maxX - area.minX,
          0.1,
          area.maxZ - area.minZ
        );
        highlightedMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlightedMesh.position.set(
          (area.minX + area.maxX) / 2,
          0.05,
          (area.minZ + area.maxZ) / 2
        );
        scene.add(highlightedMesh);

        PubSub.publish('LookAtArea', area.name);
        return area.name;
      }
    }
  }
  return null;
};