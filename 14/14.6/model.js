import loadGLTFModel from './gltfLoader'
import loadHDRTexture from './hdrLoader'

const phone = await loadGLTFModel('./11/11.5/public/model/iphoneX.gltf')
const envMap = await loadHDRTexture('./14/14.6/public/hdr/brown_photostudio_02_4k.hdr')

export { phone, envMap }
