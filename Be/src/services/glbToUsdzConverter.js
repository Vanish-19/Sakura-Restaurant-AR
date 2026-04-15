/**
 * GLB → USDZ Converter
 * Sử dụng three.js USDZExporter chạy server-side (Node.js)
 * để convert file GLB sang USDZ.
 */

// ── Polyfill browser globals cho three.js trên Node.js ──
if (typeof self === 'undefined')      globalThis.self = globalThis;
if (typeof window === 'undefined')    globalThis.window = globalThis;
if (typeof navigator === 'undefined') globalThis.navigator = { userAgent: '' };
if (typeof HTMLCanvasElement === 'undefined') globalThis.HTMLCanvasElement = class HTMLCanvasElement {};
if (typeof Image === 'undefined') {
  globalThis.Image = class Image {
    constructor() { this.src = ''; }
    set onload(fn) { if (fn) fn(); }
  };
}
if (typeof document === 'undefined') {
  globalThis.document = {
    createElement: (tag) => {
      if (tag === 'canvas') {
        return {
          getContext: () => ({
            fillRect: () => {},
            drawImage: () => {},
            getImageData: () => ({ data: new Uint8Array(0) }),
            putImageData: () => {},
            createImageData: () => ({ data: new Uint8Array(0) }),
            canvas: { width: 0, height: 0 },
          }),
          width: 0,
          height: 0,
          toDataURL: () => '',
        };
      }
      return {};
    },
    createElementNS: (_ns, tag) => {
      if (tag === 'img') return new Image();
      return {};
    },
  };
}
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = () => '';
  URL.revokeObjectURL = () => {};
}
// ── End Polyfills ──

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';

/**
 * Convert GLB buffer sang USDZ buffer
 * @param {Buffer} glbBuffer - Buffer chứa dữ liệu file .glb
 * @returns {Promise<Buffer>} - Buffer chứa dữ liệu file .usdz
 */
export async function convertGlbToUsdz(glbBuffer) {
  if (!glbBuffer || glbBuffer.length === 0) {
    throw new Error('GLB buffer rỗng, không thể convert');
  }

  // Parse GLB → three.js scene
  const loader = new GLTFLoader();
  const arrayBuffer = glbBuffer.buffer.slice(
    glbBuffer.byteOffset,
    glbBuffer.byteOffset + glbBuffer.byteLength
  );

  const gltf = await new Promise((resolve, reject) => {
    loader.parse(
      arrayBuffer,
      '',
      (result) => resolve(result),
      (error) => reject(new Error(`Lỗi parse GLB: ${error?.message || error}`))
    );
  });

  const scene = gltf.scene;
  if (!scene) {
    throw new Error('GLB file không chứa scene hợp lệ');
  }

  // Export scene → USDZ
  const exporter = new USDZExporter();
  const usdzArrayBuffer = await exporter.parseAsync(scene);

  if (!usdzArrayBuffer) {
    throw new Error('USDZ exporter không trả về dữ liệu');
  }

  // Convert ArrayBuffer → Node.js Buffer
  return Buffer.from(usdzArrayBuffer);
}
