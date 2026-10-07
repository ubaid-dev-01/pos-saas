import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../context/LocaleContext";
import Modal from "./Modal";

const READER_ID = "quickpos-barcode-reader";

function normalizeCode(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .trim();
}

function cameraErrorMessage(errorMsg, t) {
  if (errorMsg.includes("NotAllowedError")) {
    return t("ui.scanner.permissionDenied");
  }
  if (errorMsg.includes("NotReadableError")) {
    return t("ui.scanner.inUse");
  }
  if (errorMsg.includes("NotFoundError")) {
    return t("ui.scanner.notFound");
  }
  if (errorMsg.includes("SecurityError")) {
    return t("ui.scanner.securityBlocked");
  }
  return t("ui.scanner.error", {
    message: errorMsg || t("ui.scanner.unknownError"),
  });
}

export default function BarcodeScannerModal({ open, onClose, onDetected }) {
  const { t } = useTranslation();
  const html5ScannerRef = useRef(null);
  const qrScannerRef = useRef(null);
  const videoRef = useRef(null);
  const detectedRef = useRef(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [engine, setEngine] = useState("html5-qrcode");

  useEffect(() => {
    if (!open) {
      // Cleanup on close
      if (html5ScannerRef.current) {
        try {
          if (html5ScannerRef.current.isScanning) {
            void html5ScannerRef.current.stop();
          }
          void html5ScannerRef.current.clear();
        } catch (e) {
          console.error("[Scanner] HTML5 cleanup error:", e);
        }
        html5ScannerRef.current = null;
      }
      if (qrScannerRef.current) {
        try {
          void qrScannerRef.current.stop();
          qrScannerRef.current.destroy?.();
        } catch (e) {
          console.error("[Scanner] QrScanner cleanup error:", e);
        }
        qrScannerRef.current = null;
      }
      detectedRef.current = false;
      setError("");
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    const handleDetected = (raw) => {
      const code = normalizeCode(raw);
      if (!code || detectedRef.current) return;
      detectedRef.current = true;
      console.log("[Scanner] Code detected:", code, "Engine:", engine);
      onDetected?.(code);
      onClose?.();
    };

    const tryQrScannerFallback = async () => {
      try {
        console.log("[Scanner] Trying qr-scanner fallback...");
        setEngine("qr-scanner");
        const QrScannerModule = await import("qr-scanner");
        const QrScanner = QrScannerModule.default;

        if (!isMounted || !videoRef.current) {
          console.warn(
            "[Scanner] Component unmounted or video ref not available",
          );
          return;
        }

        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            handleDetected(result?.data || String(result || ""));
          },
          {
            preferredCamera: "environment",
            maxScansPerSecond: 10,
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          },
        );

        qrScannerRef.current = scanner;
        console.log("[Scanner] Starting qr-scanner...");
        await scanner.start();
        console.log("[Scanner] qr-scanner started successfully");

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[Scanner] qr-scanner fallback failed:", err);
        if (!isMounted) return;

        const errorMsg = String(err?.message || "");
        setError(cameraErrorMessage(errorMsg, t));
        setIsLoading(false);
      }
    };

    const startScanning = async () => {
      try {
        setIsLoading(true);
        setError("");
        detectedRef.current = false;

        // Check camera support
        if (!navigator.mediaDevices?.getUserMedia) {
          setError(t("ui.scanner.notSupported"));
          setIsLoading(false);
          return;
        }

        try {
          // Try html5-qrcode first (better barcode support)
          console.log("[Scanner] Importing html5-qrcode...");
          const Html5QrcodeModule = await import("html5-qrcode");
          const { Html5Qrcode, Html5QrcodeSupportedFormats } =
            Html5QrcodeModule;

          if (!isMounted) return;

          setEngine("html5-qrcode");
          const scanner = new Html5Qrcode(READER_ID, { verbose: false });
          html5ScannerRef.current = scanner;

          // Support all barcode formats + QR codes
          const formatsToSupport = [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
          ];

          const config = {
            fps: 15,
            qrbox: { width: 350, height: 200 },
            aspectRatio: 1.777,
            disableFlip: false,
            formatsToSupport,
          };

          console.log("[Scanner] Starting html5-qrcode...");
          try {
            const cameras = await Html5Qrcode.getCameras();
            console.log("[Scanner] Available cameras:", cameras);
            const backCamera = cameras.find((c) =>
              /back|rear|environment/i.test(c.label),
            );
            const defaultCamera = backCamera?.id || cameras[0]?.id;

            if (defaultCamera) {
              console.log("[Scanner] Using camera:", defaultCamera);
              await scanner.start(
                defaultCamera,
                config,
                (decodedText) => handleDetected(decodedText),
                () => {
                  // Frame decode miss; keep scanning.
                },
              );
            } else {
              await scanner.start(
                { facingMode: { ideal: "environment" } },
                config,
                (decodedText) => handleDetected(decodedText),
                () => {
                  // Frame decode miss; keep scanning.
                },
              );
            }

            console.log("[Scanner] html5-qrcode started successfully");
            if (isMounted) {
              setIsLoading(false);
            }
          } catch (startErr) {
            console.error("[Scanner] html5-qrcode start failed:", startErr);
            // Fallback to qr-scanner
            await tryQrScannerFallback();
          }
        } catch (importErr) {
          console.error("[Scanner] html5-qrcode import failed:", importErr);
          // Fallback to qr-scanner
          await tryQrScannerFallback();
        }
      } catch (err) {
        console.error("[Scanner] Unexpected error:", err);

        if (!isMounted) return;

        const errorMsg = String(err?.message || "");
        setError(cameraErrorMessage(errorMsg, t));
        setIsLoading(false);
      }
    };

    void startScanning();

    return () => {
      isMounted = false;
      if (html5ScannerRef.current) {
        try {
          if (html5ScannerRef.current.isScanning) {
            void html5ScannerRef.current.stop();
          }
          void html5ScannerRef.current.clear();
        } catch (e) {
          console.error("[Scanner] HTML5 cleanup error:", e);
        }
        html5ScannerRef.current = null;
      }
      if (qrScannerRef.current) {
        try {
          void qrScannerRef.current.stop();
          qrScannerRef.current.destroy?.();
        } catch (e) {
          console.error("[Scanner] QrScanner cleanup error:", e);
        }
        qrScannerRef.current = null;
      }
    };
  }, [open, onDetected, onClose, t]);

  return (
    <Modal open={open} onClose={onClose} title={t("ui.scanner.title")} wide>
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-black overflow-hidden relative min-h-[360px]">
          {/* HTML5 Qrcode Scanner */}
          <div
            id={READER_ID}
            className={`w-full h-full ${
              engine === "html5-qrcode" ? "block" : "hidden"
            }`}
          />

          {/* QR Scanner Fallback */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${
              engine === "qr-scanner" ? "block" : "hidden"
            }`}
            muted
            autoPlay
            playsInline
          />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-center">
                <div className="animate-spin mb-2">⏳</div>
                <p className="text-sm">{t("ui.scanner.initializing")}</p>
              </div>
            </div>
          )}

          {/* Engine Badge */}
          <span className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-black/60 text-white border border-white/20">
            {engine === "qr-scanner"
              ? t("ui.scanner.engineFallback")
              : t("ui.scanner.engineHtml5")}
          </span>
        </div>

        {error ? (
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-700">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        ) : (
          <p className="text-xs text-text-muted text-center">
            {t("ui.scanner.hint")}
          </p>
        )}
      </div>
    </Modal>
  );
}
