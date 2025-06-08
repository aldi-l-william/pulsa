import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [_, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      return alert('Username dan password wajib diisi');
    }
    try {
      setLoading(true);
      const res = await api.post('/login', { username:form.username, password:form.password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('auth', 'true');
      navigate('/');
    } catch (err:any) {
      alert('Login gagal: ' + err.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#fff');

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(1.5, 1.2, 4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const currentMount = mountRef.current;
    if (currentMount) currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 3, 2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffeecc, 1, 10);
    pointLight.position.set(-2, 2, 2);
    scene.add(pointLight);

    // Floor
    const planeGeo = new THREE.PlaneGeometry(20, 20);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.2 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    plane.receiveShadow = true;
    scene.add(plane);

    // Load Font and Create Text
    const loader = new FontLoader();
    loader.load('/fonts/Poppins_Regular.json', (font: any) => {
      const geometry = new TextGeometry('Amel Reload', {
        font: font,
        size: 0.15,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.015,
        bevelOffset: 0,
        bevelSegments: 5,
      });

      geometry.center();

      const material = new THREE.MeshStandardMaterial({
        color: 0xffaa33,
        metalness: 0.8,
        roughness: 0.2,
      });

      const textMesh = new THREE.Mesh(geometry, material);
      textMesh.castShadow = true;
      textMesh.scale.set(1, 1, 0.001); // tetap tipis tapi efek 3D muncul
      scene.add(textMesh);

      const animate = () => {
        requestAnimationFrame(animate);
        textMesh.rotation.y += 0.003;
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      camera.position.set(1.5, 1.2, 6);
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      renderer.dispose();
      window.removeEventListener('resize', handleResize);
      if (currentMount) currentMount.innerHTML = '';
    };
  }, []);

  return (
  <div className="relative w-screen h-screen">
    <div ref={mountRef} className="absolute -top-64 left-0 w-full h-full z-0" />
    
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <form onSubmit={handleSubmit} className="bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/40">
        <h2 className="mb-4 text-xl font-bold text-center">Login</h2>
        <input
          name="username"
          onChange={handleChange}
          placeholder="Username"
          className="block w-full px-4 py-2 border border-gray-300 rounded mb-4"
        />
        <input
          name="password"
          type="password"
          onChange={handleChange}
          placeholder="Password"
          className="block w-full px-4 py-2 border border-gray-300 rounded mb-4"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  </div>
);

}

export default Login;
