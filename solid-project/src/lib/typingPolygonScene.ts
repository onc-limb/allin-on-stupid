import * as THREE from 'three';

/**
 * タイピングゲーム用のThree.jsシーン
 * タイピングするたびに回転しながら面が増えていく立体多面体を表示
 */
export class TypingPolygonScene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private animationId: number | null = null;
    private clock: THREE.Clock;

    // 立体関連
    private polyhedron: THREE.Mesh | null = null;
    private wireframe: THREE.LineSegments | null = null;
    private faces = 4; // 初期は正四面体（4面）
    private typeCount = 0; // タイプカウンター（10回で1面増加）
    private targetRotationX = 0;
    private targetRotationY = 0;
    private currentRotationX = 0;
    private currentRotationY = 0;
    private targetScale = 1;
    private currentScale = 1;

    // パーティクル
    private particles: THREE.Points | null = null;
    private particleGeometry: THREE.BufferGeometry | null = null;
    private particleVelocities: Float32Array | null = null;

    // 色相
    private currentHue = 0;
    private targetHue = 0;

    // エフェクト用
    private burstParticles: THREE.Points[] = [];

    // ライト
    private ambientLight: THREE.AmbientLight;
    private directionalLight: THREE.DirectionalLight;

    constructor(canvas: HTMLCanvasElement) {
        // キャンバスサイズを取得（0の場合はデフォルト値を使用）
        const container = canvas.parentElement;
        const width = container?.clientWidth || canvas.clientWidth || 400;
        const height = container?.clientHeight || canvas.clientHeight || 250;

        // レンダラーの作成
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x0a0a1a, 1);

        // シーンの作成
        this.scene = new THREE.Scene();

        // カメラの作成（アスペクト比を正しく設定）
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);

        // ライトの追加
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(5, 5, 5);
        this.scene.add(this.directionalLight);

        // クロックの初期化
        this.clock = new THREE.Clock();

        // 初期立体の作成
        this.createPolyhedron(this.faces);
        this.createBackgroundParticles();

        // 初回レンダリング
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * 面数に応じた立体を作成
     * 4面: 正四面体, 6面: 立方体, 8面: 正八面体, 12面: 正十二面体, 20面: 正二十面体
     * それ以上は球に近づいていく
     */
    private createPolyhedron(faces: number) {
        // 古い立体を削除
        if (this.polyhedron) {
            this.scene.remove(this.polyhedron);
            this.polyhedron.geometry.dispose();
            (this.polyhedron.material as THREE.Material).dispose();
        }
        if (this.wireframe) {
            this.scene.remove(this.wireframe);
            this.wireframe.geometry.dispose();
            (this.wireframe.material as THREE.Material).dispose();
        }

        let geometry: THREE.BufferGeometry;
        const radius = 1.2;

        // 面数に応じてジオメトリを選択
        if (faces <= 4) {
            // 正四面体
            geometry = new THREE.TetrahedronGeometry(radius);
        } else if (faces <= 6) {
            // 立方体
            geometry = new THREE.BoxGeometry(radius * 1.2, radius * 1.2, radius * 1.2);
        } else if (faces <= 8) {
            // 正八面体
            geometry = new THREE.OctahedronGeometry(radius);
        } else if (faces <= 12) {
            // 正十二面体
            geometry = new THREE.DodecahedronGeometry(radius);
        } else if (faces <= 20) {
            // 正二十面体
            geometry = new THREE.IcosahedronGeometry(radius);
        } else {
            // それ以上は球に近づける（細分化レベルを上げる）
            const detail = Math.min(Math.floor((faces - 20) / 10), 3);
            geometry = new THREE.IcosahedronGeometry(radius, detail);
        }

        // メインの立体（塗りつぶし）
        const color = new THREE.Color().setHSL(this.currentHue, 0.7, 0.5);
        const material = new THREE.MeshPhongMaterial({
            color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            flatShading: true,
        });

        this.polyhedron = new THREE.Mesh(geometry, material);
        this.scene.add(this.polyhedron);

        // ワイヤーフレーム（エッジ）
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color().setHSL(this.currentHue, 0.9, 0.7),
            linewidth: 2,
        });

        this.wireframe = new THREE.LineSegments(edges, lineMaterial);
        this.scene.add(this.wireframe);
    }

    /**
     * 背景パーティクルを作成
     */
    private createBackgroundParticles() {
        const count = 200;
        this.particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        this.particleVelocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 10;
            positions[i3 + 1] = (Math.random() - 0.5) * 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 5 - 2;

            const hue = Math.random();
            const color = new THREE.Color().setHSL(hue, 0.6, 0.5);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            this.particleVelocities[i3] = (Math.random() - 0.5) * 0.01;
            this.particleVelocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
            this.particleVelocities[i3 + 2] = 0;
        }

        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
        });

        this.particles = new THREE.Points(this.particleGeometry, material);
        this.scene.add(this.particles);
    }

    /**
     * バーストエフェクトを作成（正解時）
     */
    private createBurstEffect() {
        const count = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const velocities: number[] = [];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = 0;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = 0;

            const hue = this.currentHue + (Math.random() - 0.5) * 0.2;
            const color = new THREE.Color().setHSL(hue, 0.9, 0.7);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            const angle = Math.random() * Math.PI * 2;
            const speed = 0.1 + Math.random() * 0.2;
            velocities.push(Math.cos(angle) * speed);
            velocities.push(Math.sin(angle) * speed);
            velocities.push((Math.random() - 0.5) * 0.1);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
        });

        const burst = new THREE.Points(geometry, material);
        (burst as any).velocities = velocities;
        (burst as any).life = 1;
        this.burstParticles.push(burst);
        this.scene.add(burst);
    }

    /**
     * タイピング時に呼び出す（10回で面を1つ増やして回転）
     */
    onKeyTyped() {
        // タイプカウントを増やす
        this.typeCount += 1;

        // 10回タイプで面を1つ増やす
        if (this.typeCount % 10 === 0) {
            this.faces += 1;
            this.createPolyhedron(this.faces);
        }

        // 回転を追加（X軸とY軸両方）
        this.targetRotationX += Math.PI / 8;
        this.targetRotationY += Math.PI / 6;

        // 一時的にスケールを大きくしてから戻す
        this.targetScale = 1.2;
        setTimeout(() => {
            this.targetScale = 1;
        }, 100);

        // 色相を少し変える
        this.targetHue = (this.targetHue + 0.05) % 1;
    }

    /**
     * 正解時に呼び出す（タイプカウントを問題文の文字数分減らす）
     */
    onCorrect(questionLength: number) {
        // タイプカウントを問題文の文字数分減らす
        this.typeCount = Math.max(0, this.typeCount - questionLength);

        // 面数を再計算（4 + タイプカウント/10の端数切り捨て）
        const newFaces = 4 + Math.floor(this.typeCount / 10);
        if (newFaces !== this.faces) {
            this.faces = newFaces;
            this.createPolyhedron(this.faces);
        }

        // バーストエフェクト
        this.createBurstEffect();

        // 大きく回転
        this.targetRotationX += Math.PI / 2;
        this.targetRotationY += Math.PI / 2;

        // 色相を大きく変える
        this.targetHue = (this.targetHue + 0.15) % 1;

        // スケールエフェクト
        this.targetScale = 1.5;
        setTimeout(() => {
            this.targetScale = 1;
        }, 200);
    }

    /**
     * ゲームリセット時
     */
    reset() {
        this.faces = 4;
        this.typeCount = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.currentRotationX = 0;
        this.currentRotationY = 0;
        this.targetScale = 1;
        this.currentScale = 1;
        this.currentHue = 0;
        this.targetHue = 0;
        this.createPolyhedron(this.faces);

        // バーストパーティクルをクリア
        this.burstParticles.forEach(burst => {
            this.scene.remove(burst);
            burst.geometry.dispose();
            (burst.material as THREE.Material).dispose();
        });
        this.burstParticles = [];
    }

    /**
     * アニメーションを開始
     */
    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            this.tick();
        };
        animate();
    }

    /**
     * アニメーションティック
     */
    private tick() {
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 回転の補間（X軸とY軸）
        this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.1;
        this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.1;

        // スケールの補間
        this.currentScale += (this.targetScale - this.currentScale) * 0.15;

        // 色相の補間
        this.currentHue += (this.targetHue - this.currentHue) * 0.1;

        // 立体の更新
        if (this.polyhedron) {
            // 常にゆっくり回転 + ターゲット回転
            this.polyhedron.rotation.x = this.currentRotationX + time * 0.3;
            this.polyhedron.rotation.y = this.currentRotationY + time * 0.5;
            this.polyhedron.scale.set(this.currentScale, this.currentScale, this.currentScale);

            // 色の更新
            const material = this.polyhedron.material as THREE.MeshPhongMaterial;
            material.color.setHSL(this.currentHue, 0.7, 0.5);

            // ゆらゆら動く
            this.polyhedron.position.x = Math.sin(time * 0.5) * 0.1;
            this.polyhedron.position.y = Math.cos(time * 0.7) * 0.1;
        }

        if (this.wireframe) {
            this.wireframe.rotation.x = this.currentRotationX + time * 0.3;
            this.wireframe.rotation.y = this.currentRotationY + time * 0.5;
            this.wireframe.scale.set(this.currentScale, this.currentScale, this.currentScale);
            this.wireframe.position.x = Math.sin(time * 0.5) * 0.1;
            this.wireframe.position.y = Math.cos(time * 0.7) * 0.1;

            const material = this.wireframe.material as THREE.LineBasicMaterial;
            material.color.setHSL(this.currentHue, 0.9, 0.7);
        }

        // 背景パーティクルの更新
        if (this.particleGeometry && this.particleVelocities) {
            const positions = this.particleGeometry.attributes.position.array as Float32Array;
            for (let i = 0; i < positions.length / 3; i++) {
                const i3 = i * 3;
                positions[i3] += this.particleVelocities[i3];
                positions[i3 + 1] += this.particleVelocities[i3 + 1];

                // 境界チェック
                if (positions[i3] < -5) positions[i3] = 5;
                if (positions[i3] > 5) positions[i3] = -5;
                if (positions[i3 + 1] < -5) positions[i3 + 1] = 5;
                if (positions[i3 + 1] > 5) positions[i3 + 1] = -5;
            }
            this.particleGeometry.attributes.position.needsUpdate = true;
        }

        // バーストパーティクルの更新
        this.burstParticles = this.burstParticles.filter(burst => {
            const velocities = (burst as any).velocities as number[];
            const positions = burst.geometry.attributes.position.array as Float32Array;

            for (let i = 0; i < positions.length / 3; i++) {
                const i3 = i * 3;
                positions[i3] += velocities[i3];
                positions[i3 + 1] += velocities[i3 + 1];
                positions[i3 + 2] += velocities[i3 + 2];

                // 速度を減衰
                velocities[i3] *= 0.96;
                velocities[i3 + 1] *= 0.96;
                velocities[i3 + 2] *= 0.96;
            }
            burst.geometry.attributes.position.needsUpdate = true;

            // ライフを減少
            (burst as any).life -= delta * 2;
            (burst.material as THREE.PointsMaterial).opacity = (burst as any).life;

            // ライフが0以下なら削除
            if ((burst as any).life <= 0) {
                this.scene.remove(burst);
                burst.geometry.dispose();
                (burst.material as THREE.Material).dispose();
                return false;
            }
            return true;
        });

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * 現在の面の数を取得
     */
    getSides(): number {
        return this.faces;
    }

    /**
     * ミスタイプ数を取得（タイプカウント = 余分なタイプ数）
     */
    getMistypeCount(): number {
        return this.typeCount;
    }

    /**
     * リソースのクリーンアップ
     */
    dispose() {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.polyhedron) {
            this.polyhedron.geometry.dispose();
            (this.polyhedron.material as THREE.Material).dispose();
        }

        if (this.wireframe) {
            this.wireframe.geometry.dispose();
            (this.wireframe.material as THREE.Material).dispose();
        }

        if (this.particleGeometry) {
            this.particleGeometry.dispose();
        }

        if (this.particles) {
            (this.particles.material as THREE.Material).dispose();
        }

        this.burstParticles.forEach(burst => {
            burst.geometry.dispose();
            (burst.material as THREE.Material).dispose();
        });

        this.renderer.dispose();
    }

    /**
     * ウィンドウリサイズ時の処理
     */
    handleResize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
