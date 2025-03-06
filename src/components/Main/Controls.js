import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

export class Controls extends OrbitControls {
    constructor(camera, domElement) {
        super(camera, domElement);
        this.enableDamping = true;
        this.dampingFactor = 0.1;
        this.rotateSpeed = -0.3;
    }

    // 自定义的键盘事件绑定 (WSAD 移动)
    enableKeyboardMovement(speed = 0.1) {
        this.speed = speed;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.uprotate = false;
        this.downrotate = false;
        this.leftrotate = false;
        this.rightrotate = false;

        // 监听键盘按下和抬起事件
        document.addEventListener('keydown', (event) => this.onKeyDown(event), false);
        document.addEventListener('keyup', (event) => this.onKeyUp(event), false);
    }

    // 键盘按下时的动作
    onKeyDown(event) {
        if (event.shiftKey) {
            switch (event.code) {
                case 'KeyW':
                    this.uprotate = true;
                    break;
                case 'KeyS':
                    this.downrotate = true;
                    break;
                case 'KeyA':
                    this.leftrotate = true;
                    break;
                case 'KeyD':
                    this.rightrotate = true;
                    break;
            }
        } else {
            switch (event.code) {
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'KeyD':
                    this.moveRight = true;
                    break;
            }
        }
    }

    // 键盘抬起时的动作
    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.moveForward = false;
                this.uprotate = false;
                break;
            case 'KeyS':
                this.moveBackward = false;
                this.downrotate = false;
                break;
            case 'KeyA':
                this.moveLeft = false;
                this.leftrotate = false;
                break;
            case 'KeyD':
                this.moveRight = false;
                this.rightrotate = false;
                break;
        }
    }

    // 更新方法，处理键盘移动和旋转
    updateKeyboardMovement(camera) {
        const moveVector = new THREE.Vector3();
        const rotateVector = new THREE.Vector3();

        // 获取相机的前进方向和右方向
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        const up = new THREE.Vector3();

        // 获取相机的世界方向
        camera.getWorldDirection(forward);
        right.crossVectors(forward, camera.up).normalize();  // 右方向
        up.copy(camera.up);  // 上方向

        // 根据按键状态设置移动方向
        if (this.moveForward) {
            moveVector.add(forward);
        }
        if (this.moveBackward) {
            moveVector.sub(forward);
        }
        if (this.moveLeft) {
            moveVector.sub(right);
        }
        if (this.moveRight) {
            moveVector.add(right);
        }

        // 如果有移动输入
        if (moveVector.length() > 0) {
            moveVector.normalize();
            moveVector.multiplyScalar(this.speed);

            // 更新相机位置和控制器的target
            camera.position.add(moveVector);
            this.target.add(moveVector);  // 控制器目标随相机移动
        }

        // 旋转控制：按住 Shift 键时，绕相机本地坐标系旋转
        const rotationSpeed = 0.02; // 旋转速度

        // 绕相机的上下方向旋转
        if (this.uprotate) {
            rotateVector.copy(right);  // 使用右向量，绕相机的右轴旋转
            camera.rotateOnAxis(rotateVector, rotationSpeed);
        }

        if (this.downrotate) {
            rotateVector.copy(right);  // 使用右向量，绕相机的右轴反向旋转
            camera.rotateOnAxis(rotateVector, -rotationSpeed);
        }

        // 绕相机的左右方向旋转
        if (this.leftrotate) {
            rotateVector.copy(up);  // 使用上向量，绕相机的上轴旋转
            camera.rotateOnAxis(rotateVector, rotationSpeed);
        }

        if (this.rightrotate) {
            rotateVector.copy(up);  // 使用上向量，绕相机的上轴反向旋转
            camera.rotateOnAxis(rotateVector, -rotationSpeed);
        }

        // 如果旋转向量的长度大于零（表示发生了旋转）
        if (rotateVector.length() > 0) {
            // 更新目标点（随着旋转保持目标点旋转）
            const direction = new THREE.Vector3();
            direction.subVectors(this.target, camera.position);  // 计算相机与目标点之间的方向

            // 判断旋转的轴，决定绕哪个轴旋转目标点
            if (this.uprotate) {
                direction.applyAxisAngle(right, rotationSpeed);  // 如果是上下旋转，绕右向量（X轴）旋转
            }
            if (this.downrotate) {
                direction.applyAxisAngle(right, -rotationSpeed);
            }

            if (this.leftrotate) {
                direction.applyAxisAngle(up, rotationSpeed);  // 如果是左右旋转，绕上向量（Y轴）旋转
            }
            if (this.rightrotate) {
                direction.applyAxisAngle(up, -rotationSpeed);
            }
            // 更新目标点
            this.target.copy(camera.position).add(direction);
        }

        
        
    }
}
