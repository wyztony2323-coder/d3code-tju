import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
// three@0.133.0 中 Water 在 examples/jsm/objects/Water.js
import { Water } from 'three/examples/jsm/objects/Water.js';

// 扩展 Three.js 的标准 Water 对象给 React 使用
extend({ Water });

// 声明 Water 类型
declare global {
  namespace JSX {
    interface IntrinsicElements {
      water: any;
    }
  }
}

// 1. 动态生成水波法线贴图 (解决国内无法加载 GitHub 图片导致水面变黑的问题)
function createWaterNormals() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 简单的噪声绘制，生成紫色调的法线图
    ctx.fillStyle = '#8080ff'; // 默认法线颜色 (0.5, 0.5, 1.0)
    ctx.fillRect(0, 0, 512, 512);
    // 随机画一些噪点模拟波浪
    for (let i = 0; i < 20000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#7070ff' : '#9090ff';
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const s = Math.random() * 4 + 1;
      ctx.fillRect(x, y, s, s);
    }
  }
  return new THREE.CanvasTexture(canvas);
}

function Ocean() {
  const ref = useRef<any>();
  const { clock } = useThree(); // v7 需要显式获取 clock
  
  // 使用本地生成的纹理替代 GitHub 图片
  const waterNormals = useMemo(() => {
    const tex = createWaterNormals();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // 增大水面尺寸，确保覆盖整个场景
  const geom = useMemo(() => new THREE.PlaneGeometry(30000, 30000), []);
  
  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormals, // 使用本地生成的贴图
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f, // 深青色水面，更有历史厚重感
      distortionScale: 3.7,
      fog: true, // 必须开启 fog 融合
    }),
    [waterNormals]
  );

  useFrame(() => {
    // v7 兼容写法：使用 clock.getElapsedTime() 获取时间
    if (ref.current && ref.current.material && ref.current.material.uniforms) {
      // 减慢流速让它看起来更像大河
      ref.current.material.uniforms.time.value = clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <water
      ref={ref}
      args={[geom, config]}
      rotation-x={-Math.PI / 2}
      // y = -30 让它在道路(0)下方
      position={[0, -30, 0]} 
    />
  );
}

interface EnvProps {
  scrollZ: number; // 从父组件传入当前的滚动距离（Z轴位置）
}

const HistoryEnvironment: React.FC<EnvProps> = ({ scrollZ }) => {
  // 摄像机控制组件
  const CameraController = () => {
    const { camera } = useThree();
    useFrame(() => {
      // z 轴跟随滚动
      const targetZ = scrollZ * 0.8; // 调整倍率以匹配 CSS 滚动速度
      
      // 平滑插值移动 (Lerp) 显得更有电影感
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);
      
      // 关键：固定 y 高度 (120) 和 x 位置 (0)，防止跑偏
      camera.position.y = 120;
      camera.position.x = 0;

      // 永远看向正前方地平线 (targetZ + 远处)
      // 保持目光平视，才能看到水面延伸到地平线
      camera.lookAt(0, 0, targetZ + 3000);
    });
    return null;
  };

  return (
    <div style={{ 
      position: 'fixed', // 必须 fixed
      top: 0, 
      left: 0, 
      right: 0,
      bottom: 0,
      width: '100vw', 
      height: '100vh', 
      zIndex: -1,        // 放在最底层
      background: '#020210' // 默认黑色背景防穿帮
    }}>
      <Canvas 
        camera={{ position: [0, 100, 0], fov: 60, far: 20000 }} 
        dpr={[1, 2]}
        // 解决色调过暗问题
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
        }}
      >
        {/* 灯光增强 */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[100, 100, -100]} intensity={1.5} />
        
        {/* 1. 水面组件 */}
        <Ocean />
        
        {/* 2. 将星星半径设大，包裹整个世界 */}
        <Stars radius={5000} depth={200} count={6000} factor={8} saturation={0} fade />
        
        {/* 3. 调整 Sky 让它在极远处 */}
        <Sky 
          sunPosition={[500, 10, 0]} 
          distance={400000} 
          turbidity={0.5} 
          rayleigh={0.1} 
          inclination={0.1} 
          azimuth={0.25} 
        />
        
        {/* 4. 雾效：融合道路尽头与水天一线 */}
        <fog attach="fog" args={['#aaccff', 1000, 8000]} />
        
        <CameraController />
      </Canvas>
    </div>
  );
};

export default HistoryEnvironment;
