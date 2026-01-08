import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const gltfLoader = new GLTFLoader()

// 配置 DRACO 解码器路径
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/') // 或你的本地路径
gltfLoader.setDRACOLoader(dracoLoader)

const loadGLTFModel = (path) => {
    return new Promise((resolve, reject) => {
        gltfLoader.load(path, (gltf) => {
            console.log('模型', gltf.scene)
            gltf.scene.scale.set(10, 10, 10)
            gltf.scene.position.set(20, 20, 0)
            resolve(gltf.scene)  // 返回加载的场景
        }, undefined, (error) => {
            reject(error)  // 错误处理
        })
    })
}

export default loadGLTFModel