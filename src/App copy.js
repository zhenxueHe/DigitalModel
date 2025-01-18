import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class App {
  constructor() {
    this.scene = new THREE.Scene();

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // 设置相机位置
    this.camera.position.set(10, 4, 4);
    this.camera.lookAt(this.scene.position);

    // 添加光源
    this.addLighting();

    // 加载GLB模型
    this.loadGLBModel();

    // 添加OrbitControls
    this.control = new OrbitControls(this.camera, this.renderer.domElement);
    this.control.enableZoom = true;

    // 创建控制按钮
    this.createControlButtons();

    // 启动渲染循环
    this.start();
  }

  addLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // 环境光
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 定向光
    directionalLight.position.set(1, 1, 1).normalize();
    this.scene.add(directionalLight);
  }

  loadGLBModel() {
    const loader = new GLTFLoader();

    loader.load(
      '/src/final_robot.glb', // 替换为你的 GLB 文件路径
      (gltf) => {
        // 将加载的模型添加到场景中
        this.model = gltf.scene;
        this.scene.add(this.model);

        console.log("Model loaded:", gltf.scene);

        // 打印整个模型的结构，帮助你确认节点名称
        this.printObjectTree(gltf.scene);

        this.Mesh_2 = this.model.getObjectByName('Mesh_2');
        this.Mesh_3 = this.model.getObjectByName('Mesh_3');
        this.Mesh_3_1 = this.model.getObjectByName('Mesh_3_1');
        this.Mesh_4 = this.model.getObjectByName('Mesh_4');
        this.Mesh_4_1 = this.model.getObjectByName('Mesh_4_1');
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('An error happened', error);
      }
    );
  }

  // 打印整个对象树的递归函数
  printObjectTree(obj, depth = 0) {
    console.log(' '.repeat(depth * 2) + obj.name); // 输出当前对象的名称
    obj.children.forEach(child => {
      this.printObjectTree(child, depth + 1); // 递归子对象
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this)); // 动画循环

    // 更新控制器
    this.control.update();

    // 渲染场景和相机
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    this.animate(); // 启动渲染循环
  }

  createControlButtons() {
    // 创建仅控制旋转的按钮
    this.createRotationControl();
  }

  createRotationControl() {
    const button = document.createElement('button');
    button.innerHTML = 'Rotate';

    button.style.position = 'absolute';
    button.style.top = '70px';
    button.style.left = '10px';
    button.style.zIndex = 10;
    button.style.padding = '10px';
    button.style.backgroundColor = '#FF5722';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.fontSize = '16px';
    button.style.cursor = 'pointer';

    document.body.appendChild(button);

    button.addEventListener('click', () => {
      // 执行旋转动作
      this.performRotate(this.Mesh_2, 'z', Math.PI / 4);
      this.performRotate(this.Mesh_3, 'z', Math.PI / 4);
      this.performRotate(this.Mesh_3_1, 'z', Math.PI / 4);
      this.performRotate(this.Mesh_4, 'z', Math.PI / 4);
      this.performRotate(this.Mesh_4_1, 'z', Math.PI / 4);
    });
  }

  // 仅执行旋转动作
  performRotate(object, rotationAxis, rotationAngle, duration = 1000) {
    const startAngle = object.rotation[rotationAxis];
    const endAngle = startAngle + rotationAngle;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 更新旋转
      object.rotation[rotationAxis] = startAngle + (endAngle - startAngle) * progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }
}

export default App;
