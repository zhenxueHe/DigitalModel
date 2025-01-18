import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

class App {
  constructor() {
    this.scene = new THREE.Scene();

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(10, 4, 4);
    this.camera.lookAt(this.scene.position);

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding; // 确保颜色渲染正确
    document.body.appendChild(this.renderer.domElement);

    // 添加光源
    this.addLighting();

    // 添加OrbitControls
    this.control = new OrbitControls(this.camera, this.renderer.domElement);
    this.control.enableZoom = true;

    // 加载环境贴图
    this.loadEnvironment();

    // 加载GLB模型
    this.loadGLBModel();

    // 添加动画控制按钮和速度调节滑块
    this.createStopButton();
    this.createSpeedControl();

    // 启动渲染循环
    this.start();
  }

  addLighting() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    // 点光源
    const pointLight = new THREE.PointLight(0xffffff, 1, 50);
    pointLight.position.set(5, 10, 5);
    this.scene.add(pointLight);

    // 光源辅助工具（可选）
    const lightHelper = new THREE.PointLightHelper(pointLight);
    this.scene.add(lightHelper);
  }

  loadEnvironment() {
    const hdrLoader = new RGBELoader();
    hdrLoader.load('/path/to/environment.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping; // 反射贴图
      this.scene.environment = texture; // 设置环境贴图
      this.scene.background = texture; // 可选：用作背景
    });
  }

  loadGLBModel() {
    const loader = new GLTFLoader();
    loader.load(
        '/src/Palletezing1.glb',
        (gltf) => {
            const model = gltf.scene;
            this.scene.add(model);

            // 遍历每个部件进行单独调整
            model.traverse((node) => {
                if (node.isMesh) {
                    node.material.metalness = 1;
                    node.material.roughness = 0.2;
                    node.material.envMapIntensity = 2;

                    // 检查部件名称并调整位置
                    if (node.name === 'Base') {
                        node.position.set(0, 0, 0); // 设置基座位置
                    } else if (node.name === 'Arm') {
                        node.position.set(0, 1.5, 0); // 设置机械臂位置
                    } else if (node.name === 'Gripper') {
                        node.position.set(0, 3, 0); // 设置抓手位置
                    }
                }
            });

            // 处理动画
            this.mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                const action = this.mixer.clipAction(clip);
                action.play();
            });

            console.log('Model and animations loaded');
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
            console.error('An error happened', error);
        }
    );
}


  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // 更新动画混合器
    if (this.mixer) {
      const deltaTime = this.clock.getDelta();
      this.mixer.update(deltaTime);
    }

    // 更新控制器
    this.control.update();

    // 渲染场景
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    this.clock = new THREE.Clock();
    this.animate();
  }

  createStopButton() {
    const button = document.createElement('button');
    button.innerHTML = 'Stop Animation';
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.left = '10px';
    button.style.zIndex = 10;
    button.style.padding = '10px';
    button.style.backgroundColor = '#008CBA';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.fontSize = '16px';
    button.style.cursor = 'pointer';

    document.body.appendChild(button);

    button.addEventListener('click', () => {
      this.stopAnimation();
    });
  }

  stopAnimation() {
    if (this.mixer) {
      this.mixer.stopAllAction();
      console.log('Animation stopped.');
    }
  }

  createSpeedControl() {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0.1;
    slider.value = 1;
    slider.max = 3;
    slider.style.position = 'absolute';
    slider.style.top = '50px';
    slider.style.left = '10px';
    slider.style.zIndex = 10;

    document.body.appendChild(slider);

    slider.addEventListener('input', () => {
      this.setAnimationSpeed(slider.value);
    });
  }

  setAnimationSpeed(speed) {
    if (this.mixer) {
      this.mixer._actions.forEach((action) => {
        action.timeScale = parseFloat(speed);
      });
      console.log(`Animation speed set to: ${speed}`);
    }
  }
}

export default App;
