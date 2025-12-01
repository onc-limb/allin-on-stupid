import * as THREE from 'three';

// ========================================
// 1/f揺らぎ（ピンクノイズ）生成器
// ========================================
class PinkNoise {
  private b0 = 0;
  private b1 = 0;
  private b2 = 0;
  private b3 = 0;
  private b4 = 0;
  private b5 = 0;
  private b6 = 0;

  next(): number {
    const white = Math.random() * 2 - 1;
    this.b0 = 0.99886 * this.b0 + white * 0.0555179;
    this.b1 = 0.99332 * this.b1 + white * 0.0750759;
    this.b2 = 0.969 * this.b2 + white * 0.153852;
    this.b3 = 0.8665 * this.b3 + white * 0.3104856;
    this.b4 = 0.55 * this.b4 + white * 0.5329522;
    this.b5 = -0.7616 * this.b5 - white * 0.016898;
    const pink =
      this.b0 +
      this.b1 +
      this.b2 +
      this.b3 +
      this.b4 +
      this.b5 +
      this.b6 +
      white * 0.5362;
    this.b6 = white * 0.115926;
    return pink * 0.11;
  }
}

// 1/f揺らぎの値を時間経過で滑らかに補間するクラス
class SmoothPinkNoise {
  private pinkNoise: PinkNoise;
  private current = 0;
  private target = 0;
  private smoothness: number;

  constructor(smoothness = 0.02) {
    this.pinkNoise = new PinkNoise();
    this.smoothness = smoothness;
  }

  update(): number {
    this.target += this.pinkNoise.next() * 0.1;
    this.target *= 0.99; // ゆっくり中心に戻す
    this.current += (this.target - this.current) * this.smoothness;
    return this.current;
  }
}

