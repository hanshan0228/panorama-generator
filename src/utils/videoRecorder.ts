import * as THREE from 'three';

export interface VideoRecordOptions {
  durationSeconds: number; // e.g. 6 or 10
  fps: number; // 30 or 60
  width: number; // 1920 (16:9), 1080 (9:16), or 1080 (1:1)
  height: number;
  rotationRounds?: number; // usually 1 full 360 loop
  tiltDeg?: number; // e.g. 5 degrees slight dynamic tilt
  onProgress?: (percent: number) => void;
}

/**
 * Renders a 360 equirectangular texture into a smooth rotating video clip
 * directly client-side via Three.js and MediaRecorder API.
 */
export async function renderPanoramaToVideoBlob(
  textureUrl: string,
  options: VideoRecordOptions
): Promise<Blob> {
  const {
    durationSeconds = 8,
    fps = 30,
    width = 1920,
    height = 1080,
    rotationRounds = 1,
    tiltDeg = 0,
    onProgress,
  } = options;

  return new Promise((resolve, reject) => {
    // 1. Create off-screen canvas & Three.js WebGL renderer
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0);

    // 2. Load texture and create inverted sphere
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      textureUrl,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const geometry = new THREE.SphereGeometry(500, 64, 48);
        geometry.scale(-1, 1, 1); // invert inside

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const sphereMesh = new THREE.Mesh(geometry, material);
        scene.add(sphereMesh);

        // 3. Set up MediaRecorder
        let mimeType = 'video/webm;codecs=vp9';
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
          mimeType = 'video/mp4;codecs=avc1';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        } else if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }

        const stream = canvas.captureStream(fps);
        let mediaRecorder: MediaRecorder;
        try {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 8_000_000, // 8 Mbps high quality
          });
        } catch {
          // Fallback if specific bitrate or mime fails
          mediaRecorder = new MediaRecorder(stream);
        }

        const recordedChunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const videoBlob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'video/webm' });
          // Cleanup Three.js resources
          geometry.dispose();
          material.dispose();
          texture.dispose();
          renderer.dispose();
          resolve(videoBlob);
        };

        // 4. Start recording and step frames
        mediaRecorder.start();

        const totalFrames = Math.round(durationSeconds * fps);
        let currentFrame = 0;
        const frameIntervalMs = 1000 / fps;

        const renderInterval = setInterval(() => {
          if (currentFrame >= totalFrames) {
            clearInterval(renderInterval);
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
            if (onProgress) onProgress(100);
            return;
          }

          // Calculate current rotation angle (full 360 loop)
          const progressRatio = currentFrame / totalFrames;
          const theta = progressRatio * Math.PI * 2 * rotationRounds;
          const phi = THREE.MathUtils.degToRad(tiltDeg * Math.sin(progressRatio * Math.PI * 2));

          camera.rotation.set(phi, -theta, 0, 'YXZ');
          renderer.render(scene, camera);

          if (onProgress) {
            onProgress(Math.round(progressRatio * 100));
          }

          currentFrame++;
        }, frameIntervalMs);
      },
      undefined,
      (err) => {
        reject(err);
      }
    );
  });
}
