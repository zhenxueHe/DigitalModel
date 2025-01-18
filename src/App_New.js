import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


let scene, camera, renderer, controls;
const armParts = {};

function setupGUI() {
    const gui = new GUI();
    const params = {
        base: 0,
        base_1: 0,
        vertical_joint: 0,
        horizontal_joint: 0,
        gripper: 0,
    };

    gui.add(params, 'base', -180, 180).onChange((value) => setAngle('base', 'y', value));
    gui.add(params, 'base_1', -90, 90).onChange((value) => setAngle('base_1', 'x', value));
    gui.add(params, 'vertical_joint', -45, 45).onChange((value) => setAngle('vertical_joint', 'z', value));
    gui.add(params, 'horizontal_joint', -90, 90).onChange((value) => setAngle('horizontal_joint', 'x', value));
    gui.add(params, 'gripper', 0, 30).onChange((value) => setAngle('gripper', 'z', value));
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    // 添加 OrbitControls 来控制相机
    controls = new OrbitControls(camera, renderer.domElement);
}

function loadParts() {
    const loader = new GLTFLoader();
    const parts = [
        { name: 'base', path: '/models/1base.glb' },
        { name: 'base_1', path: '/models/2base_1.glb' },
        { name: 'vertical_joint', path: '/models/3竖向连接1.glb' },
        { name: 'horizontal_joint', path: '/models/4横向连接1.glb' },
        { name: 'gripper', path: '/models/5抓手.glb' },
    ];

    // 使用 Promise.all 确保所有模型都加载完成
    const promises = parts.map(part => new Promise((resolve, reject) => {
        loader.load(part.path, (gltf) => {
            const model = gltf.scene;
            console.log(`Loaded: ${part.name}`);
            resolve({ part, model });
        }, null, (error) => {
            reject(error);
        });
    }));

    Promise.all(promises).then(results => {
        let parent = null;
        results.forEach(({ part, model }, index) => {
            if (index === 0) {
                scene.add(model);
                parent = model;
            } else {
                if (parent) {
                    parent.add(model);
                    parent = model;
                } else {
                    console.error(`Parent is null when adding ${part.name}`);
                }
            }
            armParts[part.name] = model;
        });
    }).catch(error => {
        console.error('Error loading parts:', error);
    });
}

function rotatePart(partName, axis, angle) {
    if (!armParts[partName]) return;

    const radians = THREE.MathUtils.degToRad(angle);
    armParts[partName].rotation[axis] = radians;
}

function setAngle(partName, axis, angle) {
    const range = limits[partName];
    if (angle < range.min || angle > range.max) {
        console.warn(`${partName} angle out of range`);
        return;
    }
    rotatePart(partName, axis, angle);
}

const limits = {
    base: { min: -180, max: 180 },
    base_1: { min: -90, max: 90 },
    vertical_joint: { min: -45, max: 45 },
    horizontal_joint: { min: -90, max: 90 },
    gripper: { min: 0, max: 30 },
};

function animate() {
    requestAnimationFrame(animate);
    // 更新 OrbitControls
    controls.update();
    renderer.render(scene, camera);
}

init();
loadParts();
setupGUI();
animate();