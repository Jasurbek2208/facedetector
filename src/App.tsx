import * as faceapi from 'face-api.js'
import { block } from 'million/react'
import { useEffect, useRef, RefObject } from 'react'

const AppBlock = block(
  function App(): JSX.Element {
    const videoRef: RefObject<HTMLVideoElement> = useRef<HTMLVideoElement>(null)

    const detectFaces = async () => {
      if (!videoRef.current || !videoRef.current.videoWidth || !videoRef.current.videoHeight) return

      const canvas = faceapi.createCanvasFromMedia(videoRef.current)
      document.body.append(canvas)
      faceapi.matchDimensions(canvas, videoRef.current)

      setInterval(async () => {
        if (!videoRef.current || !videoRef.current.videoWidth || !videoRef.current.videoHeight) return

        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
        const resizeDetections = faceapi.resizeResults(detections, { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight })

        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizeDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizeDetections)
      }, 100)
    }

    useEffect(() => {
      const startWebcam = async () => {
        try {
          // Check if the browser supports mediaDevices and getUserMedia
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('WebRTC is not supported in this browser.')
            throw new Error('WebRTC is not supported in this browser.')
          }

          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          detectFaces()

          if (!videoRef.current) return
          videoRef.current.srcObject = stream
        } catch (error) {
          console.error('Error accessing webcam:', error)
        }
      }

      startWebcam()

      // Cleanup function
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          const tracks = stream.getTracks()
          tracks.forEach((track) => {
            track.stop()
          })
        }
      }
    }, [])

    return <video ref={videoRef} id='video' autoPlay />
  },
  { as: 'div' },
)

export default AppBlock
