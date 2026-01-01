import { useRef, useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

function parseGcode(gcode) {
  const positions = [];
  const lines = gcode.split('\n');

  let currentX = 0, currentY = 0, currentZ = 0;
  let currentE = 0;

  // Helper function to safely parse float and validate
  const safeParseFloat = (str) => {
    const value = parseFloat(str);
    return isNaN(value) ? null : value;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';')) continue;

    // Handle G92 E0 (E reset) - common in sliced files
    if (trimmed.startsWith('G92 ')) {
      const parts = trimmed.split(' ');
      for (const part of parts) {
        if (part.startsWith('E')) {
          const val = safeParseFloat(part.substring(1));
          if (val !== null) {
            currentE = val;
          }
        }
      }
      continue;
    }

    // Parse G1 (linear move) commands - only draw lines with extrusion
    if (trimmed.startsWith('G1 ')) {
      const parts = trimmed.split(' ');
      let newX = currentX, newY = currentY, newZ = currentZ;
      let newE = currentE;
      let hasE = false;

      for (const part of parts) {
        if (part.startsWith('X')) {
          const val = safeParseFloat(part.substring(1));
          if (val !== null) newX = val;
        }
        if (part.startsWith('Y')) {
          const val = safeParseFloat(part.substring(1));
          if (val !== null) newY = val;
        }
        if (part.startsWith('Z')) {
          const val = safeParseFloat(part.substring(1));
          if (val !== null) newZ = val;
        }
        if (part.startsWith('E')) {
          const val = safeParseFloat(part.substring(1));
          if (val !== null) {
            newE = val;
            hasE = true;
          }
        }
      }

      // Draw line if extruding (E value increases significantly) and all values are valid
      // Use threshold to account for floating point precision
      const eDelta = newE - currentE;
      if (hasE && eDelta > 0.00001 &&
          !isNaN(currentX) && !isNaN(currentY) && !isNaN(currentZ) &&
          !isNaN(newX) && !isNaN(newY) && !isNaN(newZ)) {
        // Map G-code coordinates (X, Y, Z) to THREE.js (X, Z, Y) - Z in G-code is height
        positions.push(currentX, currentZ, currentY);
        positions.push(newX, newZ, newY);
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
        if (part.startsWith('X')) {
          const val = safeParseFloat(part.substring(1));
          if (val !== null) currentX = val;
        }
        if (part.startsWith('Y')) {
          const val = safeParseFloat(part.substring(1));
          if (val !== null) currentY = val;
        }
        if (part.startsWith('Z')) {
          const val = safeParseFloat(part.substring(1));
          if (val !== null) currentZ = val;
        }
      }
    }
  }

  if (positions.length === 0) {
    throw new Error('Keine gültigen G-Code-Daten gefunden');
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
        let gridYPosition = 0;
        if (currentGcode) {
          console.log('Creating G-code visualization');
          const bufferGeometry = parseGcode(currentGcode);

          // Center and scale first
          bufferGeometry.computeBoundingBox();
          const box = bufferGeometry.boundingBox;
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = maxDim > 0 ? 200 / maxDim : 1;

          // Convert BufferGeometry to LineGeometry for thick lines
          const positions = bufferGeometry.getAttribute('position').array;
          const lineGeometry = new LineGeometry();
          lineGeometry.setPositions(positions);

          // Use LineMaterial for proper line thickness
          const lineMaterial = new LineMaterial({
            color: 0x000000,
            linewidth: 1, // in pixels (will be responsive to screen size)
            resolution: new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight)
          });

          object = new Line2(lineGeometry, lineMaterial);
          object.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
          object.scale.setScalar(scale);

          // Calculate grid position (at Z=0 of G-code, which is Y in THREE.js)
          // box.min.y represents the minimum Z value in G-code (build plate level)
          gridYPosition = (box.min.y - center.y) * scale;

          // Update material resolution on resize
          const updateLineWidth = () => {
            if (lineMaterial && containerRef.current) {
              lineMaterial.resolution.set(
                containerRef.current.clientWidth,
                containerRef.current.clientHeight
              );
            }
          };
          window.addEventListener('resize', updateLineWidth);

          // Store reference for cleanup
          object.userData.lineWidthCleanup = () => {
            window.removeEventListener('resize', updateLineWidth);
          };
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
        gridHelper.position.y = gridYPosition;
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
              // Clean up line width event listener
              if (obj.userData?.lineWidthCleanup) {
                obj.userData.lineWidthCleanup();
              }
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
