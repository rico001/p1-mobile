import { useRef, useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function parseGcode(gcode) {
  const positions = [];
  const lines = gcode.split('\n');

  let currentX = 0, currentY = 0, currentZ = 0;
  let currentE = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';')) continue;

    // Parse G1 (linear move) commands - only draw lines with extrusion
    if (trimmed.startsWith('G1 ')) {
      const parts = trimmed.split(' ');
      let newX = currentX, newY = currentY, newZ = currentZ;
      let newE = currentE;
      let hasE = false;

      for (const part of parts) {
        if (part.startsWith('X')) newX = parseFloat(part.substring(1));
        if (part.startsWith('Y')) newY = parseFloat(part.substring(1));
        if (part.startsWith('Z')) newZ = parseFloat(part.substring(1));
        if (part.startsWith('E')) {
          newE = parseFloat(part.substring(1));
          hasE = true;
        }
      }

      // Draw line if extruding (E value increases)
      if (hasE && newE > currentE) {
        positions.push(currentX, currentY, currentZ);
        positions.push(newX, newY, newZ);
      }

      currentX = newX;
      currentY = newY;
      currentZ = newZ;
      currentE = newE;
    }
    // G0 is travel move - just update position
    else if (trimmed.startsWith('G0 ')) {
      const parts = trimmed.split(' ');
      for (const part of parts) {
        if (part.startsWith('X')) currentX = parseFloat(part.substring(1));
        if (part.startsWith('Y')) currentY = parseFloat(part.substring(1));
        if (part.startsWith('Z')) currentZ = parseFloat(part.substring(1));
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  console.log(`G-code parsed: ${positions.length / 6} extrusion line segments`);
  return geometry;
}

export default function Model3DViewer({ modelXml, gcodes }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlate, setSelectedPlate] = useState(0);
  const cleanupRef = useRef(null);

  // Get current G-code based on selected plate
  const currentGcode = gcodes && gcodes.length > 0 ? gcodes[selectedPlate]?.content : null;

  useEffect(() => {
    if ((!modelXml && !currentGcode) || !containerRef.current) return;

    let scene, camera, renderer, controls, animationId;

    async function init3DScene() {
      try {
        setLoading(true);
        setError(null);

        let object;

        // Render G-code visualization (preferred for print jobs)
        if (currentGcode) {
          console.log('Creating G-code visualization');
          const geometry = parseGcode(currentGcode);

          // Use LineSegments for G-code paths
          const material = new THREE.LineBasicMaterial({
            color: 0x00a8e8,
            linewidth: 2
          });

          object = new THREE.LineSegments(geometry, material);

          // Center and scale
          geometry.computeBoundingBox();
          const box = geometry.boundingBox;
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = maxDim > 0 ? 200 / maxDim : 1;

          object.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
          object.scale.setScalar(scale);
        }
        // Fall back to 3D model XML (not available in print jobs)
        else if (modelXml) {
          throw new Error('3D-Modell-Anzeige noch nicht implementiert');
        }
        else {
          throw new Error('Keine Visualisierungsdaten verfügbar');
        }

        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);

        // Camera
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
        camera.position.set(150, 150, 150);
        camera.lookAt(0, 0, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight1.position.set(1, 1, 1);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight2.position.set(-1, -1, -1);
        scene.add(directionalLight2);

        // Grid helper (build plate)
        const gridHelper = new THREE.GridHelper(400, 20, 0xcccccc, 0xeeeeee);
        scene.add(gridHelper);

        // Add object
        scene.add(object);

        // Orbit controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 10;
        controls.maxDistance = 1000;

        // Animation loop
        function animate() {
          animationId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        }
        animate();

        // Handle window resize
        const handleResize = () => {
          if (!container) return;
          const width = container.clientWidth;
          const height = container.clientHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // Setup cleanup function
        cleanupRef.current = () => {
          window.removeEventListener('resize', handleResize);
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
          if (controls) {
            controls.dispose();
          }
          if (renderer) {
            renderer.dispose();
            if (container && container.contains(renderer.domElement)) {
              container.removeChild(renderer.domElement);
            }
          }
          if (scene) {
            scene.traverse((obj) => {
              if (obj.geometry) {
                obj.geometry.dispose();
              }
              if (obj.material) {
                if (Array.isArray(obj.material)) {
                  obj.material.forEach(material => material.dispose());
                } else {
                  obj.material.dispose();
                }
              }
            });
          }
        };

        setLoading(false);
      } catch (err) {
        console.error('3D viewer error:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    init3DScene();

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [modelXml, currentGcode]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 400,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Plate selector */}
      {gcodes && gcodes.length > 0 && (
        <Box sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Plate ({selectedPlate + 1}/{gcodes.length})</InputLabel>
            <Select
              value={selectedPlate}
              label={`Plate (${selectedPlate + 1}/${gcodes.length})`}
              onChange={(e) => setSelectedPlate(e.target.value)}
            >
              {gcodes.map((gcode, idx) => (
                <MenuItem key={idx} value={idx}>
                  Plate {gcode.plateNumber} ({gcode.name})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          width: '100%',
          position: 'relative',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      />

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <CircularProgress />
          <Box sx={{ color: 'text.secondary' }}>Lade 3D-Vorschau...</Box>
        </Box>
      )}

      {error && (
        <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
          <Alert severity="error">
            3D-Vorschau konnte nicht geladen werden: {error}
          </Alert>
        </Box>
      )}
    </Box>
  );
}
