// 调试函数 - 检查游戏状态
function debugGameState() {
    console.log('=== 游戏状态调试 ===');
    console.log('isPlaying:', gameState.isPlaying);
    console.log('isPointerLocked:', isPointerLocked);
    console.log('isScopeActive:', gameState.isScopeActive);
    console.log('health:', gameState.health);
    console.log('ammo:', currentWeaponState.ammo);
    console.log('camera.fov:', camera.fov);
    console.log('==================');
}

// 添加到全局，方便在控制台调用
window.debugGameState = debugGameState;

// 键盘事件调试
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyF1') {
        debugGameState();
    }
});

console.log('调试模式已启用，按F1查看游戏状态');