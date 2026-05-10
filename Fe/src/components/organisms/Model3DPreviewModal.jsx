import { LoadingOutlined } from '@ant-design/icons'
import { Button, Modal, Spin } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

function fitCameraToObject(camera, controls, object) {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const fov = camera.fov * (Math.PI / 180)
  const cameraDistance = Math.abs((maxDim / 2) / Math.tan(fov / 2)) * 1.8

  camera.position.set(center.x + cameraDistance * 0.35, center.y + cameraDistance * 0.25, center.z + cameraDistance)
  camera.near = Math.max(cameraDistance / 100, 0.01)
  camera.far = cameraDistance * 20
  camera.updateProjectionMatrix()

  controls.target.copy(center)
  controls.update()
}

function Model3DViewer({ glbUrl, setLoading, setErrorText }) {
  const mountRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const modelRef = useRef(null)
  const resizeObserverRef = useRef(null)
  const frameIdRef = useRef(0)

  useEffect(() => {
    const mountEl = mountRef.current
    if (!mountEl) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f8fafc')

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 200)
    camera.position.set(0, 1.2, 2.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(mountEl.clientWidth || 640, mountEl.clientHeight || 420)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 0.2
    controls.maxDistance = 20

    const hemi = new THREE.HemisphereLight(0xffffff, 0xdbeafe, 1)
    scene.add(hemi)

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9)
    keyLight.position.set(3, 5, 4)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35)
    fillLight.position.set(-2, 2, -3)
    scene.add(fillLight)

    const grid = new THREE.GridHelper(6, 20, 0xcbd5e1, 0xe2e8f0)
    grid.position.y = -0.001
    scene.add(grid)

    mountEl.appendChild(renderer.domElement)

    sceneRef.current = scene
    cameraRef.current = camera
    controlsRef.current = controls
    rendererRef.current = renderer

    const resize = () => {
      const width = mountEl.clientWidth || 640
      const height = mountEl.clientHeight || 420
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    resizeObserverRef.current = new ResizeObserver(resize)
    resizeObserverRef.current.observe(mountEl)

    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      frameIdRef.current = window.requestAnimationFrame(animate)
    }
    animate()

    return () => {
      if (frameIdRef.current) {
        window.cancelAnimationFrame(frameIdRef.current)
      }
      frameIdRef.current = 0

      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null

      controls.dispose()
      renderer.dispose()

      if (renderer.domElement.parentElement === mountEl) {
        mountEl.removeChild(renderer.domElement)
      }

      sceneRef.current = null
      cameraRef.current = null
      controlsRef.current = null
      rendererRef.current = null
      modelRef.current = null
    }
  }, [])

  useEffect(() => {
    const scene = sceneRef.current
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!scene || !camera || !controls) return

    if (!glbUrl) {
      queueMicrotask(() => {
        setLoading(false)
        setErrorText('Món này chưa có file GLB để xem 3D trên web.')
      })
      return
    }

    let cancelled = false
    const loader = new GLTFLoader()

    queueMicrotask(() => {
      setLoading(true)
      setErrorText('')
    })

    if (modelRef.current) {
      scene.remove(modelRef.current)
      modelRef.current = null
    }

    loader.load(
      glbUrl,
      (gltf) => {
        if (cancelled) return
        const root = gltf.scene || new THREE.Group()
        root.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = false
            node.receiveShadow = false
          }
        })

        scene.add(root)
        modelRef.current = root
        fitCameraToObject(camera, controls, root)
        setLoading(false)
      },
      undefined,
      (error) => {
        if (cancelled) return
        setLoading(false)
        setErrorText(error?.message || 'Không tải được model 3D. Vui lòng kiểm tra lại URL GLB.')
      },
    )

    return () => {
      cancelled = true
    }
  }, [glbUrl, setLoading, setErrorText])

  return <div ref={mountRef} className="h-full w-full" />
}

export default function Model3DPreviewModal({ open, item, onClose, onOpenAr }) {
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')

  const glbUrl = item?.arModels?.glb_url || ''

  const arMeta = useMemo(() => {
    if (!item) return ''
    if (item?.arModels?.glb_url && item?.arModels?.usdz_url) return 'Có GLB và USDZ'
    if (item?.arModels?.glb_url) return 'Có GLB (Web/Android)'
    if (item?.arModels?.usdz_url) return 'Có USDZ (iOS)'
    return 'Chưa có model AR'
  }, [item])

  return (
    <Modal
      title={item ? `Xem 3D: ${item.name}` : 'Xem model 3D'}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="openAr" type="primary" onClick={onOpenAr} disabled={!item}>
          Mở AR
        </Button>,
      ]}
      width={900}
      centered
      destroyOnClose
    >
      <div className="space-y-3">
        <p className="text-xs font-medium text-zinc-500">{arMeta}</p>

        <div className="relative h-[460px] w-full overflow-hidden rounded-xl border border-zinc-200 bg-slate-50">
          {open && (
            <Model3DViewer
              glbUrl={glbUrl}
              setLoading={setLoading}
              setErrorText={setErrorText}
            />
          )}

          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
              <Spin indicator={<LoadingOutlined spin />} size="large" tip="Đang tải model 3D..." />
            </div>
          ) : null}

          {errorText ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm font-medium text-rose-600">
              {errorText}
            </div>
          ) : null}
        </div>

        <p className="text-xs text-zinc-500">
          Giữ chuột trái để xoay, lăn chuột để zoom, giữ chuột phải để pan.
        </p>
      </div>
    </Modal>
  )
}