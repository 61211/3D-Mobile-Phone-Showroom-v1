import { RGBELoader } from 'three/addons/Addons.js'
import * as THREE from 'three'

const hdrLoader = new RGBELoader()

const loadHDRTexture = (path) => {
    return new Promise((resolve, reject) => {
        hdrLoader.load(path, (hdr) => {
            hdr.mapping = THREE.EquirectangularReflectionMapping
            console.log('环境贴图', hdr)
            resolve(hdr)  // 返回 HDR 贴图
        }, undefined, (error) => {
            reject(error)  // 错误处理
        })
    })
}

export default loadHDRTexture