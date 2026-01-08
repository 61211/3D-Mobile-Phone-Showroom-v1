import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/Addons.js'
import { RGBELoader } from 'three/addons/Addons.js'

const gltfLoader = new GLTFLoader()
const hdrLoader = new RGBELoader()

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshLambertMaterial({
        color: 0xc2B280
    })
)
plane.receiveShadow = true
plane.rotateX(-Math.PI / 2)

// 加载 HDR 贴图
const loadHDRTexture = (path) => {
    return new Promise((resolve, reject) => {
        hdrLoader.load(path, (hdr) => {
            console.log('环境贴图', hdr)
            resolve(hdr)  // 返回 HDR 贴图
        }, undefined, (error) => {
            reject(error)  // 错误处理
        })
    })
}

// 加载纹理贴图
const textLoader = new THREE.TextureLoader()
const texture = textLoader.load('./11/11.5/public/texture/ground.png')
console.log('纹理贴图', texture)


// 加载 GLTF 模型
const loadGLTFModel = (path) => {
    return new Promise((resolve, reject) => {
        gltfLoader.load(path, (gltf) => {
            console.log('模型', gltf.scene)
            gltf.scene.scale.set(100, 100, 100)
            gltf.scene.position.set(0, 5, 0)
            resolve(gltf.scene)  // 返回加载的场景
        }, undefined, (error) => {
            reject(error)  // 错误处理
        })
    })
}

const hdr = await loadHDRTexture('./11/11.5/public/HDR/sunset_in_the_chalk_quarry_1k.hdr')
const model = await loadGLTFModel('./11/11.5/public/model/bull_head_1k.gltf')

// 石头不会反光，所以这里效果不明显
model.traverse((child) => {
    if (child.isMesh) {
        child.material.envMap = hdr  // 给每个网格的材质添加环境贴图
        child.material.envMapIntensity = 1.0
        child.material.needsUpdate = true  // 更新材质
        child.castShadow = true;
        child.receiveShadow = true;
        console.log('查看环境贴图是否成功', child.material.envMap)
    }
})

plane.material.map = texture

export { plane, model, hdr }