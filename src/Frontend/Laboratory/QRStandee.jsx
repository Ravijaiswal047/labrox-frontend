import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

const QRStandee = () => {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const registrationUrl = `${window.location.origin}/SelfRegistration`;

  useEffect(() => {
    QRCode.toDataURL(registrationUrl, {
      width: 260,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Error:", err));
  }, [registrationUrl]);

  return (
    <div className="qr-page-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800;900&family=Open+Sans:wght@400;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .qr-page-root {
          min-height: 100vh;
          background: #d0d8e4;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: 'Montserrat', sans-serif;
        }

        /* ─── Outer acrylic holder ─── */
        .qr-holder {
          width: 360px;
          background: transparent;
          border-radius: 18px;
          padding: 12px;
          position: relative;
        }

        /* ─── White card (the printed insert) ─── */
        .qr-card {
          background: #f5f7fa;
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 2px 8px rgba(0,0,0,0.18),
            0 12px 40px rgba(0,0,0,0.22),
            inset 0 0 0 1px rgba(255,255,255,0.6);
          position: relative;
        }

        /* ─── Acrylic sheen overlay ─── */
        .qr-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.25) 0%,
            transparent 50%,
            rgba(255,255,255,0.08) 100%
          );
          border-radius: 14px;
          pointer-events: none;
          z-index: 10;
        }

        /* ─── Navy header band ─── */
        .qr-header {
          background: #1a2a4a;
          padding: 28px 20px 24px;
          text-align: center;
          position: relative;
        }

        .scan-here-text {
          font-size: 46px;
          font-weight: 900;
          color: #3d7fcc;
          letter-spacing: 1px;
          line-height: 1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          margin-bottom: 10px;
        }

        .new-patient-line {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.5px;
          line-height: 1.2;
          text-transform: uppercase;
        }

        /* ─── Clinic name pill ─── */
        .clinic-pill {
          margin: 16px auto 0;
          display: inline-block;
          background: #f5f7fa;
          border: 1.5px solid #c0c8d8;
          border-radius: 50px;
          padding: 6px 20px;
          font-size: 12px;
          font-weight: 700;
          color: #1a2a4a;
          letter-spacing: 0.2px;
        }

        /* ─── QR body ─── */
        .qr-body {
          background: #f5f7fa;
          padding: 28px 28px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ─── QR corner frame ─── */
        .qr-frame-outer {
          position: relative;
          padding: 14px;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.12);
        }

        .qr-corner {
          position: absolute;
          width: 28px;
          height: 28px;
          border-color: #2d5fa6;
          border-style: solid;
        }
        .qr-corner.tl { top: -3px; left: -3px;  border-width: 5px 0 0 5px; border-radius: 4px 0 0 0; }
        .qr-corner.tr { top: -3px; right: -3px; border-width: 5px 5px 0 0; border-radius: 0 4px 0 0; }
        .qr-corner.bl { bottom: -3px; left: -3px;  border-width: 0 0 5px 5px; border-radius: 0 0 0 4px; }
        .qr-corner.br { bottom: -3px; right: -3px; border-width: 0 5px 5px 0; border-radius: 0 0 4px 0; }

        .qr-img {
          display: block;
          width: 230px;
          height: 230px;
        }

        /* ─── TQRCG watermark inside QR area ─── */
        .tqrcg-badge {
          position: absolute;
          bottom: 20px;
          right: 18px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          color: #555;
        }
        .tqrcg-dot {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          background: linear-gradient(135deg, #e04444 50%, #4444e0 50%);
          display: inline-block;
          flex-shrink: 0;
        }

        /* ─── Footer ─── */
        .qr-footer {
          background: #f5f7fa;
          border-top: 1px solid #e0e4ed;
          padding: 10px 20px 14px;
          text-align: center;
        }

        .powered-by {
          font-size: 10.5px;
          font-weight: 600;
          color: #7a8499;
          letter-spacing: 0.2px;
        }

        /* ─── Acrylic edge bar (bottom of holder) ─── */
        .qr-holder-base {
          height: 14px;
          background: linear-gradient(180deg, #b8c0cc 0%, #8a9299 100%);
          border-radius: 0 0 10px 10px;
          margin: 0 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        /* Print button (only visible on screen) */
        .print-btn {
          display: block;
          margin: 20px auto 0;
          padding: 10px 32px;
          background: #1a2a4a;
          color: #fff;
          border: none;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: background 0.2s, transform 0.15s;
          font-family: 'Montserrat', sans-serif;
        }
        .print-btn:hover {
          background: #2d5fa6;
          transform: translateY(-2px);
        }

        @media print {
          .qr-page-root { background: white; padding: 0; }
          .print-btn { display: none; }
          .qr-holder { width: 100%; }
        }
      `}</style>

      {/* ── Acrylic standee holder ── */}
      <div>
        <div className="qr-holder">
          <div className="qr-card">

            {/* ─── Header ─── */}
            <div className="qr-header">
              <div className="scan-here-text">SCAN HERE</div>
              <div className="new-patient-line">
                NEW PATIENT<br />REGISTER YOUR-SELF
              </div>
              {/* <div className="text-center mt-2">
                <span className="clinic-pill">Zenre (A Unit of BD Wellness Pvt. Ltd.)</span>
              </div> */}
            </div>

            {/* ─── QR Code body ─── */}
            <div className="qr-body">
              <div className="qr-frame-outer">
                <span className="qr-corner tl" />
                <span className="qr-corner tr" />
                <span className="qr-corner bl" />
                <span className="qr-corner br" />

                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Patient Self-Registration QR"
                    className="qr-img"
                  />
                ) : (
                  <div
                    className="qr-img d-flex align-items-center justify-content-center"
                    style={{ background: "#f0f0f0" }}
                  >
                    <span style={{ fontSize: 12, color: "#999" }}>Generating…</span>
                  </div>
                )}

                {/* TQRCG watermark */}
                <div className="tqrcg-badge">
                  <span className="tqrcg-dot" />
                  <span>TQRCG</span>
                </div>
              </div>
            </div>

            {/* ─── Footer ─── */}
            <div className="qr-footer">
              <p className="powered-by">Powered by LabRox Technologies</p>
            </div>

          </div>
        </div>

        {/* Acrylic base bar */}
        <div className="qr-holder-base" />

        {/* Print / Share button */}
        <button className="print-btn" onClick={() => window.print()}>
          🖨 Print QR
        </button>
      </div>
    </div>
  );
};

export default QRStandee;
