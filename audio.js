// 音效管理器
class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.initSounds();
    }

    initSounds() {
        // 创建音效（使用Web Audio API生成）
        this.createShootSound();
        this.createReloadSound();
        this.createHitSound();
        this.createPickupSound();
        this.createBackgroundMusic();
    }

    createShootSound() {
        this.sounds.shoot = {
            pistol: () => this.playTone(800, 0.1, 'square'),
            rifle: () => this.playTone(600, 0.15, 'sawtooth'),
            sniper: () => this.playTone(400, 0.3, 'triangle')
        };
    }

    createReloadSound() {
        this.sounds.reload = () => {
            // 模拟装弹声音
            setTimeout(() => this.playTone(300, 0.1, 'square'), 0);
            setTimeout(() => this.playTone(400, 0.1, 'square'), 200);
            setTimeout(() => this.playTone(500, 0.1, 'square'), 400);
        };
    }

    createHitSound() {
        this.sounds.hit = () => this.playTone(1000, 0.1, 'sine');
        this.sounds.enemyHit = () => this.playTone(200, 0.2, 'sawtooth');
    }

    createPickupSound() {
        this.sounds.pickup = () => {
            this.playTone(600, 0.1, 'sine');
            setTimeout(() => this.playTone(800, 0.1, 'sine'), 100);
        };
    }

    createBackgroundMusic() {
        // 简单的背景音乐循环
        this.sounds.bgMusic = () => {
            if (!this.enabled) return;
            
            const notes = [440, 523, 659, 784]; // A, C, E, G
            let noteIndex = 0;
            
            const playNote = () => {
                if (this.enabled) {
                    this.playTone(notes[noteIndex], 0.5, 'sine', 0.1);
                    noteIndex = (noteIndex + 1) % notes.length;
                    setTimeout(playNote, 2000);
                }
            };
            
            playNote();
        };
    }

    playTone(frequency, duration, type = 'sine', volume = null) {
        if (!this.enabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            const vol = volume !== null ? volume : this.volume;
            gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Audio not supported:', error);
        }
    }

    playShoot(weaponType) {
        if (this.sounds.shoot[weaponType]) {
            this.sounds.shoot[weaponType]();
        }
    }

    playReload() {
        this.sounds.reload();
    }

    playHit() {
        this.sounds.hit();
    }

    playEnemyHit() {
        this.sounds.enemyHit();
    }

    playPickup() {
        this.sounds.pickup();
    }

    startBackgroundMusic() {
        this.sounds.bgMusic();
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

export default AudioManager;