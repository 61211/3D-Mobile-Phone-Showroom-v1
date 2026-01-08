// 相机动画函数，从A点飞行到B点，A点表示相机当前所处状态
// pos: 三维向量Vector3，表示动画结束相机位置
// target: 三维向量Vector3，表示相机动画结束lookAt指向的目标观察点
function createCameraTween(endPos, endTarget) {
    new TWEEN.Tween({
        // 不管相机此刻处于什么状态，直接读取当前的位置和目标观察点
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        tx: controls.target.x,
        ty: controls.target.y,
        tz: controls.target.z,
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
            controls.target.set(obj.tx, obj.ty, obj.tz);
            controls.update();//内部会执行.lookAt()
        })
        .start();
}