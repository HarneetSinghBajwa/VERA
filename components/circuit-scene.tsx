"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

type PathData = { curve: THREE.CatmullRomCurve3; color: string; offset: number; speed: number };
function Field() {
  const reduced = useReducedMotion();
  const world = useRef<THREE.Group>(null);
  const data = useMemo<PathData[]>(() => {
    const colors = ["#5be8ff", "#1689ff", "#ff9b66", "#b078ff"];
    return colors.map((color, index) => {
      const y = (index - 1.5) * 0.46;
      const points = [new THREE.Vector3(-10, y - .5, -.2), new THREE.Vector3(-6.8, y - .28, .1), new THREE.Vector3(-4.4, y + .48, .25), new THREE.Vector3(-1.1, y + .94, -.2), new THREE.Vector3(2.3, y + .42, -.48), new THREE.Vector3(5.6, y - .68, .1), new THREE.Vector3(10, y - .88, -.25)];
      return { curve: new THREE.CatmullRomCurve3(points), color, offset: index * .19, speed: .055 + index * .009 };
    });
  }, []);
  useFrame((state, delta) => {
    if (!world.current || reduced) return;
    const pointer = state.pointer;
    world.current.rotation.y = THREE.MathUtils.damp(world.current.rotation.y, pointer.x * .055, 2.5, delta);
    world.current.rotation.x = THREE.MathUtils.damp(world.current.rotation.x, -pointer.y * .035, 2.5, delta);
    world.current.position.x = THREE.MathUtils.damp(world.current.position.x, pointer.x * .12, 2, delta);
    world.current.position.y = Math.sin(state.clock.elapsedTime * .18) * .04 + pointer.y * .07;
  });
  const stars = useMemo(() => {
    const points = new Float32Array(240 * 3);
    for (let i = 0; i < 240; i++) { points[i * 3] = (Math.random() - .5) * 23; points[i * 3 + 1] = (Math.random() - .5) * 12; points[i * 3 + 2] = -2 - Math.random() * 8; }
    return points;
  }, []);
  return <group ref={world}>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]}/></bufferGeometry><pointsMaterial color="#8bdcff" size={.022} transparent opacity={.56} sizeAttenuation depthWrite={false}/></points>
    <group position={[0, 0, -1.4]}>{Array.from({length: 48}, (_, i) => { const x = (i % 12 - 5.5) * 1.42; const y = (Math.floor(i / 12) - 1.5) * 1.17; const depth = Math.sin(i * 2.11) * .12; return <mesh key={i} position={[x, y, depth]}><planeGeometry args={[1.38, 1.12]}/><meshBasicMaterial color={i % 11 === 0 ? "#4bb8e3" : "#758ca1"} wireframe transparent opacity={i % 11 === 0 ? .1 : .04} depthWrite={false}/></mesh>; })}</group>
    {data.map((path, index) => <group key={path.color}>
      <mesh><tubeGeometry args={[path.curve, 110, .13, 8, false]}/><meshBasicMaterial color={path.color} transparent opacity={.075} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}/></mesh>
      <mesh><tubeGeometry args={[path.curve, 110, .036, 8, false]}/><meshBasicMaterial color={path.color} transparent opacity={.68} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}/></mesh>
      <mesh><tubeGeometry args={[path.curve, 110, .012, 6, false]}/><meshBasicMaterial color="#e3fbff" transparent opacity={.66} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}/></mesh>
      <Signal path={path} reduced={Boolean(reduced)}/>
      {[.12,.31,.51,.72,.9].map((t, j) => <LogicNode key={`${index}-${j}`} point={path.curve.getPoint(t)} tint={path.color} active={(index + j) % 3 === 0}/>) }
    </group>)}
    <group position={[6.1, -2.15, -.4]} rotation={[0, -.12, 0]}>
      <mesh><boxGeometry args={[.77,.77,.12]}/><meshStandardMaterial color="#10212b" emissive="#17628a" emissiveIntensity={.75} metalness={.7} roughness={.2} transparent opacity={.83}/></mesh>
      <mesh position={[0,0,.071]}><circleGeometry args={[.2,48]}/><meshBasicMaterial color="#b5f4ff" transparent opacity={.86} toneMapped={false}/></mesh>
      <mesh position={[0,0,.083]}><circleGeometry args={[.27,48]}/><meshBasicMaterial color="#4ad7ff" wireframe transparent opacity={.45} toneMapped={false}/></mesh>
    </group>
  </group>;
}
function LogicNode({point,tint,active}:{point:THREE.Vector3;tint:string;active:boolean}){return <group position={point}><mesh><sphereGeometry args={[active?.075:.041,16,16]}/><meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={active?2.8:1.4} metalness={.35} roughness={.2}/></mesh>{active&&<mesh><sphereGeometry args={[.14,14,14]}/><meshBasicMaterial color={tint} transparent opacity={.12} blending={THREE.AdditiveBlending} depthWrite={false}/></mesh>}</group>}
function Signal({path,reduced}:{path:PathData;reduced:boolean}){const ref=useRef<THREE.Mesh>(null);useFrame(({clock})=>{if(ref.current&&!reduced){const t=(clock.elapsedTime*path.speed+path.offset)%1;ref.current.position.copy(path.curve.getPointAt(t));}});return <mesh ref={ref}><sphereGeometry args={[.055,16,16]}/><meshBasicMaterial color="#edfdff" toneMapped={false}/></mesh>}
export default function CircuitScene(){return <div className="scene" aria-hidden="true"><Canvas camera={{position:[0,0,10],fov:44}} dpr={[1,1.5]} gl={{alpha:true,antialias:true,powerPreference:"low-power"}}><ambientLight intensity={.75}/><pointLight position={[1,2,4]} intensity={7} color="#5fceff"/><pointLight position={[-5,-2,3]} intensity={5} color="#ff9e67"/><Field/></Canvas><div className="scene-vignette"/><div className="scene-grain"/></div>}
