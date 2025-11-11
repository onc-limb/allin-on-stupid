import * as THREE from 'three';

/**
 * Three.jsのシーン、カメラ、レンダラーを管理するクラス
 */
export class ThreeScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationId: number | null = null;
  private mesh: THREE.Mesh | null = null;

  constructor(canvas: HTMLCanvasElement) {
    // シーンの作成
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // カメラの作成（canvasの実際のサイズを取得）
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, +1000);

    // レンダラーの作成
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // 初期オブジェクトの追加
    this.initObjects();
  }

  /**
   * シーンに3Dオブジェクトを追加
   */
  private initObjects() {
    // キューブの作成
    const geometry = new THREE.SphereGeometry(300, 30, 30);
    // const material = new THREE.MeshStandardMaterial({color: 0xFF0000});
    // 画像を読み込む
    const loader = new THREE.TextureLoader();
    const texture = loader.load('images/earthmap1k.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;
    // マテリアルにテクスチャーを設定
    const material = new THREE.MeshStandardMaterial({
    map: texture
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    // 平行光源
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
    directionalLight.position.set(1, 1, 1);
    // シーンに追加
    this.scene.add(directionalLight);

    // グリッドヘルパー（オプション）
    const gridHelper = new THREE.GridHelper(10, 10);
    gridHelper.position.y = -2;
    this.scene.add(gridHelper);
  }

  /**
   * アニメーションを開始
   */
  startAnimation() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);

      // キューブを回転
      if (this.mesh) {
        // this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.01;
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  /**
   * スクロール距離に応じてシーンを更新
   * @param scrollMeters スクロール距離（メートル）
   */
  updateByScroll(scrollMeters: number) {
    if (this.mesh) {
      // スクロールに応じてキューブのスケールを変更
      const scale = 1 + scrollMeters * 0.1;
      this.mesh.scale.set(scale, scale, scale);

      // スクロールに応じて色を変更
      const hue = (scrollMeters * 36) % 360;
      (this.mesh.material as THREE.MeshPhongMaterial).color.setHSL(
        hue / 360,
        0.7,
        0.6
      );
    }

    // カメラの位置を調整
    this.camera.position.y = scrollMeters * 0.5;
  }

  /**
   * リソースのクリーンアップ
   */
  dispose() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    // ジオメトリとマテリアルの破棄
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
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