/**
 * Three.jsのシーン、カメラ、レンダラーを管理するクラス
 * 1/f揺らぎベースの幾何学模様フローアニメーション
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

  // リングとライン
  private rings: THREE.Mesh[] = [];
  private lines: THREE.LineSegments | null = null;
  private lineGeometry: THREE.BufferGeometry | null = null;
  private linePhases: Float32Array | null = null;

  // 1/f揺らぎインスタンス
  private pinkNoiseX: SmoothPinkNoise;
  private pinkNoiseY: SmoothPinkNoise;
  private pinkNoiseZ: SmoothPinkNoise;
  private pinkNoiseRotation: SmoothPinkNoise;
  private pinkNoiseScale: SmoothPinkNoise;
  private pinkNoiseIntensity: SmoothPinkNoise;
  private pinkNoiseHue: SmoothPinkNoise;
  private ringPinkNoises: Array<{
    x: SmoothPinkNoise;
    y: SmoothPinkNoise;
    rotation: SmoothPinkNoise;
    scale: SmoothPinkNoise;
  }> = [];

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
  private readonly lineCount = 500;

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

    // 1/f揺らぎインスタンスの初期化
    this.pinkNoiseX = new SmoothPinkNoise(0.015);
    this.pinkNoiseY = new SmoothPinkNoise(0.012);
    this.pinkNoiseZ = new SmoothPinkNoise(0.018);
    this.pinkNoiseRotation = new SmoothPinkNoise(0.008);
    this.pinkNoiseScale = new SmoothPinkNoise(0.01);
    this.pinkNoiseIntensity = new SmoothPinkNoise(0.006);
    this.pinkNoiseHue = new SmoothPinkNoise(0.004);

    // リング用の個別1/f揺らぎ
    for (let i = 0; i < 30; i++) {
      this.ringPinkNoises.push({
        x: new SmoothPinkNoise(0.01 + Math.random() * 0.01),
        y: new SmoothPinkNoise(0.01 + Math.random() * 0.01),
        rotation: new SmoothPinkNoise(0.005 + Math.random() * 0.005),
        scale: new SmoothPinkNoise(0.008),
      });
    }

    // オブジェクトの初期化
    this.initParticles();
    this.initRings();
    this.initLines();
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
      const radius = 20 + Math.sqrt(i / this.particleCount) * 380 + spiralIndex * 15;
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

    this.particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.particles.setAttribute('randomOffset', new THREE.BufferAttribute(randomOffsets, 4));

    // シェーダーマテリアル
    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        scrollProgress: { value: 0 },
        scrollVelocity: { value: 0 },
        pinkNoiseX: { value: 0 },
        pinkNoiseY: { value: 0 },
        pinkNoiseZ: { value: 0 },
        pinkNoiseIntensity: { value: 0 },
        pinkNoiseHue: { value: 0 },
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
        uniform float pinkNoiseX;
        uniform float pinkNoiseY;
        uniform float pinkNoiseZ;
        uniform float pinkNoiseIntensity;
        uniform float pinkNoiseHue;
        
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
          
          float globalPinkX = pinkNoiseX * 80.0 * (1.0 + pinkNoiseIntensity);
          float globalPinkY = pinkNoiseY * 60.0 * (1.0 + pinkNoiseIntensity);
          float globalPinkZ = pinkNoiseZ * 70.0 * (1.0 + pinkNoiseIntensity);
          
          float wave1 = sin(pos.y * 0.025 + t * 1.8 + randomOffset.x) * 10.0 * breathe;
          float wave2 = sin(pos.y * 0.012 + t * 0.9 + randomOffset.y) * 18.0;
          float wave3 = sin(pos.y * 0.006 + t * 0.4 + randomOffset.z) * 30.0;
          float wave4 = sin(pos.y * 0.003 + t * 0.2) * 45.0;
          float wave5 = sin(pos.y * 0.0015 + t * 0.08) * 60.0;
          
          float velocityResponse = sin(pos.y * 0.015 + t * 2.5) * abs(scrollVelocity) * 60.0;
          
          pos.x += wave1 + wave2 * 0.7 + wave3 * 0.5 + wave4 * 0.3 + wave5 * 0.2;
          pos.x += globalPinkX + fbmVal * 40.0 + velocityResponse * cos(randomOffset.x);
          
          pos.z += cos(pos.y * 0.02 + t * 1.5 + randomOffset.y) * 12.0 * breathe;
          pos.z += sin(pos.y * 0.008 + t * 0.6) * 22.0;
          pos.z += globalPinkZ + fbmVal * 35.0 + velocityResponse * sin(randomOffset.y);
          
          pos.y += sin(pos.x * 0.01 + t * 0.8) * 8.0 + globalPinkY * 0.3;
          
          float rotAngle = t * 0.12 + scrollProgress * 1.8 + pinkNoiseX * 0.5;
          float cosA = cos(rotAngle);
          float sinA = sin(rotAngle);
          vec3 rotatedPos;
          rotatedPos.x = pos.x * cosA - pos.z * sinA;
          rotatedPos.y = pos.y;
          rotatedPos.z = pos.x * sinA + pos.z * cosA;
          
          vec4 mvPosition = modelViewMatrix * vec4(rotatedPos, 1.0);
          
          float sizeFluctuation = 1.0 + pinkNoiseIntensity * 0.3 + sin(t * 0.5 + phase) * 0.1;
          gl_PointSize = size * sizeFluctuation * (380.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          vAlpha = smoothstep(2200.0, 100.0, -mvPosition.z) * (0.85 + breathe * 0.15);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        uniform float pinkNoiseIntensity;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          float glowPower = 1.3 + pinkNoiseIntensity * 0.4;
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

    this.particleSystem = new THREE.Points(this.particles, this.particleMaterial);
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
        pinkNoiseIndex: i % this.ringPinkNoises.length,
      };

      this.rings.push(ring);
      this.scene.add(ring);
    }
  }

  /**
   * 接続線の初期化
   */
  private initLines() {
    this.lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(this.lineCount * 6);
    const lineColors = new Float32Array(this.lineCount * 6);
    this.linePhases = new Float32Array(this.lineCount);

    for (let i = 0; i < this.lineCount; i++) {
      const angle1 = (i / this.lineCount) * Math.PI * 10;
      const angle2 = angle1 + 0.12;
      const radius1 = 70 + Math.sin(i * 0.06) * 70;
      const radius2 = radius1 + 30;
      const z = (i / this.lineCount - 0.5) * 2000;

      linePositions[i * 6] = Math.cos(angle1) * radius1;
      linePositions[i * 6 + 1] = Math.sin(angle1) * radius1;
      linePositions[i * 6 + 2] = z;

      linePositions[i * 6 + 3] = Math.cos(angle2) * radius2;
      linePositions[i * 6 + 4] = Math.sin(angle2) * radius2;
      linePositions[i * 6 + 5] = z + 40;

      const hue = (i / this.lineCount + 0.3) % 1;
      const color = new THREE.Color().setHSL(hue, 0.75, 0.45);
      lineColors[i * 6] = color.r;
      lineColors[i * 6 + 1] = color.g;
      lineColors[i * 6 + 2] = color.b;
      lineColors[i * 6 + 3] = color.r;
      lineColors[i * 6 + 4] = color.g;
      lineColors[i * 6 + 5] = color.b;

      this.linePhases[i] = Math.random() * 1000;
    }

    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    this.lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    this.lines = new THREE.LineSegments(this.lineGeometry, lineMaterial);
    this.scene.add(this.lines);
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
    const realTime = this.clock.getElapsedTime();

    // 1/f揺らぎの更新（アイドル時の微細な動き用）
    const pinkX = this.pinkNoiseX.update();
    const pinkY = this.pinkNoiseY.update();
    const pinkZ = this.pinkNoiseZ.update();
    const pinkRot = this.pinkNoiseRotation.update();
    const pinkScale = this.pinkNoiseScale.update();
    const pinkIntensity = this.pinkNoiseIntensity.update();

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
    
    // アクティブ度（スクロール速度に応じた動きの強さ、稏やかに）
    const activity = Math.min(0.6, Math.abs(this.scrollVelocity) * 0.3);
    
    // アイドル時の微細な揺らぎ時間（非常にゆっくり進む）
    const idleTime = realTime * 0.05;
    
    // 実際に使用する時間（スクロール時はanimationTime、アイドル時はidleTime）
    const t = this.animationTime + idleTime;

    // シェーダーのuniformを更新
    if (this.particleMaterial) {
      this.particleMaterial.uniforms.time.value = t;
      this.particleMaterial.uniforms.scrollProgress.value = this.scrollY;
      this.particleMaterial.uniforms.scrollVelocity.value = this.scrollVelocity;
      this.particleMaterial.uniforms.pinkNoiseX.value = pinkX * (0.3 + activity * 0.7);
      this.particleMaterial.uniforms.pinkNoiseY.value = pinkY * (0.3 + activity * 0.7);
      this.particleMaterial.uniforms.pinkNoiseZ.value = pinkZ * (0.3 + activity * 0.7);
      this.particleMaterial.uniforms.pinkNoiseIntensity.value = Math.abs(pinkIntensity) * (0.2 + activity * 0.8);
    }

    // リングのアニメーション
    const ringLoopRange = this.ringCount * 110;
    this.rings.forEach((ring, index) => {
      const userData = ring.userData;
      const pn = this.ringPinkNoises[userData.pinkNoiseIndex];

      const ringPinkX = pn.x.update();
      const ringPinkY = pn.y.update();
      const ringPinkRot = pn.rotation.update();
      const ringPinkScale = pn.scale.update();

      // 無限スクロール
      let z = userData.initialZ + this.scrollY * 700;
      z = (((z % ringLoopRange) + ringLoopRange) % ringLoopRange) - ringLoopRange * 0.5;
      ring.position.z = z;

      // 位置変動（アイドル時は微細な揺らぎのみ、全体的に抑制）
      const baseWaveTime = t * 0.8 + userData.wavePhase;
      const idleWaveX = Math.sin(idleTime * 0.3 + index * 0.25) * 2; // アイドル時の微細な揺らぎ
      const idleWaveY = Math.cos(idleTime * 0.2 + index * 0.4) * 1.5;
      const activeWaveX = Math.sin(baseWaveTime + index * 0.25) * 6;
      const activeWaveY = Math.cos(baseWaveTime * 0.6 + index * 0.4) * 5;
      
      ring.position.x = idleWaveX + activeWaveX * activity + ringPinkX * (5 + activity * 10);
      ring.position.y = idleWaveY + activeWaveY * activity + ringPinkY * (4 + activity * 8);

      // 回転（アイドル時は非常にゆっくり、全体的に抑制）
      const rotationSpeed = userData.baseRotationSpeed * (0.05 + activity * 0.3);
      ring.rotation.z += rotationSpeed + ringPinkRot * 0.005 * (0.3 + activity * 0.7);
      ring.rotation.x = Math.sin(t * 0.6 + userData.phaseOffset) * (0.02 + activity * 0.1) + pinkX * 0.02;
      ring.rotation.y = Math.cos(t * 0.4 + userData.phaseOffset) * (0.02 + activity * 0.08) + pinkY * 0.02;

      // スケール（アイドル時は微細な変動のみ）
      const idlePulse = 1 + Math.sin(idleTime * 0.5 + index * 0.3) * 0.02;
      const activePulse = 1 + Math.sin(t * 1.5 + index * 0.3) * 0.06;
      const basePulse = idlePulse + (activePulse - 1) * activity;
      const pinkPulse = 1 + ringPinkScale * (0.05 + activity * 0.1) + Math.abs(pinkIntensity) * 0.05;
      ring.scale.set(basePulse * pinkPulse, basePulse * pinkPulse, 1);

      // 透明度
      const distFactor = 1 - Math.abs(z) / (ringLoopRange * 0.5);
      const opacityFluctuation = 0.35 + Math.abs(pinkIntensity) * 0.05;
      (ring.material as THREE.MeshBasicMaterial).opacity = opacityFluctuation * Math.max(0, distFactor);
    });

    // 接続線のアニメーション
    if (this.lineGeometry && this.linePhases && this.lines) {
      const linePos = this.lineGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < this.lineCount; i++) {
        const baseAngle1 = (i / this.lineCount) * Math.PI * 10;
        const baseAngle2 = baseAngle1 + 0.12;
        const baseRadius1 = 70 + Math.sin(i * 0.06) * 70;
        const baseRadius2 = baseRadius1 + 30;
        const baseZ = (i / this.lineCount - 0.5) * 2000;
        const phase = this.linePhases[i];

        // アイドル時の微細な揺らぎ
        const idleWave = Math.sin(idleTime * 0.5 + i * 0.02 + phase * 0.005) * 2;
        
        // アクティブ時の波（振幅を抑制）
        const wave1 = Math.sin(t * 2.2 + i * 0.04 + phase * 0.01) * 5 * activity;
        const wave2 = Math.sin(t * 1.1 + i * 0.02) * 8 * activity;
        const wave3 = Math.sin(t * 0.4 + i * 0.01) * 10 * activity;

        const pinkWave = pinkX * (2 + activity * 5) * Math.sin(i * 0.03 + phase * 0.005);

        const angleOffset = Math.sin(t * 0.8 + i * 0.015) * 0.03 * activity;
        const angle1 = baseAngle1 + angleOffset;
        const angle2 = baseAngle2 + angleOffset;

        const totalWave = idleWave + wave1 + wave2 * 0.6 + wave3 * 0.3 + pinkWave;

        linePos[i * 6] = Math.cos(angle1) * (baseRadius1 + totalWave);
        linePos[i * 6 + 1] = Math.sin(angle1) * (baseRadius1 + totalWave) + wave2 * 0.3 + pinkY * (2 + activity * 4);
        linePos[i * 6 + 2] = baseZ;

        linePos[i * 6 + 3] = Math.cos(angle2) * (baseRadius2 + totalWave);
        linePos[i * 6 + 4] = Math.sin(angle2) * (baseRadius2 + totalWave) + wave2 * 0.3 + pinkY * (2 + activity * 4);
        linePos[i * 6 + 5] = baseZ + 40;
      }
      this.lineGeometry.attributes.position.needsUpdate = true;

      // 線全体の動き（アイドル時は微細な揺らぎのみ、全体的に抑制）
      const idleRotZ = Math.sin(idleTime * 0.2) * 0.005;
      this.lines.rotation.z = idleRotZ + t * 0.02 * activity + pinkRot * (0.05 + activity * 0.1);
      this.lines.rotation.x = Math.sin(this.scrollY * 0.4) * 0.1 * activity + pinkX * 0.02;
      this.lines.position.z = Math.sin(this.scrollY * 0.25) * 30 * activity + pinkZ * (5 + activity * 15);
    }

    // カメラの動き（アイドル時は微細な揺らぎのみ、全体的に抑制）
    const idleCamX = Math.sin(idleTime * 0.15) * 3;
    const idleCamY = Math.cos(idleTime * 0.12) * 2;
    const activeCamX = Math.sin(t * 0.3) * 8;
    const activeCamY = Math.cos(t * 0.25) * 6;
    
    this.camera.position.x = idleCamX + activeCamX * activity + pinkX * (15 + activity * 45);
    this.camera.position.y = idleCamY + activeCamY * activity + pinkY * (12 + activity * 38);
    this.camera.position.z = 500 + pinkZ * (25 + activity * 80);
    this.camera.rotation.z = Math.sin(idleTime * 0.1) * 0.003 + Math.sin(t * 0.15) * 0.015 * activity + pinkRot * (0.008 + activity * 0.022);

    // FOVの微妙な変動（アイドル時は微細な揺らぎのみ、ズームを速く）
    const idleFov = Math.sin(idleTime * 0.1) * 0.3;
    const activeFov = Math.sin(t * 0.4) * 1.5;
    this.camera.fov = 60 + idleFov + activeFov * activity + pinkScale * (2 + activity * 8);
    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * スクロール距離に応じてシーンを更新
   * @param scrollMeters スクロール距離（メートル）
   */
  updateByScroll(scrollMeters: number) {
    // スクロール値を更新（メートルから内部スケールに変換）
    const delta = scrollMeters * 0.05;
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

    // ラインの破棄
    if (this.lineGeometry) {
      this.lineGeometry.dispose();
    }
    if (this.lines) {
      (this.lines.material as THREE.Material).dispose();
    }

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
