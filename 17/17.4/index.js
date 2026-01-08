// import * as THREE from 'three';
// import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
// import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/Addons.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { phone, envMap } from './model.js';
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
// import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
// import { ShaderPass } from 'three/examples/jsm/Addons.js';
// import { GammaCorrectionShader } from 'three/examples/jsm/Addons.js';
// import TWEEN from '@tweenjs/tween.js';

// // --- CONSTANTS -----------------------------------------------------------------
// // Animation timings
// const DURATION_CAMERA_TWEEN = 2000; // ms
// const DURATION_LABEL_APPEAR = 1000; // ms
// const DURATION_LABEL_DISAPPEAR = 500;  // ms

// // Camera positions
// const INITIAL_CAMERA_POS = new THREE.Vector3(37, 32, 293);
// const INITIAL_TARGET_POS = new THREE.Vector3(21, 27, -1);
// const ZOOMED_CAMERA_POS = new THREE.Vector3(30, 26, 156);

// // --- GLOBAL VARIABLES ----------------------------------------------------------
// let scene, camera, renderer, css2Renderer, css3Renderer, composer, orbitControls, outlinePass;
// let phoneModel, tag2D, tag3D;

// // --- STATE MANAGEMENT ----------------------------------------------------------
// let selectedObject = null;
// let hasFlown = false;
// let cameraTween = null;
// let labelTween2D = null;
// let labelTween3D = null;

// // --- INITIALIZATION ------------------------------------------------------------
// init();
// animate();

// function init() {
//     // --- Scene Setup ---
//     scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x808080);
//     scene.environment = envMap;

//     // --- Camera Setup ---
//     camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000);
//     camera.position.copy(INITIAL_CAMERA_POS);

//     // --- Renderer Setup ---
//     renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.shadowMap.enabled = true;
//     renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//     document.body.appendChild(renderer.domElement);

//     // --- CSS Renderers Setup ---
//     css2Renderer = new CSS2DRenderer();
//     css2Renderer.setSize(window.innerWidth, window.innerHeight);
//     css2Renderer.domElement.style.position = 'absolute';
//     css2Renderer.domElement.style.top = '0px';
//     css2Renderer.domElement.style.pointerEvents = 'none'; // Allow clicks to pass through to the main canvas
//     document.body.appendChild(css2Renderer.domElement);

//     css3Renderer = new CSS3DRenderer();
//     css3Renderer.setSize(window.innerWidth, window.innerHeight);
//     css3Renderer.domElement.style.position = 'absolute';
//     css3Renderer.domElement.style.top = '0px';
//     css3Renderer.domElement.style.pointerEvents = 'none';
//     document.body.appendChild(css3Renderer.domElement);

//     // --- Controls ---
//     orbitControls = new OrbitControls(camera, renderer.domElement);
//     orbitControls.enableDamping = true;
//     orbitControls.dampingFactor = 0.1;
//     orbitControls.target.copy(INITIAL_TARGET_POS);
//     orbitControls.enablePan = false;
//     orbitControls.enableZoom = false; // Disabled as per original code
//     orbitControls.update();

//     // --- Lighting ---
//     scene.add(new THREE.AmbientLight(0xffffff, 0.4));
//     const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//     directionalLight.position.set(50, 100, 80);
//     directionalLight.castShadow = true;
//     directionalLight.shadow.mapSize.set(2048, 2048);
//     directionalLight.shadow.radius = 4;
//     scene.add(directionalLight);

//     // --- Ground Plane ---
//     const shadowPlaneGeo = new THREE.PlaneGeometry(500, 500);
//     const shadowMat = new THREE.ShadowMaterial({ opacity: 0.3, side: THREE.DoubleSide });
//     const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowMat);
//     shadowPlane.rotation.x = -Math.PI / 2;
//     shadowPlane.position.y = 10;
//     shadowPlane.receiveShadow = true;
//     scene.add(shadowPlane);

//     // --- Model Setup ---
//     phoneModel = phone;
//     phoneModel.traverse((child) => {
//         if (child.isMesh) {
//             child.material.envMap = envMap;
//             child.material.envMapIntensity = 1;
//             child.material.needsUpdate = true;
//             child.castShadow = true;
//         }
//     });
//     scene.add(phoneModel);

//     // --- Label Setup ---
//     tag2D = new CSS2DObject(document.getElementById('tag'));
//     tag2D.element.style.opacity = '0';
//     tag2D.element.style.transform = 'scale(0)';
//     scene.add(tag2D);

