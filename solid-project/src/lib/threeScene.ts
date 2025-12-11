import * as THREE from "three";

/**
 * Three.jsのシーン、カメラ、レンダラーを管理するクラス
 * 機械的な幾何学模様フローアニメーション
 */
export class ThreeScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationId: number | null = null;
  private clock: THREE.Clock;

  // パーティクルシステム
  private particleSystem: THREE.Points | null = null;
  private particleMaterial: THREE.ShaderMaterial | null = null;
  private particles: THREE.BufferGeometry | null = null;

  // リング
  private rings: THREE.Mesh[] = [];

  // スクロール関連
  private scrollY = 0;
  private targetScrollY = 0;
  private scrollVelocity = 0;

  // アニメーション時間（スクロールで進む）
  private animationTime = 0;
  private lastScrollY = 0;

  // 定数
  private readonly particleCount = 3500;
  private readonly ringCount = 28;

  constructor(canvas: HTMLCanvasElement) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // レンダラーの作成
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 1);

    // シーンの作成
    this.scene = new THREE.Scene();

    // カメラの作成
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 3000);
    this.camera.position.set(0, 0, 500);

    // クロックの初期化
    this.clock = new THREE.Clock();

    // オブジェクトの初期化
    this.initParticles();
    this.initRings();
  }

  /**
   * パーティクルシステムの初期化
   */
  private initParticles() {
    this.particles = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    const randomOffsets = new Float32Array(this.particleCount * 4);

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const i4 = i * 4;

      // 黄金角を使用した配置
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const spiralIndex = i % 7;
      const angle = i * goldenAngle + spiralIndex * Math.PI * 0.3;
      const radius =
        20 + Math.sqrt(i / this.particleCount) * 380 + spiralIndex * 15;
      const heightPos = ((i / this.particleCount) * 2 - 1) * 1800;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = heightPos;
      positions[i3 + 2] = Math.sin(angle) * radius;

      // 色をグラデーションで設定
      const hue = ((i / this.particleCount) * 1.2 + spiralIndex * 0.08) % 1;
      const saturation = 0.7 + Math.sin(i * 0.01) * 0.2;
      const lightness = 0.5 + Math.cos(i * 0.02) * 0.15;
      const color = new THREE.Color();
      color.setHSL(hue, saturation, lightness);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 5 + 1.5;

      randomOffsets[i4] = Math.random() * 6.28;
      randomOffsets[i4 + 1] = Math.random() * 6.28;
      randomOffsets[i4 + 2] = Math.random() * 6.28;
      randomOffsets[i4 + 3] = Math.random() * 1000;
    }

    this.particles.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    this.particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.particles.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    this.particles.setAttribute(
      "randomOffset",
      new THREE.BufferAttribute(randomOffsets, 4)
    );

    // シェーダーマテリアル
    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        scrollProgress: { value: 0 },
        scrollVelocity: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        attribute vec4 randomOffset;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float time;
        uniform float scrollProgress;
        uniform float scrollVelocity;
        
        float hash(float n) { return fract(sin(n) * 43758.5453123); }
        
        float noise(vec3 x) {
          vec3 p = floor(x);
          vec3 f = fract(x);
          f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
          float n = p.x + p.y * 57.0 + 113.0 * p.z;
          return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                         mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                     mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                         mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
        }
        
        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          for (int i = 0; i < 5; i++) {
            value += amplitude * noise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          return value;
        }
        
        void main() {
          vec3 adjustedColor = color;
          vColor = adjustedColor;
          
          vec3 pos = position;
          
          float loopRange = 3600.0;
          pos.y = mod(pos.y + scrollProgress * 900.0 + loopRange * 0.5, loopRange) - loopRange * 0.5;
          
          float t = time;
          float phase = randomOffset.w;
          
          float breathe = sin(t * 0.15 + phase * 0.001) * 0.5 + 0.5;
          breathe = breathe * breathe;
          
          float fbmVal = fbm(vec3(pos.x * 0.003 + t * 0.1, pos.y * 0.003, pos.z * 0.003 + phase * 0.01));
          
          float wave1 = sin(pos.y * 0.025 + t * 1.8 + randomOffset.x) * 10.0 * breathe;
          float wave2 = sin(pos.y * 0.012 + t * 0.9 + randomOffset.y) * 18.0;
          float wave3 = sin(pos.y * 0.006 + t * 0.4 + randomOffset.z) * 30.0;
          float wave4 = sin(pos.y * 0.003 + t * 0.2) * 45.0;
          float wave5 = sin(pos.y * 0.0015 + t * 0.08) * 60.0;
          
          float velocityResponse = sin(pos.y * 0.015 + t * 2.5) * abs(scrollVelocity) * 60.0;
          
          pos.x += wave1 + wave2 * 0.7 + wave3 * 0.5 + wave4 * 0.3 + wave5 * 0.2;
          pos.x += fbmVal * 40.0 + velocityResponse * cos(randomOffset.x);
          
          pos.z += cos(pos.y * 0.02 + t * 1.5 + randomOffset.y) * 12.0 * breathe;
          pos.z += sin(pos.y * 0.008 + t * 0.6) * 22.0;
          pos.z += fbmVal * 35.0 + velocityResponse * sin(randomOffset.y);
          
          pos.y += sin(pos.x * 0.01 + t * 0.8) * 8.0;
          
          float rotAngle = t * 0.12 + scrollProgress * 1.8;
          float cosA = cos(rotAngle);
          float sinA = sin(rotAngle);
          vec3 rotatedPos;
          rotatedPos.x = pos.x * cosA - pos.z * sinA;
          rotatedPos.y = pos.y;
          rotatedPos.z = pos.x * sinA + pos.z * cosA;
          
          vec4 mvPosition = modelViewMatrix * vec4(rotatedPos, 1.0);
          
          float sizeFluctuation = 1.0 + sin(t * 0.5 + phase) * 0.1;
          gl_PointSize = size * sizeFluctuation * (380.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          vAlpha = smoothstep(2200.0, 100.0, -mvPosition.z) * (0.85 + breathe * 0.15);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          float glowPower = 1.3;
          float glow = 1.0 - smoothstep(0.0, 0.5, dist);
          glow = pow(glow, glowPower);
          
          vec3 brightColor = vColor + vec3(0.2) * (1.0 - dist * 2.0);
          
          gl_FragColor = vec4(brightColor, glow * vAlpha * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particleSystem = new THREE.Points(
      this.particles,
      this.particleMaterial
    );
    this.scene.add(this.particleSystem);
  }

  /**
   * リングの初期化
   */
  private initRings() {
    for (let i = 0; i < this.ringCount; i++) {
      const radius = 50 + Math.pow(i / this.ringCount, 0.8) * 400;
      const segments = 5 + Math.floor(i * 0.6);

      const geometry = new THREE.RingGeometry(radius - 3, radius, segments);
      const hue = (i / this.ringCount) * 0.5 + 0.4;
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hue, 0.85, 0.55),
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        wireframe: true,
      });

      const ring = new THREE.Mesh(geometry, material);
      ring.position.z = -i * 110;
      ring.userData = {
        initialZ: -i * 110,
        baseRotationSpeed: (Math.random() - 0.5) * 0.02,
        phaseOffset: i * 0.618,
        wavePhase: Math.random() * Math.PI * 2,
      };

      this.rings.push(ring);
      this.scene.add(ring);
    }
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
    // スムーズなスクロール補間（より滑らかに）
    this.scrollY += (this.targetScrollY - this.scrollY) * 0.08;

    // スクロール量の変化からアニメーション時間を進める（上限を設ける）
    const scrollDelta = this.scrollY - this.lastScrollY;
    const clampedDelta = Math.max(-0.5, Math.min(0.5, scrollDelta)); // 変化量に上限
    this.animationTime += clampedDelta * 80; // スクロールに応じてアニメーション時間を進める
    this.lastScrollY = this.scrollY;

    // スクロール速度の減衰と上限
    this.scrollVelocity *= 0.95;
    this.scrollVelocity = Math.max(-2, Math.min(2, this.scrollVelocity)); // 速度に上限

    // アクティブ度（スクロール速度に応じた動きの強さ）
    const activity = Math.min(0.6, Math.abs(this.scrollVelocity) * 0.3);

    // 実際に使用する時間（スクロール駆動のみ）
    const t = this.animationTime;

    // シェーダーのuniformを更新（スクロール時のみ動く）
    if (this.particleMaterial) {
      this.particleMaterial.uniforms.time.value = t;
      this.particleMaterial.uniforms.scrollProgress.value = this.scrollY;
      this.particleMaterial.uniforms.scrollVelocity.value = this.scrollVelocity;
    }

    // リングのアニメーション
    const ringLoopRange = this.ringCount * 110;
    this.rings.forEach((ring, index) => {
      const userData = ring.userData;

      // 無限スクロール
      let z = userData.initialZ + this.scrollY * 700;
      z =
        (((z % ringLoopRange) + ringLoopRange) % ringLoopRange) -
        ringLoopRange * 0.5;
      ring.position.z = z;

      // 位置変動（スクロール時のみ）
      const baseWaveTime = t * 0.8 + userData.wavePhase;
      const waveX = Math.sin(baseWaveTime + index * 0.25) * 6 * activity;
      const waveY = Math.cos(baseWaveTime * 0.6 + index * 0.4) * 5 * activity;

      ring.position.x = waveX;
      ring.position.y = waveY;

      // 回転（スクロール時のみ）
      const rotationSpeed = userData.baseRotationSpeed * activity * 0.35;
      ring.rotation.z += rotationSpeed;
      ring.rotation.x =
        Math.sin(t * 0.6 + userData.phaseOffset) * activity * 0.12;
      ring.rotation.y =
        Math.cos(t * 0.4 + userData.phaseOffset) * activity * 0.1;

      // スケール（スクロール時のみ）
      const pulse = 1 + Math.sin(t * 1.5 + index * 0.3) * 0.06 * activity;
      ring.scale.set(pulse, pulse, 1);

      // 透明度
      const distFactor = 1 - Math.abs(z) / (ringLoopRange * 0.5);
      const opacityFluctuation = 0.35;
      (ring.material as THREE.MeshBasicMaterial).opacity =
        opacityFluctuation * Math.max(0, distFactor);
    });

    // カメラの動き（スクロール時のみ）
    const camX = Math.sin(t * 0.3) * 8 * activity;
    const camY = Math.cos(t * 0.25) * 6 * activity;

    this.camera.position.x = camX;
    this.camera.position.y = camY;
    this.camera.position.z = 500;
    this.camera.rotation.z =
      Math.sin(t * 0.15) * 0.015 * activity;

    // FOVの変動（スクロール時のみ）
    const fovChange = Math.sin(t * 0.4) * 1.5 * activity;
    this.camera.fov = 60 + fovChange;
    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * スクロール距離に応じてシーンを更新
   * @param scrollMeters スクロール距離（メートル）
   */
  updateByScroll(scrollMeters: number) {
    // スクロール値を更新（メートルから内部スケールに変換、距離を3倍に拡大）
    const delta = scrollMeters * 0.15;
    this.targetScrollY = delta;
    // 速度に上限を設けて暴れないように
    const rawVelocity = (delta - this.scrollY) * 8;
    this.scrollVelocity = Math.max(-2, Math.min(2, rawVelocity));
  }

  /**
   * リソースのクリーンアップ
   */
  dispose() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    // パーティクルシステムの破棄
    if (this.particles) {
      this.particles.dispose();
    }
    if (this.particleMaterial) {
      this.particleMaterial.dispose();
    }

    // リングの破棄
    this.rings.forEach((ring) => {
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
    });

    // レンダラーの破棄
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
