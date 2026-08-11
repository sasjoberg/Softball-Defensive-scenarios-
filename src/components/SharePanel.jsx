import { useMemo, useState } from 'react';
import qrcode from 'qrcode-generator';

/** Renders the QR as one SVG path — no images, no network, scales cleanly. */
function QrCode({ text, size = 232 }) {
  const { path, count } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    let d = '';
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        if (qr.isDark(row, col)) d += `M${col},${row}h1v1h-1z`;
      }
    }
    return { path: d, count: n };
  }, [text]);

  const quiet = 2;
  const span = count + quiet * 2;

  return (
    <div className="qr" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${span} ${span}`} role="img" aria-label="QR code for this app">
        <rect width={span} height={span} fill="#ffffff" />
        <g transform={`translate(${quiet} ${quiet})`} fill="#0d1522">
          <path d={path} />
        </g>
      </svg>
    </div>
  );
}

export default function SharePanel({ onClose, title }) {
  const url = typeof window === 'undefined' ? '' : window.location.href.split('#')[0];
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const payload = { title, text: 'Softball defensive mental reps — pick a position and get to work.', url };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // cancelled or unavailable — fall through to copying
      }
    }
    copy();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Share with the team</h2>
          <button type="button" className="ghost" onClick={onClose}>
            Done
          </button>
        </div>
        <p className="sheet-lead">Hold this up in the dugout — anyone can point a camera at it.</p>

        <div className="qr-wrap">
          <QrCode text={url} />
        </div>

        <p className="share-url">{url}</p>

        <button type="button" className="primary" onClick={share}>
          Share link
        </button>
        <button type="button" className="ghost" onClick={copy}>
          {copied ? '✓ Link copied' : 'Copy link'}
        </button>

        <p className="setting-blurb share-note">
          Everyone gets their own name, number, and reps — nothing is shared but the app itself.
        </p>
      </div>
    </div>
  );
}