//     tag3D = new CSS3DObject(document.getElementById('tDTag'));
//     tag3D.scale.set(0, 0, 0);
//     scene.add(tag3D);

//     // --- Post-processing ---
//     composer = new EffectComposer(renderer);
//     composer.addPass(new RenderPass(scene, camera));

//     outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
//     outlinePass.edgeThickness = 4.0;
//     outlinePass.edgeStrength = 6;
//     outlinePass.pulsePeriod = 2;
//     composer.addPass(outlinePass);

//     composer.addPass(new ShaderPass(GammaCorrectionShader));

//     const pixelRatio = renderer.getPixelRatio();
//     const smaaPass = new SMAAPass(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
//     composer.addPass(smaaPass);

//     // --- Event Listeners ---
//     setupEventListeners();
// }

// function setupEventListeners() {
//     window.addEventListener('resize', onWindowResize);
//     renderer.domElement.addEventListener('click', onModelClick);
//     document.getElementById('close').addEventListener('click', onCloseClick);
// }

// // --- EVENT HANDLERS ------------------------------------------------------------

// function onWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     css2Renderer.setSize(window.innerWidth, window.innerHeight);
//     css3Renderer.setSize(window.innerWidth, window.innerHeight);
//     composer.setSize(window.innerWidth, window.innerHeight);
// }

// function onModelClick(event) {
//     if (hasFlown) return;

//     const mouse = new THREE.Vector2(
//         (event.offsetX / window.innerWidth) * 2 - 1,
//         -(event.offsetY / window.innerHeight) * 2 + 1
//     );

//     const raycaster = new THREE.Raycaster();
//     raycaster.setFromCamera(mouse, camera);

//     const intersects = raycaster.intersectObjects(phoneModel.children, true);

//     if (intersects.length > 0) {
//         selectedObject = phoneModel;
//         outlinePass.selectedObjects = [selectedObject];

//         const targetPosition = new THREE.Vector3();
//         selectedObject.getWorldPosition(targetPosition);

//         // Start animations
//         createCameraTween(ZOOMED_CAMERA_POS, targetPosition, () => {
//             hasFlown = true;
//         });
//         createLabel2DTween(1.0, 1.0); // Target scale, target opacity
//         createLabel3DTween(new THREE.Vector3(0.5, 0.5, 0.5));
//     }
// }

// function onCloseClick() {
//     if (!selectedObject) return;

//     // Stop all running animations immediately to prevent conflicts
//     if (cameraTween) cameraTween.stop();
//     if (labelTween2D) labelTween2D.stop();
//     if (labelTween3D) labelTween3D.stop();

//     // Reset state
//     hasFlown = false;
//     outlinePass.selectedObjects = [];

//     // Start hide animations
//     createLabel2DTween(0, 0, DURATION_LABEL_DISAPPEAR);
//     createLabel3DTween(new THREE.Vector3(0, 0, 0), DURATION_LABEL_DISAPPEAR);

//     // After animations, clear selection
//     // We can tie this to one of the tweens' onComplete
//     const onDisappearComplete = () => {
//         selectedObject = null;
//         cameraTween = null;
//         labelTween2D = null;
//         labelTween3D = null;
//     };

//     // We just need one onComplete callback to clean up state
//     labelTween2D.onComplete(onDisappearComplete);
// }

// // --- TWEEN FUNCTIONS -----------------------------------------------------------

// function createCameraTween(endPos, endTarget, onCompleteCallback = () => { }) {
//     if (cameraTween) cameraTween.stop();

//     cameraTween = new TWEEN.Tween({
//         camX: camera.position.x, camY: camera.position.y, camZ: camera.position.z,
//         tgtX: orbitControls.target.x, tgtY: orbitControls.target.y, tgtZ: orbitControls.target.z
//     })
//         .to({
//             camX: endPos.x, camY: endPos.y, camZ: endPos.z,
//             tgtX: endTarget.x, tgtY: endTarget.y, tgtZ: endTarget.z
//         }, DURATION_CAMERA_TWEEN)
//         .easing(TWEEN.Easing.Quadratic.InOut)
//         .onUpdate((obj) => {
//             camera.position.set(obj.camX, obj.camY, obj.camZ);
//             orbitControls.target.set(obj.tgtX, obj.tgtY, obj.tgtZ);
//         })
//         .onComplete(onCompleteCallback)
//         .start();
// }

// function createLabel2DTween(targetScale, targetOpacity, duration = DURATION_LABEL_APPEAR) {
//     if (labelTween2D) labelTween2D.stop();

