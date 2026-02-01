import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function Particles({ count = 2000 }) {
    const mesh = useRef();
    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 4 + Math.random() * 4; // Between radius 4 and 8
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        return positions;
    }, [count]);

    useFrame((state, delta) => {
        mesh.current.rotation.y += delta * 0.05;
        mesh.current.rotation.x += delta * 0.02;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlesPosition.length / 3}
                    array={particlesPosition}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color="#00f3ff"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

function ConnectionLines() {
    const mesh = useRef();
    useFrame((state) => {
        mesh.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    });
    return (
        <mesh ref={mesh}>
            <icosahedronGeometry args={[3, 1]} />
            <meshBasicMaterial wireframe color="#bc13fe" transparent opacity={0.1} />
        </mesh>
    )
}

const Background3D = () => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none', background: 'var(--bg-color)' }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <Particles count={3000} />
                <ConnectionLines />
            </Canvas>
        </div>
    );
};

export default Background3D;
