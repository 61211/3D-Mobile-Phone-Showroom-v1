import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { phone, envMap } from './model.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { ShaderPass } from 'three/examples/jsm/Addons.js';
import { GammaCorrectionShader } from 'three/examples/jsm/Addons.js';
import { GlitchPass } from 'three/examples/jsm/Addons.js'

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    1,
    5000
);
camera.position.set(21, 55, 149);
camera.lookAt(21, 27, -1);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
    antialias: true, // 启用抗锯齿
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x808080);
document.body.appendChild(renderer.domElement);

window.onresize = function () {
    // 更新canvas画布的尺寸
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 更新相机的宽高比
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};

// 后处理
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// OutlinePass
const v2 = new THREE.Vector2(window.innerWidth, window.innerHeight);
const outlinePass = new OutlinePass(v2, scene, camera);
composer.addPass(outlinePass);
outlinePass.edgeThickness = 4.0;
outlinePass.edgeStrength = 6;
outlinePass.pulsePeriod = 2;

// 抗锯齿
const pixelRatio = renderer.getPixelRatio();
const smaaPass = new SMAAPass(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
composer.addPass(smaaPass);

// 闪屏效果
const glitchPass = new GlitchPass()
//composer.addPass(glitchPass)

// 调整画面
const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
composer.addPass(gammaCorrectionPass)

// 单击添加后处理效果
renderer.domElement.addEventListener('click', (event) => {
    const px = event.offsetX;
    const py = event.offsetY;

    const x = (px / window.innerWidth) * 2 - 1;
    const y = -(py / window.innerHeight) * 2 + 1;

    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);
    for (let i = 0; i < phone.children.length; i++) {
        const group = phone.children[i]
        group.traverse((object) => {
            if (object.isMesh) {
                object.ancestoes = group
            }
        })
    }
    const intersects = rayCaster.intersectObjects(phone.children);
    if (intersects.length > 0) {
        outlinePass.selectedObjects = [intersects[0].object.ancestoes];
    }
});

// 双击移除后处理效果
renderer.domElement.addEventListener('dblclick', (event) => {
    const px = event.offsetX;
    const py = event.offsetY;

    const x = (px / window.innerWidth) * 2 - 1;
    const y = -(py / window.innerHeight) * 2 + 1;

    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(new THREE.Vector2(x, y), camera);
    console.log('x,y', x, y);

    const intersects = rayCaster.intersectObjects(phone.children);
    console.log('intersects', intersects)

    if (intersects.length > 0) {
        outlinePass.selectedObjects = [];
    }
});

// 告诉threejs你的屏幕的设备像素比
renderer.setPixelRatio(window.devicePixelRatio);

// 轨道控制器
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.target.set(21, 27, -1);
orbitControls.update();

// 环境光:没有特定方向，整体改变场景的光照明暗
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);
const directionLight = new THREE.DirectionalLight();
scene.add(directionLight);

// 引入模型
scene.add(phone);

phone.traverse((child) => {
    if (child.isMesh) {
        child.material.envMap = envMap  // 给每个网格的材质添加环境贴图
        child.material.envMapIntensity = 2
        child.material.roughness = 0.01 // 越低越光滑（更能反光）
        child.material.metalness = 0.7 // 越高越金属（更能反光）
        child.material.clearcoat = 1
        child.material.clearcoatRoughness = 0
        child.material.needsUpdate = true  // 更新材质
        child.castShadow = true;
        child.receiveShadow = true;
        console.log('查看环境贴图是否成功', child.material.envMap)
    }
})

scene.environment = envMap

// 渲染循环
function animate() {
    requestAnimationFrame(animate);
    composer.render();
}

animate();
