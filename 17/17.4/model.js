import loadGLTFModel from '../../14/14.6/gltfLoader'
import loadHDRTexture from '../../14/14.6/hdrLoader'

const phone = await loadGLTFModel('./11/11.5/public/model/iphoneX.gltf')
const envMap = await loadHDRTexture('./14/14.6/public/hdr/brown_photostudio_02_4k.hdr')

export { phone, envMap }