//     // Get current state directly from the element
//     const currentTransform = window.getComputedStyle(tag2D.element).transform;
//     const currentScaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
//     const currentScale = currentScaleMatch ? parseFloat(currentScaleMatch[1]) : 0;

//     const startState = {
//         scale: currentScale,
//         opacity: parseFloat(tag2D.element.style.opacity)
//     };

//     labelTween2D = new TWEEN.Tween(startState)
//         .to({ scale: targetScale, opacity: targetOpacity }, duration)
//         .easing(TWEEN.Easing.Quadratic.InOut)
//         .onUpdate((obj) => {
//             tag2D.element.style.opacity = obj.opacity;
//             tag2D.element.style.transform = `scale(${obj.scale})`;
//         })
//         .start();
// }

// function createLabel3DTween(targetScale, duration = DURATION_LABEL_APPEAR) {
//     if (labelTween3D) labelTween3D.stop();

//     labelTween3D = new TWEEN.Tween(tag3D.scale.clone())
//         .to({ x: targetScale.x, y: targetScale.y, z: targetScale.z }, duration)
//         .easing(TWEEN.Easing.Quadratic.InOut)
//         .onUpdate((obj) => {
//             tag3D.scale.set(obj.x, obj.y, obj.z);
//         })
//         .start();
// }

// // --- ANIMATION LOOP ------------------------------------------------------------

// function animate() {
//     requestAnimationFrame(animate);

//     TWEEN.update();
//     orbitControls.update();

//     // Update label positions to follow the model
//     const tag2DPos = new THREE.Vector3(-1, -1, 0);
//     phoneModel.localToWorld(tag2DPos);
//     tag2D.position.copy(tag2DPos);

//     const tag3DPos = new THREE.Vector3(0, 4, -1);
//     phoneModel.localToWorld(tag3DPos);
//     tag3D.position.copy(tag3DPos);

//     composer.render();
//     css2Renderer.render(scene, camera);
//     css3Renderer.render(scene, camera);
// }

import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { phone, envMap } from './model.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { ShaderPass } from 'three/examples/jsm/Addons.js';
import { GammaCorrectionShader } from 'three/examples/jsm/Addons.js';
import TWEEN from '@tweenjs/tween.js';

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(37, 32, 293);
camera.lookAt(21, 27, -1);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x808080);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true; // ✅ 启用阴影
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// 设置 CSS2 渲染器
const css2Renderer = new CSS2DRenderer();
css2Renderer.setSize(window.innerWidth, window.innerHeight);
css2Renderer.domElement.style.position = 'absolute';
css2Renderer.domElement.style.top = '0px';
css2Renderer.domElement.style.left = '0px';
css2Renderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(css2Renderer.domElement);

// 设置 CSS3 渲染器
const css3Renderer = new CSS3DRenderer();
css3Renderer.setSize(window.innerWidth, window.innerHeight);
css3Renderer.domElement.style.position = 'absolute';
css3Renderer.domElement.style.top = '0px';
css3Renderer.domElement.style.left = '0px';
css3Renderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(css3Renderer.domElement);

// 创建标签，并设置好它们的初始状态
const tag = new CSS2DObject(document.getElementById('tag'));
const tdTag = new CSS3DObject(document.getElementById('tDTag'));
// ✅ 新增：在程序开始时就设置好标签并添加到场景
// 让它们初始状态为完全不可见
tag.element.style.opacity = '0';
tag.element.style.transform = 'scale(0.1)';
tdTag.scale.set(0, 0, 0); // 3D标签从scale为0开始
scene.add(tag);
scene.add(tdTag);

// 自动更新canvas画布
window.onresize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    css2Renderer.setSize(window.innerWidth, window.innerHeight);
    css3Renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};

// 后处理
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const v2 = new THREE.Vector2(window.innerWidth, window.innerHeight);
const outlinePass = new OutlinePass(v2, scene, camera);
composer.addPass(outlinePass);
outlinePass.edgeThickness = 4.0;
outlinePass.edgeStrength = 6;
outlinePass.pulsePeriod = 2;

