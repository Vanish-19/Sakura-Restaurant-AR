import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, message, Modal } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { getMenuItems } from '../services/orderApi.js'

function makeReticle() {
  const geometry = new THREE.RingGeometry(0.08, 0.1, 32)
  geometry.rotateX(-Math.PI / 2)
  const material = new THREE.MeshBasicMaterial({ color: 0x00d084 })
  const reticle = new THREE.Mesh(geometry, material)
  reticle.matrixAutoUpdate = false
  reticle.visible = false
  return reticle
}

function isIOSDevice() {
  const ua = navigator.userAgent || ''
  const iOSByUA = /iPad|iPhone|iPod/i.test(ua)
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return iOSByUA || iPadOS
}

function isAndroidDevice() {
  return /Android/i.test(navigator.userAgent || '')
}

function openIosQuickLook(usdzUrl) {
  const anchor = document.createElement('a')
  anchor.setAttribute('rel', 'ar')
  anchor.setAttribute('href', usdzUrl)
  const img = document.createElement('img')
  img.setAttribute('alt', 'Open AR')
  img.style.width = '1px'
  img.style.height = '1px'
  img.style.opacity = '0'
  anchor.appendChild(img)
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

function openAndroidSceneViewer(glbUrl, title) {
  const file = encodeURIComponent(glbUrl)
  const fallbackUrl = encodeURIComponent(window.location.href)
  const arTitle = encodeURIComponent(title || 'AR Model')
  const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${file}&mode=ar_preferred&resizable=true&title=${arTitle}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${fallbackUrl};end;`
  window.location.href = intentUrl
}

export default function ArScenePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const itemIdFromQuery = searchParams.get('itemId') || ''

  const mountRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const reticleRef = useRef(null)
  const hitTestSourceRef = useRef(null)
  const hitTestRequestedRef = useRef(false)
  const referenceSpaceRef = useRef(null)
  const modelTemplatesRef = useRef(new Map())
  const placedCountsRef = useRef({})

  const [menuItems, setMenuItems] = useState([])
  const [selectedItemId, setSelectedItemId] = useState('')
  const [placedCounts, setPlacedCounts] = useState({})
  const [isArSupported, setIsArSupported] = useState(false)
  const [supportReason, setSupportReason] = useState('')
  const [isArActive, setIsArActive] = useState(false)
  const [isLoadingModel, setIsLoadingModel] = useState(false)
  const [modelScale, setModelScale] = useState(0.2)

  const arItems = useMemo(() => {
    const fromQuery = menuItems.find((item) => item.id === itemIdFromQuery)

    if (fromQuery && (fromQuery.arModels?.glb_url || fromQuery.arModels?.usdz_url)) {
      return [fromQuery]
    }

    return menuItems
      .filter((item) => item?.arModels?.glb_url)
      .slice(0, 8)
  }, [itemIdFromQuery, menuItems])

  useEffect(() => {
    let mounted = true
    getMenuItems()
      .then((items) => {
        if (!mounted) return
        setMenuItems(items)
      })
      .catch(() => {
        if (!mounted) return
        setMenuItems([])
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedItemId && arItems.length > 0) {
      const picked = arItems.find((item) => item.id === itemIdFromQuery) || arItems[0]
      setSelectedItemId(picked.id)
    }
  }, [arItems, itemIdFromQuery, selectedItemId])

  useEffect(() => {
    let mounted = true
    const checkSupport = async () => {
      try {
        if (!window.isSecureContext) {
          if (mounted) {
            setIsArSupported(false)
            setSupportReason('WebXR cần HTTPS secure context (hoặc localhost trên chính máy đó).')
          }
          return
        }

        const xr = navigator.xr
        if (!xr) {
          if (mounted) {
            setIsArSupported(false)
            setSupportReason('Trình duyệt này không có navigator.xr (không hỗ trợ WebXR).')
          }
          return
        }

        const supported = await xr.isSessionSupported('immersive-ar')
        if (mounted) {
          setIsArSupported(Boolean(supported))
          setSupportReason(
            supported
              ? ''
              : 'Thiết bị hoặc trình duyệt không hỗ trợ immersive-ar. Android cần Chrome + ARCore.',
          )
        }
      } catch (error) {
        if (mounted) {
          setIsArSupported(false)
          setSupportReason(error?.message || 'Không thể kiểm tra hỗ trợ WebXR trên thiết bị này.')
        }
      }
    }

    checkSupport()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const mountEl = mountRef.current
    if (!mountEl) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40)
    camera.position.set(0, 1.6, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1
    renderer.xr.enabled = true

    const hemi = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.1)
    scene.add(hemi)

    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(2, 4, 1)
    scene.add(dir)

    const reticle = makeReticle()
    scene.add(reticle)

    mountEl.appendChild(renderer.domElement)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    reticleRef.current = reticle

    const onResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', onResize)

    renderer.setAnimationLoop((_, frame) => {
      if (frame) {
        const session = renderer.xr.getSession()

        if (session && !hitTestRequestedRef.current) {
          session.requestReferenceSpace('viewer').then((viewerSpace) => {
            session.requestHitTestSource({ space: viewerSpace }).then((source) => {
              hitTestSourceRef.current = source
            })
          })

          session.requestReferenceSpace('local').then((space) => {
            referenceSpaceRef.current = space
          })

          session.addEventListener('end', () => {
            hitTestRequestedRef.current = false
            hitTestSourceRef.current = null
            referenceSpaceRef.current = null
            if (reticleRef.current) reticleRef.current.visible = false
            setIsArActive(false)
          })

          hitTestRequestedRef.current = true
        }

        const referenceSpace = referenceSpaceRef.current
        const hitTestSource = hitTestSourceRef.current

        if (referenceSpace && hitTestSource) {
          const hitTestResults = frame.getHitTestResults(hitTestSource)
          if (hitTestResults.length > 0) {
            const pose = hitTestResults[0].getPose(referenceSpace)
            if (pose && reticleRef.current) {
              reticleRef.current.visible = true
              reticleRef.current.matrix.fromArray(pose.transform.matrix)
            }
          } else if (reticleRef.current) {
            reticleRef.current.visible = false
          }
        }
      }

      renderer.render(scene, camera)
    })

    return () => {
      window.removeEventListener('resize', onResize)
      renderer.setAnimationLoop(null)
      renderer.dispose()
      if (renderer.domElement.parentElement === mountEl) {
        mountEl.removeChild(renderer.domElement)
      }
      sceneRef.current = null
      cameraRef.current = null
      rendererRef.current = null
      reticleRef.current = null
      hitTestSourceRef.current = null
      referenceSpaceRef.current = null
      hitTestRequestedRef.current = false
    }
  }, [])

  const selectedItem = useMemo(
    () => arItems.find((item) => item.id === selectedItemId) || null,
    [arItems, selectedItemId],
  )

  const getTemplate = async (item) => {
    const key = item.id
    const cache = modelTemplatesRef.current

    if (cache.has(key)) {
      return cache.get(key)
    }

    const loader = new GLTFLoader()
    const templatePromise = loader.loadAsync(item.arModels.glb_url).then((gltf) => {
      const root = gltf.scene || new THREE.Group()
      root.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = false
          node.receiveShadow = false
        }
      })
      return root
    })

    cache.set(key, templatePromise)
    return templatePromise
  }

  const placeSelectedModel = async () => {
    const reticle = reticleRef.current
    const scene = sceneRef.current

    if (!selectedItem) {
      message.warning('Chưa có món AR để đặt lên bàn')
      return
    }

    if (!scene || !reticle || !reticle.visible) {
      message.info('Di chuyển camera tới mặt bàn, khi vòng xanh hiện thì chạm lại để đặt món')
      return
    }

    try {
      setIsLoadingModel(true)
      const template = await getTemplate(selectedItem)
      const model = template.clone(true)

      model.position.setFromMatrixPosition(reticle.matrix)
      model.quaternion.setFromRotationMatrix(reticle.matrix)
      model.rotation.x = 0
      model.scale.setScalar(modelScale)

      scene.add(model)

      const nextCounts = {
        ...placedCountsRef.current,
        [selectedItem.id]: (placedCountsRef.current[selectedItem.id] || 0) + 1,
      }
      placedCountsRef.current = nextCounts
      setPlacedCounts(nextCounts)
    } catch {
      message.error('Không tải được model GLB. Kiểm tra lại URL model.')
    } finally {
      setIsLoadingModel(false)
    }
  }

  const startArSession = async () => {
    if (!isArSupported) {
      message.error('Thiết bị hoặc trình duyệt chưa hỗ trợ WebXR AR')
      return
    }

    const renderer = rendererRef.current
    if (!renderer) return

    const optionsCandidates = [
      {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body },
      },
      {
        requiredFeatures: ['hit-test'],
      },
      {
        optionalFeatures: ['hit-test'],
      },
    ]

    try {
      let session = null
      let lastError = null

      for (const options of optionsCandidates) {
        try {
          session = await navigator.xr.requestSession('immersive-ar', options)
          break
        } catch (error) {
          lastError = error
        }
      }

      if (!session) {
        throw lastError || new Error('Unable to start immersive-ar session')
      }

      session.addEventListener('select', placeSelectedModel)

      await renderer.xr.setSession(session)
      setIsArActive(true)
      message.success('AR đã bật. Đưa camera vào mặt bàn và chạm để đặt món.')
    } catch (error) {
      const errorName = String(error?.name || '').trim()
      const errorText = String(error?.message || '').trim()

      if (errorName === 'NotAllowedError') {
        message.error('Trình duyệt chặn mở AR. Hãy bấm nút Bật AR trực tiếp và cấp quyền camera.')
        return
      }

      if (errorName === 'NotSupportedError') {
        Modal.confirm({
          title: 'AR Nâng cao chưa hỗ trợ',
          content: 'Thiết bị hoặc phiên bản trình duyệt của bạn không hỗ trợ công nghệ WebXR (đặt nhiều món bằng Three.js). Tự động chuyển sang chế độ AR Cơ bản (xem từng món một) để đảm bảo tương thích mọi hệ máy nhé?',
          okText: 'Mở AR Cơ bản',
          cancelText: 'Huỷ',
          onOk: () => openNativeFallback()
        })
        return
      }

      Modal.confirm({
          title: 'Lỗi khởi tạo AR',
          content: `Không thể bật được AR Nâng cao: ${errorText || errorName}. Bạn có muốn thử AR Cơ bản không?`,
          okText: 'Thử AR Cơ bản',
          cancelText: 'Huỷ',
          onOk: () => openNativeFallback()
      })
    }
  }

  const stopArSession = async () => {
    const session = rendererRef.current?.xr?.getSession()
    if (!session) return
    await session.end()
  }

  const openNativeFallback = () => {
    if (!selectedItem) return

    if (isIOSDevice()) {
      if (selectedItem?.arModels?.usdz_url) {
        openIosQuickLook(selectedItem.arModels.usdz_url)
        return
      }
      message.warning('iOS cần file USDZ để mở Quick Look AR.')
      return
    }

    if (isAndroidDevice()) {
      if (selectedItem?.arModels?.glb_url) {
        openAndroidSceneViewer(selectedItem.arModels.glb_url, selectedItem.name)
        return
      }
      message.warning('Món này chưa có file GLB để mở Scene Viewer.')
      return
    }

    message.info('Native AR fallback chỉ áp dụng cho điện thoại iOS/Android.')
  }

  return (
    <div className="fixed inset-0 bg-black text-white">
      <div ref={mountRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/55" />

      <div className="absolute left-3 right-3 top-3 z-20 flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="pointer-events-auto"
        >
          Quay lại
        </Button>

        {isArActive ? (
          <Button danger className="pointer-events-auto" onClick={stopArSession}>
            Tắt AR
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-2">
            {!isArSupported ? (
               <Button type="primary" size="large" className="bg-blue-600 pointer-events-auto shadow-xl" onClick={openNativeFallback}>
                 Mở AR Cơ bản (Tương thích mọi máy)
               </Button>
            ) : (
               <div className="flex gap-2">
                 <Button type="primary" className="bg-emerald-600 pointer-events-auto" onClick={startArSession}>
                   Bật AR Nâng cao (Nhiều món)
                 </Button>
                 <Button className="pointer-events-auto" onClick={openNativeFallback}>
                   Xem AR Cơ bản
                 </Button>
               </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-20 rounded-2xl border border-white/15 bg-black/60 p-3 backdrop-blur">
        <div className="mb-2 text-sm font-semibold">
          Chọn món để đặt lên bàn
        </div>

        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {arItems.map((item) => {
            const active = selectedItemId === item.id
            const placed = placedCounts[item.id] || 0
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItemId(item.id)}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
                  active
                    ? 'border-emerald-300 bg-emerald-500/20 text-emerald-100'
                    : 'border-white/25 bg-white/10 text-white'
                }`}
              >
                {item.name} ({placed})
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-white/90">
          <div>
            Món hiện tại: <span className="font-semibold">{selectedItem?.name || 'Chưa có'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Scale</span>
            <input
              type="range"
              min="0.05"
              max="0.7"
              step="0.01"
              value={modelScale}
              onChange={(e) => setModelScale(Number(e.target.value))}
              className="w-24"
            />
            <span>{modelScale.toFixed(2)}x</span>
          </div>
        </div>

        <div className="mt-2 text-[11px] text-white/70">
          {isArSupported
            ? isLoadingModel
              ? 'Đang tải model...'
              : 'Hướng camera xuống mặt bàn, chờ vòng xanh xuất hiện rồi chạm màn hình để đặt model.'
            : (
               <div className="text-amber-200">Giới hạn phần cứng: {supportReason || 'Chỉ hỗ trợ AR Cơ bản trên máy này'}. Hãy bấm "Mở AR Cơ bản" ở góc trên.</div>
            )}
        </div>
      </div>
    </div>
  )
}
