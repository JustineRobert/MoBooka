import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBookByBarcode } from '../api/api';
import jsQR from 'jsqr';

export default function BarcodeScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [permissionError, setPermissionError] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [status, setStatus] = useState('Initializing camera...');
  const navigate = useNavigate();

  useEffect(() => {
    let animationFrame;
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setStatus('Scanning for barcode...');
        animationFrame = requestAnimationFrame(scanFrame);
      } catch (err) {
        setPermissionError('Camera access is required to scan barcodes.');
      }
    };

    const scanFrame = () => {
      if (!videoRef.current || !canvasRef.current) {
        animationFrame = requestAnimationFrame(scanFrame);
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code?.data) {
        setScannedCode(code.data);
        setStatus(`Barcode detected: ${code.data}`);
        video.pause();
        const stream = video.srcObject;
        if (stream) stream.getTracks().forEach((track) => track.stop());
        fetchBook(code.data);
        return;
      }
      animationFrame = requestAnimationFrame(scanFrame);
    };

    const fetchBook = async (barcode) => {
      try {
        const data = await fetchBookByBarcode(barcode);
        if (data?._id) {
          navigate(`/books/${data._id}`);
        } else {
          setStatus('Book not found for scanned barcode.');
        }
      } catch (err) {
        setStatus(err.message);
      }
    };

    setupCamera();
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [navigate]);

  return (
    <div className="card" style={{ maxWidth: 960, margin: '0 auto' }}>
      <h1>Barcode scanner</h1>
      {permissionError ? (
        <p style={{ color: '#ff6b6b' }}>{permissionError}</p>
      ) : (
        <>
          <video ref={videoRef} style={{ width: '100%', borderRadius: '12px' }} muted playsInline />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <p>{status}</p>
          {scannedCode && <p><strong>Scanned:</strong> {scannedCode}</p>}
        </>
      )}
    </div>
  );
}