const pixelRatio = renderer.getPixelRatio();
const smaaPass = new SMAAPass(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
composer.addPass(smaaPass);

const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
composer.addPass(gammaCorrectionPass);

// 事件监听
let chooseObj = null;
let hasFlown = false; // 标志位：是否已执行过相机飞行动画
let cameraTween = null; // ✅ 新增：用于跟踪当前的相机动画实例
let labelTween2D = null; // ✅ 新增：跟踪 2D 标签动画
let labelTween3D = null; // ✅ 新增：跟踪 3D 标签动画
renderer.domElement.addEventListener('click', (event) => {
    if (hasFlown || cameraTween) return;

    const mouse = new THREE.Vector2(
        (event.offsetX / window.innerWidth) * 2 - 1,
        -(event.offsetY / window.innerHeight) * 2 + 1
    );

    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(mouse, camera);

    // 收集所有可检测的 Mesh 对象
    const meshList = [];
    phone.traverse((child) => {
        if (child.isMesh) {
            meshList.push(child);
            child.parentGroup = phone; // 可绑定为最近的组对象，这里简化为 phone
        }
    });

    const intersects = rayCaster.intersectObjects(meshList, true);
    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const selected = clickedMesh.parentGroup;

        // 相机移飞行靠近物体
        const pos = new THREE.Vector3()
        intersects[0].object.parentGroup.getWorldPosition(pos)
        const pos2 = pos.clone().addScalar(40);
        createCameraTween(new THREE.Vector3(30, 26, 156), pos, () => {
            hasFlown = true; // ✅ 动画结束后设置禁止再次触发
        })

        // 设置高亮轮廓线
        outlinePass.selectedObjects = [selected];

        // ✅ 关键修改：移除 if 判断，直接调用动画！
        // 因为标签永远在场景中，我们只需要让它们播放“出现”动画即可。
        creatLabelTween({ scale: 1.0, opacity: 1.0 });
        creatTdLabelTween(new THREE.Vector3(0.5, 0.5, 0.5));

        // 存储选中对象
        chooseObj = [selected];
    } else {
        // 如果没有点击任何对象
        if (chooseObj) {
            // outlinePass.selectedObjects = [];
            // scene.remove(tag, tdTag);
            // chooseObj = null;
        }
    }
});

document.getElementById('close').addEventListener('click', function () {
    // ✅ 关键修复：立即停止正在运行的相机动画！
    if (cameraTween) {
        cameraTween.stop();
        cameraTween = null; // 清空引用
    }

    // ✅ 关键修复：在启动消失动画前，先停止任何正在运行的标签动画
    if (labelTween2D) {
        labelTween2D.stop();
        labelTween2D = null
    }
    if (labelTween3D) {
        labelTween3D.stop();
        labelTween3D = null
    }

    // 确保有选中的对象可以关闭
    if (chooseObj) {
        // 1. 清除高亮轮廓线
        outlinePass.selectedObjects = [];

        // 2. 允许下一次点击触发飞行
        hasFlown = false;

        // --- 3. 为 CSS2DObject (tag) 创建消失动画 ---
        // 这个动画负责处理透明度和 CSS transform
        new TWEEN.Tween({ scale: 1.0, opacity: 1.0 })
            .to({ scale: 0.1, opacity: 0.0 }, 500) // 动画时长 500ms
            .onUpdate((obj) => {
                // 更新 DOM 元素的样式
                tag.element.style.transform = `scale(${obj.scale})`;
                tag.element.style.opacity = obj.opacity;
            })
            .onComplete(() => {
                // ✅ 关键修复：在这里清空选中对象的状态！
                chooseObj = null;
                // ✅ 关键修改：不再移除标签，只清空跟踪变量！
                labelTween2D = null;
                labelTween3D = null;
                console.log("Labels removed");
            })
            .start(); // 启动 2D 标签的动画

        // --- 4. 为 CSS3DObject (tdTag) 创建消失动画 ---
        // 这个动画负责处理 3D 对象的 scale 属性
        const currentTdScale = tdTag.scale.clone();
        new TWEEN.Tween(currentTdScale)
            .to({ x: 0.0, y: 0.0, z: 0.0 }, 500) // 动画时长同样为 500ms
            .onUpdate((obj) => {
                // 更新 3D 对象的缩放
                tdTag.scale.set(obj.x, obj.y, obj.z);
            })
            .start(); // 同时启动 3D 标签的动画
    }
});

// 轨道控制器
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;   // ✅ 启用阻尼（惯性）
orbitControls.dampingFactor = 0.1;   // ✅ 阻尼系数，建议在 0.01 ~ 0.1 之间
orbitControls.rotateSpeed = 0.5;
orbitControls.zoomSpeed = 1.2;
orbitControls.enablePan = false;
orbitControls.enableZoom = false
orbitControls.target.set(21, 27, -1);
orbitControls.update();

