import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

/**
 * Parses a .3mf file (ZIP archive) and extracts:
 * - PNG images
 * - 3D model data (.model XML)
 * - Metadata
 */
export async function parse3mfFile(arrayBuffer) {
  const zip = new JSZip();
  const zipFile = await zip.loadAsync(arrayBuffer);

  // Log all files in the ZIP to understand structure
  console.log('=== All files in 3MF ZIP ===');
  const gcodeFiles = [];
  zipFile.forEach((relativePath, file) => {
    console.log(`  ${file.dir ? '[DIR]' : '[FILE]'} ${relativePath} (${file._data?.uncompressedSize || 0} bytes)`);

    // Look for G-code files
    if (!file.dir && (relativePath.toLowerCase().endsWith('.gcode') ||
                       relativePath.toLowerCase().endsWith('.gco') ||
                       relativePath.toLowerCase().includes('gcode'))) {
      gcodeFiles.push(relativePath);
    }
  });
  console.log('=== End of file list ===');

  if (gcodeFiles.length > 0) {
    console.log('🎯 Found G-code files:', gcodeFiles);
  }

  // Check if _rels/.rels exists, if not create it
  // ThreeMFLoader requires this file but some slicers don't include it
  const hasRels = zipFile.file('_rels/.rels') !== null;
  const hasContentTypes = zipFile.file('[Content_Types].xml') !== null;

  // Find ALL .model files
  const modelFiles = zipFile.file(/\.model$/i);
  console.log('Found .model files:', modelFiles?.length || 0);
  modelFiles?.forEach(f => console.log(`  - ${f.name}`));

  // Also check for other 3D files in 3D folder
  const files3D = [];
  zipFile.forEach((relativePath, file) => {
    if (relativePath.startsWith('3D/') && !file.dir) {
      files3D.push(relativePath);
    }
  });
  console.log('All files in 3D/ folder:', files3D);

  const modelFileName = modelFiles && modelFiles.length > 0 ? modelFiles[0].name : '3D/3dmodel.model';

  // Extract directory and filename
  const modelDir = modelFileName.substring(0, modelFileName.lastIndexOf('/'));
  const modelBasename = modelFileName.substring(modelFileName.lastIndexOf('/') + 1);

  // Check if model-specific .rels file exists
  const modelRelsPath = `${modelDir}/_rels/${modelBasename}.rels`;
  const hasModelRels = zipFile.file(modelRelsPath) !== null;

  let needsRegeneration = false;

  // Add missing files
  if (!hasRels || !hasContentTypes || !hasModelRels) {
    console.log('Adding missing 3MF metadata files for ThreeMFLoader compatibility');
    console.log('Model file detected:', modelFileName);
    console.log('Expected model .rels path:', modelRelsPath);

    if (!hasRels) {
      // Create minimal _rels/.rels file
      const relsContent = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/${modelFileName}" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" />
</Relationships>`;

      zipFile.file('_rels/.rels', relsContent);
      console.log('✓ Added _rels/.rels');
      needsRegeneration = true;
    }

    if (!hasModelRels) {
      // Create model-specific .rels file (required by ThreeMFLoader)
      const modelRelsContent = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

      zipFile.file(modelRelsPath, modelRelsContent);
      console.log(`✓ Added ${modelRelsPath}`);
      needsRegeneration = true;
    }

    if (!hasContentTypes) {
      // Create [Content_Types].xml
      const contentTypesContent = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
  <Default Extension="png" ContentType="image/png" />
  <Default Extension="jpg" ContentType="image/jpeg" />
  <Default Extension="jpeg" ContentType="image/jpeg" />
</Types>`;

      zipFile.file('[Content_Types].xml', contentTypesContent);
      needsRegeneration = true;
    }
  }

  // Extract all PNG images (exclude no_light and _small variants)
  const pngPromises = [];

  zipFile.forEach((relativePath, file) => {
    if (relativePath.toLowerCase().endsWith('.png')) {
      // Skip images with no_light or _small in the name
      const fileName = relativePath.toLowerCase();
      if (fileName.includes('no_light') || fileName.includes('_small')) {
        console.log(`Skipping image: ${relativePath}`);
        return;
      }

      pngPromises.push(
        file.async('blob').then(blob => ({
          name: relativePath,
          url: URL.createObjectURL(blob),
          blob
        }))
      );
    }
  });

  const pngImages = await Promise.all(pngPromises);

  // Extract ALL G-code files (one per plate)
  const gcodes = [];
  if (gcodeFiles.length > 0) {
    // Filter out .md5 files and extract all .gcode files
    const actualGcodeFiles = gcodeFiles.filter(f => !f.endsWith('.md5'));

    for (const gcodeFilePath of actualGcodeFiles) {
      const gcodeFileObj = zipFile.file(gcodeFilePath);
      if (gcodeFileObj) {
        const content = await gcodeFileObj.async('text');
        // Extract plate number from filename (e.g., "plate_1.gcode" -> 1)
        const match = gcodeFilePath.match(/plate[_-](\d+)\.gcode/i);
        const plateNumber = match ? parseInt(match[1]) : gcodes.length + 1;

        gcodes.push({
          name: gcodeFilePath.split('/').pop(), // Just filename
          fullPath: gcodeFilePath,
          plateNumber,
          content
        });
        console.log(`Extracted G-code from ${gcodeFilePath}: ${content.length} chars, Plate ${plateNumber}`);
      }
    }

    // Sort by plate number
    gcodes.sort((a, b) => a.plateNumber - b.plateNumber);
  }

  // Extract ALL .model files and log their content
  let modelXml = null;
  let metadata = {};

  if (modelFiles && modelFiles.length > 0) {
    console.log('=== Parsing all .model files ===');

    for (let i = 0; i < modelFiles.length; i++) {
      const file = modelFiles[i];
      const content = await file.async('text');

      console.log(`\n--- ${file.name} (${content.length} chars) ---`);
      console.log('First 500 chars:', content.substring(0, 500));

      // Parse to check for geometry
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_'
      });

      try {
        const parsed = parser.parse(content);

        // Check if this file has geometry
        const hasGeometry = parsed.model?.resources?.object;
        console.log(`  Has resources.object: ${!!hasGeometry}`);

        if (hasGeometry) {
          console.log('  ✓ This file contains 3D geometry!');
          modelXml = content; // Use this one for 3D viewer
        }

        // Extract metadata if available
        if (parsed.model?.metadata) {
          metadata = { ...metadata, ...extractMetadata(parsed.model.metadata) };
        }
      } catch (err) {
        console.warn(`Failed to parse ${file.name}:`, err);
      }
    }

    // If no file with geometry found, use first file
    if (!modelXml && modelFiles.length > 0) {
      modelXml = await modelFiles[0].async('text');
    }
  }

  // If we added missing files, generate a new ArrayBuffer
  // Otherwise use the original
  let arrayBufferForThreeJS = arrayBuffer;

  if (needsRegeneration) {
    // Generate new ArrayBuffer with the added files
    arrayBufferForThreeJS = await zipFile.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
  }

  // Check if we have geometry data (either 3D model or G-code)
  let hasGeometry = false;
  if (modelXml) {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_'
      });
      const parsed = parser.parse(modelXml);
      hasGeometry = !!(parsed.model?.resources?.object);
    } catch (err) {
      console.warn('Failed to check for geometry:', err);
    }
  }

  // If no 3D geometry but we have G-code, we can still show preview
  if (!hasGeometry && gcodes.length > 0) {
    hasGeometry = true;
    console.log('No 3D model geometry, but G-code available for visualization');
  }

  console.log('Final result: hasGeometry =', hasGeometry, 'hasGcode =', gcodes.length);

  // Add plate count to metadata if we have gcodes
  if (gcodes.length > 0) {
    metadata['plate_count'] = gcodes.length;
  }

  return {
    images: pngImages,
    modelXml,
    gcodes, // Array of G-code files (one per plate)
    metadata,
    hasGeometry, // Flag indicating if 3D geometry OR G-code is available
    zipFile, // Keep for 3D loading with Three.js
    originalArrayBuffer: arrayBufferForThreeJS // Use modified ArrayBuffer if _rels was added
  };
}

function extractMetadata(metadataNode) {
  // 3MF metadata structure: can be array of {name, value} objects or single object
  const result = {};

  if (Array.isArray(metadataNode)) {
    metadataNode.forEach(item => {
      if (item['@_name']) {
        const value = item['#text'] || item['@_value'] || '';
        // Only add non-empty values
        if (value && value.toString().trim() !== '') {
          result[item['@_name']] = value;
        }
      }
    });
  } else if (typeof metadataNode === 'object') {
    // Some slicers use different structure
    Object.entries(metadataNode).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number') {
        // Only add non-empty values
        if (value && value.toString().trim() !== '') {
          result[key] = value;
        }
      } else if (value && value['#text']) {
        const textValue = value['#text'];
        if (textValue && textValue.toString().trim() !== '') {
          result[key] = textValue;
        }
      }
    });
  }

  console.log('Extracted metadata:', result);
  return result;
}

/**
 * Cleanup blob URLs to prevent memory leaks
 */
export function cleanup3mfData(data) {
  if (data?.images) {
    data.images.forEach(img => {
      if (img.url) {
        URL.revokeObjectURL(img.url);
      }
    });
  }
}
