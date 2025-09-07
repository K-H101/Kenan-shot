import * as THREE from './node_modules/three/build/three.module.js';

// 粒子效果管理器
class EffectsManager {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.explosions = [];
    }

    // 创建枪口火焰效果
    createMuzzleFlash(position, direction) {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // 位置
            positions[i3] = position.x + (Math.random() - 0.5) * 2;
            positions[i3 + 1] = position.y + (Math.random() - 0.5) * 2;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;
            
            // 颜色（橙红色火焰）
            colors[i3] = 1.0; // R
            colors[i3 + 1] = 0.5 + Math.random() * 0.5; // G
            colors[i3 + 2] = 0.0; // B
            
            // 大小
            sizes[i] = Math.random() * 0.5 + 0.1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);

        // 动画效果
        const startTime = Date.now();
        const duration = 200;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                this.scene.remove(particles);
                return;
            }

            // 粒子扩散
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3] += direction.x * 0.5;
                positions[i3 + 1] += direction.y * 0.5;
                positions[i3 + 2] += direction.z * 0.5;
            }
            particles.geometry.attributes.position.needsUpdate = true;

            // 透明度衰减
            material.opacity = 0.8 * (1 - progress);

            requestAnimationFrame(animate);
        };

        animate();
    }

    // 创建击中效果
    createHitEffect(position, color = 0xff0000) {
        const particleCount = 30;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = position.x;
            positions[i3 + 1] = position.y;
            positions[i3 + 2] = position.z;
            
            // 随机速度
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 5,
                (Math.random() - 0.5) * 10
            ));
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.2,
            transparent: true,
            opacity: 1.0
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);

        // 动画
        const startTime = Date.now();
        const duration = 1000;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                this.scene.remove(particles);
                return;
            }

            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const velocity = velocities[i];
                
                positions[i3] += velocity.x * 0.016;
                positions[i3 + 1] += velocity.y * 0.016;
                positions[i3 + 2] += velocity.z * 0.016;
                
                // 重力
                velocity.y -= 9.8 * 0.016;
            }
            particles.geometry.attributes.position.needsUpdate = true;

            // 透明度衰减
            material.opacity = 1.0 * (1 - progress);

            requestAnimationFrame(animate);
        };

        animate();
    }

    // 创建爆炸效果
    createExplosion(position) {
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = position.x;
            positions[i3 + 1] = position.y;
            positions[i3 + 2] = position.z;
            
            // 爆炸颜色（橙红渐变）
            const intensity = Math.random();
            colors[i3] = 1.0;
            colors[i3 + 1] = intensity * 0.5;
            colors[i3 + 2] = 0.0;
            
            // 径向速度
            const direction = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize();
            
            velocities.push(direction.multiplyScalar(Math.random() * 15 + 5));
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);

        // 动画
        const startTime = Date.now();
        const duration = 1500;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                this.scene.remove(particles);
                return;
            }

            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const velocity = velocities[i];
                
                positions[i3] += velocity.x * 0.016;
                positions[i3 + 1] += velocity.y * 0.016;
                positions[i3 + 2] += velocity.z * 0.016;
                
                // 重力和阻力
                velocity.y -= 9.8 * 0.016;
                velocity.multiplyScalar(0.98);
            }
            particles.geometry.attributes.position.needsUpdate = true;

            // 透明度衰减
            material.opacity = 1.0 * (1 - progress);

            requestAnimationFrame(animate);
        };

        animate();
    }

    // 创建烟雾效果
    createSmoke(position) {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = position.x + (Math.random() - 0.5) * 2;
            positions[i3 + 1] = position.y;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 2;
            
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 2
            ));
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x666666,
            size: 1.0,
            transparent: true,
            opacity: 0.5
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);

        // 动画
        const startTime = Date.now();
        const duration = 3000;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                this.scene.remove(particles);
                return;
            }

            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const velocity = velocities[i];
                
                positions[i3] += velocity.x * 0.016;
                positions[i3 + 1] += velocity.y * 0.016;
                positions[i3 + 2] += velocity.z * 0.016;
                
                // 烟雾上升和扩散
                velocity.y *= 0.99;
                velocity.x *= 1.01;
                velocity.z *= 1.01;
            }
            particles.geometry.attributes.position.needsUpdate = true;

            // 透明度和大小变化
            material.opacity = 0.5 * (1 - progress);
            material.size = 1.0 + progress * 2;

            requestAnimationFrame(animate);
        };

        animate();
    }

    // 创建拾取效果
    createPickupEffect(position) {
        const geometry = new THREE.RingGeometry(0.5, 1.5, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        const ring = new THREE.Mesh(geometry, material);
        ring.position.copy(position);
        ring.rotation.x = -Math.PI / 2;
        this.scene.add(ring);

        // 动画
        const startTime = Date.now();
        const duration = 500;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                this.scene.remove(ring);
                return;
            }

            // 旋转和缩放
            ring.rotation.z += 0.1;
            ring.scale.setScalar(1 + progress * 2);
            material.opacity = 0.8 * (1 - progress);

            requestAnimationFrame(animate);
        };

        animate();
    }

    // 清理所有效果
    cleanup() {
        this.particles.forEach(particle => {
            this.scene.remove(particle);
        });
        this.particles = [];
        
        this.explosions.forEach(explosion => {
            this.scene.remove(explosion);
        });
        this.explosions = [];
    }
}

export default EffectsManager;