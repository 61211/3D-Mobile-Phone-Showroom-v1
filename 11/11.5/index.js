import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { hdr, plane, model } from './model.js';
import GUI from 'lil-gui'

const gui = new GUI()
gui.close()

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    1,
    5000
)
camera.position.set(24, 52, 253)
camera.lookAt(11, -2, 0)

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
    antialias: true,// 启用抗锯齿
})
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// 告诉threejs你的屏幕的设备像素比
renderer.setPixelRatio(window.devicePixelRatio)

// 轨道控制器
const orbitControls = new OrbitControls(camera, renderer.domElement)
orbitControls.target.set(11, -2, 0)
orbitControls.update()
// 上下旋转范围
orbitControls.maxPolarAngle = Math.PI / 2.1;
// 缩放范围
orbitControls.minDistance = 100;
orbitControls.maxDistance = 300;

// 环境光:没有特定方向，整体改变场景的光照明暗
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(100, 60, 50)
directionalLight.castShadow = true
scene.add(directionalLight)
directionalLight.shadow.mapSize.set(1024, 1024)
// 模糊弱化阴影边缘
directionalLight.shadow.radius = 3;

// 参数2表示平行光.position附近方框的尺寸
const dirHelper = new THREE.DirectionalLightHelper(directionalLight, 10);
scene.add(dirHelper);

// 可视化平行光阴影对应的正投影相机对象
const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(cameraHelper);

// 设置三维场景计算阴影的范围
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 70;
directionalLight.shadow.camera.bottom = -50;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 200;

gui.add(ambient, 'intensity', 0, 2).name('环境光.intensity');

const obj = {
    R: 100,
    angle: 0,
    envMapIntensity: 1.0,
};
gui.add(obj, 'R', 0, 300).onChange(function (value) {
    directionalLight.position.x = value * Math.cos(obj.angle);
    directionalLight.position.z = value * Math.sin(obj.angle);
    dirHelper.update();
});
gui.add(obj, 'angle', 0, Math.PI * 2).onChange(function (value) {
    directionalLight.position.x = obj.R * Math.cos(value);
    directionalLight.position.z = obj.R * Math.sin(value);
    dirHelper.update();
});
gui.add(directionalLight.position, 'y', 0, 300).onChange(function (value) {
    dirHelper.update();
});
gui.add(obj, 'envMapIntensity', 0, 2).onChange(function (value) {
    // 递归遍历，批量设置模型材质的`.envMapIntensity`属性
    model.traverse(function (obj) {
        if (obj.isMesh) {
            obj.material.envMapIntensity = value;
        }
    });
})

// 阴影子菜单
const shadowFolder = gui.addFolder('平行光阴影');
shadowFolder.close()
const cam = directionalLight.shadow.camera;
// 相机left、right等属性变化执行.updateProjectionMatrix();
// 相机变化了，执行CameraHelper的更新方法.update();
shadowFolder.add(cam, 'left', -500, 0).onChange(function (v) {
    cam.updateProjectionMatrix();//相机更新投影矩阵
    cameraHelper.update();//相机范围变化了，相机辅助对象更新
});
shadowFolder.add(cam, 'right', 0, 500).onChange(function (v) {
    cam.updateProjectionMatrix();
    cameraHelper.update();
});
shadowFolder.add(cam, 'top', 0, 500).onChange(function (v) {
    cam.updateProjectionMatrix();
    cameraHelper.update();
});
shadowFolder.add(cam, 'bottom', -500, 0).onChange(function (v) {
    cam.updateProjectionMatrix();
    cameraHelper.update();
});
shadowFolder.add(cam, 'far', 0, 1000).onChange(function (v) {
    cam.updateProjectionMatrix();
    cameraHelper.update();
});

// AxesHelper：辅助观察的坐标系
const axesHelper = new THREE.AxesHelper(150)
scene.add(axesHelper)

// 引入模型
scene.add(model, plane)

scene.background = hdr
scene.environment = hdr

// 循环渲染
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
}

animate()

window.onresize = function () {
    // 更新canvas画布的尺寸
    renderer.setSize(window.innerWidth, window.innerHeight)
    // 更新相机的宽高比
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
}