// 灯光设置
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 100, 80);
directionalLight.castShadow = true; // ✅ 支持阴影
directionalLight.shadow.mapSize.set(2048, 2048);
directionalLight.shadow.radius = 4;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

// 添加透明接收阴影的地面
const shadowPlaneGeo = new THREE.PlaneGeometry(500, 500);
const shadowMat = new THREE.ShadowMaterial({
    opacity: 0.3,
    side: THREE.DoubleSide
}); // ✅ 透明软阴影
const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowMat);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = 10; // 可调节略低于手机底部
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

// 添加模型
scene.add(phone);
phone.traverse((child) => {
    if (child.isMesh) {
        child.material.envMap = envMap;
        child.material.envMapIntensity = 1;
        child.material.roughness = 0.01;
        child.material.metalness = 0.7;
        child.material.clearcoat = 1;
        child.material.clearcoatRoughness = 0.2;
        child.material.needsUpdate = true;
        child.castShadow = true;   // ✅ 模型投射阴影
        child.receiveShadow = false;
    }
});
scene.environment = envMap;

// 相机运动函数
function createCameraTween(endPos, endTarget, onComplete = () => { }) {
    // ✅ 如果已有动画正在运行，先停止它
    if (cameraTween) {
        cameraTween.stop();
    }

    cameraTween = new TWEEN.Tween({
        // 不管相机此刻处于什么状态，直接读取当前的位置和目标观察点
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        tx: orbitControls.target.x,
        ty: orbitControls.target.y,
        tz: orbitControls.target.z,
    })
        .to({
            // 动画结束相机位置坐标
            x: endPos.x,
            y: endPos.y,
            z: endPos.z,
            // 动画结束相机指向的目标观察点
            tx: endTarget.x,
            ty: endTarget.y,
            tz: endTarget.z,
        }, 2000)
        .onUpdate(function (obj) {
            // 动态改变相机位置
            camera.position.set(obj.x, obj.y, obj.z);
            // 动态计算相机视线
            // camera.lookAt(obj.tx, obj.ty, obj.tz);
            orbitControls.target.set(obj.tx, obj.ty, obj.tz);
            orbitControls.update();//内部会执行.lookAt()
            console.log('update Camera')
        })
        .onComplete(() => {
            onComplete(); // ✅ 动画完成时回调
            cameraTween = null; // ✅ 动画正常完成后，清空跟踪变量
        })
        .start();
}

// CSS2DObject标签变化函数 (重写版本)
function creatLabelTween(endState) {
    // ✅ 关键修复：如果已有动画在运行，先停止它
    if (labelTween2D) {
        labelTween2D.stop();
    }

    const startState = { scale: 0.1, opacity: 0.0 };

    // ✅ 将新动画赋值给跟踪变量
    labelTween2D = new TWEEN.Tween(startState)
        .to(endState, 1000)
        .onUpdate((obj) => {
            tag.element.style.transform = `scale(${obj.scale})`;
            tag.element.style.opacity = obj.opacity;
        })
        .onComplete(() => {
            labelTween2D = null; // ✅ 动画正常完成后，清空跟踪
        })
        .start();
}

// CSS3DObject 标签变化函数
function creatTdLabelTween(endScale) {
    // ✅ 关键修复：如果已有动画在运行，先停止它
    if (labelTween3D) {
        labelTween3D.stop();
    }

    const startScale = { x: 0.1, y: 0.1, z: 0.1 };
    tdTag.scale.set(startScale.x, startScale.y, startScale.z);

    // ✅ 将新动画赋值给跟踪变量
    labelTween3D = new TWEEN.Tween(startScale)
        .to({
            x: endScale.x,
            y: endScale.y,
            z: endScale.z
        }, 1000)
        .onUpdate((obj) => {
            tdTag.scale.set(obj.x, obj.y, obj.z);
        })
        .onComplete(() => {
            labelTween3D = null; // ✅ 动画正常完成后，清空跟踪
        })
        .start();
}

// 动画渲染
function animate() {
    TWEEN.update()
    orbitControls.update();
    requestAnimationFrame(animate);
    composer.render();
    css2Renderer.render(scene, camera);
    css3Renderer.render(scene, camera);

    // 标签位置跟随
    const tagPos = new THREE.Vector3(-1, -1, 0);
    phone.localToWorld(tagPos);
    tag.position.copy(tagPos);

    const tdTagPos = new THREE.Vector3(0, 4, -1);
    phone.localToWorld(tdTagPos);
    tdTag.position.copy(tdTagPos);
}

animate();

