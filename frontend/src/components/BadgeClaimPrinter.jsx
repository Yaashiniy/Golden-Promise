import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/* ── shared receipt content ─────────────────────────────────────────────── */

function ReceiptBody({ vendorName, businessTypeLabel, applicationId, approvedDate }) {
  return (
    <>
      <div className="receipt-header">
        Golden Promise <br />
        Vendor Verification <br />
        Malaysia
        <div className="logo">💍</div>
      </div>

      <div className="receipt-subheader">
        Application #{String(applicationId ?? '—').padStart(6, '0')} <br />
        {approvedDate ?? new Date().toISOString().slice(0, 10)}
      </div>

      <table className="receipt-table">
        <tbody>
          <tr>
            <th>Check</th>
            <th>Status</th>
          </tr>
          <tr><td>Business details</td><td>PASS</td></tr>
          <tr><td>SSM / NRIC</td><td>PASS</td></tr>
          <tr><td>Portfolio review</td><td>PASS</td></tr>
          <tr><td>Directory listing</td><td>READY</td></tr>
          <tr className="receipt-subtotal">
            <td>Approved as</td>
            <td>{businessTypeLabel}</td>
          </tr>
          <tr className="receipt-total">
            <td>Verification</td>
            <td>APPROVED</td>
          </tr>
        </tbody>
      </table>

      <div className="receipt-message">
        Congratulations, {vendorName}! Your profile is approved — you can now
        publish your listing and go live in the directory.
      </div>
    </>
  )
}

/* ── standalone receipt (no printer) ────────────────────────────────────── */

/**
 * The printed receipt on its own, in normal document flow — used to keep the
 * receipt visible next to the "badge claimed" banner after the modal is closed.
 */
export function VerificationReceipt({
  vendorName = 'Your business',
  businessTypeLabel = 'Verified vendor',
  applicationId,
  approvedDate,
  className = '',
}) {
  return (
    <div className={`gp-printer is-static ${className}`}>
      <div className="receipt-wrapper">
        <div className="receipt">
          <ReceiptBody
            vendorName={vendorName}
            businessTypeLabel={businessTypeLabel}
            applicationId={applicationId}
            approvedDate={approvedDate}
          />
        </div>
      </div>
      <PrinterStyles />
    </div>
  )
}

/* ── printer modal ─────────────────────────────────────────────────────── */

/**
 * Receipt-printer flourish used to claim the verified badge, shown as a modal.
 *
 * Adapted from a styled-components snippet to a plain <style> block (the
 * convention used elsewhere in this app) so it needs no extra dependency.
 * The print animation is driven by React state rather than `:has(:focus)`
 * so the receipt stays on screen after printing instead of disappearing
 * the moment the button loses focus.
 *
 * Rendered through a portal: the page uses transformed/overflow-hidden
 * ancestors that would otherwise clip a fixed-position overlay. Deliberately
 * does NOT close on backdrop click — the printed receipt should stay put until
 * the user dismisses it with X (Escape also works, for keyboard users).
 */
export function BadgeClaimPrinter({
  open = false,
  onClose,
  onClaim,
  isPending = false,
  vendorName = 'Your business',
  businessTypeLabel = 'Verified vendor',
  applicationId,
  approvedDate,
}) {
  const [printing, setPrinting] = useState(false)

  // Reset back to the un-printed state each time the modal is reopened.
  useEffect(() => {
    if (open) setPrinting(false)
  }, [open])

  // Escape to close, and lock background scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  function handlePrint() {
    if (isPending || printing) return
    setPrinting(true)
    onClaim?.()
  }

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Claim your verified badge"
    >
      <div className="relative my-auto w-full max-w-[560px] rounded-[28px] bg-[#FAF8F5] border border-burgundy-900/10 shadow-[0_40px_90px_-20px_rgba(0,0,0,0.45)] px-6 pt-6 pb-10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-[60] w-9 h-9 rounded-full bg-white border border-burgundy-900/10 text-burgundy-900 flex items-center justify-center shadow-sm hover:bg-burgundy-900 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center pr-10">
          <p className="text-[11px] font-bold tracking-[0.25em] text-[#C08E3F] uppercase">Verification</p>
          <h3 className="mt-1 font-display text-2xl text-burgundy-900">
            {printing ? 'Your approval receipt' : 'Print your approval receipt'}
          </h3>
        </div>

        {/* Stage — starts just tall enough for the printer and grows once printing
            begins, so the modal doesn't open with ~350px of dead space above it.
            Deliberately NOT transitioned: layout correctness would then depend on
            the transition completing, which breaks under reduced-motion/throttling. */}
        <div
          className="mt-6 flex justify-center"
          style={{ minHeight: printing ? 430 : 120 }}
        >
          <div className="self-end">
            <div className="gp-printer">
              <div className={`wrapper ${printing ? 'is-printing' : ''}`}>
                <div className="printer" />

                <div className="printer-display">
                  <span className="printer-message">Click to claim</span>
                  <div className="letter-wrapper">
                    {'Printing...'.split('').map((ch, i) => (
                      <span className="letter" key={i}>{ch}</span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="print-button"
                  onClick={handlePrint}
                  disabled={isPending}
                  aria-label="Claim my verified badge"
                  title="Claim my verified badge"
                >
                  🖨
                </button>

                <div className="receipt-wrapper" aria-live="polite">
                  <div className="receipt">
                    <ReceiptBody
                      vendorName={vendorName}
                      businessTypeLabel={businessTypeLabel}
                      applicationId={applicationId}
                      approvedDate={approvedDate}
                    />
                  </div>
                </div>
              </div>

              <PrinterStyles />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ── styles (shared by both variants) ──────────────────────────────────── */

function PrinterStyles() {
  return (
    <style>{`
      .gp-printer .wrapper {
        --printer-color: #dcdac4;
        --printer-color-2: #c0beaa;
        --receipt-color: #f5f5f5;
        font-size: 14px;
        position: relative;
        user-select: none;
      }

      .gp-printer .printer {
        width: 320px;
        height: 80px;
        border-radius: 0 0 8px 8px;
        background-color: var(--printer-color);
        border: 2px solid var(--printer-color-2);
        box-shadow: 0 16px 32px 0px #0002, 0 -30px 16px 0px #0001;
      }

      .gp-printer .printer::before {
        content: "";
        position: absolute;
        top: -30px;
        left: 0;
        width: 100%;
        height: 70px;
        border-radius: 12px 12px 0 0;
        border-bottom: 2px solid #0003;
        box-shadow: 0 12px 16px -12px #fff5 inset, 0 -6px 16px -6px #0003 inset, 0 6px 8px -6px #0004;
        box-sizing: border-box;
        background-color: inherit;
        filter: brightness(1.12);
        z-index: 2;
      }

      .gp-printer .printer::after {
        content: "";
        position: absolute;
        top: 20px;
        left: 30px;
        width: 260px;
        height: 40px;
        border-radius: 0 0 4px 4px;
        border-bottom: 1px solid #0003;
        background-color: inherit;
        background-image: linear-gradient(to top, var(--printer-color), 60%, var(--printer-color-2));
        box-shadow: 0 4px 4px -2px #0004;
        z-index: 1;
      }

      .gp-printer .printer-display {
        z-index: 2;
        display: flex;
        padding: 6px 8px;
        position: absolute;
        top: -10px;
        left: 30px;
        width: 160px;
        height: 32px;
        background-color: #000;
        background-image: linear-gradient(transparent 0, #fff2 90%, transparent 100%);
        background-size: 100% 8px;
        background-repeat: no-repeat;
        border: 3px solid var(--printer-color-2);
        border-radius: 6px;
        box-sizing: border-box;
        box-shadow: -1px -1px 2px 0 #fff9 inset, 1px 1px 5px 1px #000 inset, 0 0 1px 2px #0002;
        font-family: "Courier New", Courier, monospace;
        font-size: 0.8em;
        color: #5aff5a;
        filter: drop-shadow(1px 1px 1px #0002);
      }

      .gp-printer .print-button {
        z-index: 2;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
        position: absolute;
        top: -30px;
        right: 0;
        margin: 16px;
        border: 1px solid #0001;
        border-radius: 6px;
        width: 48px;
        height: 36px;
        background-color: var(--printer-color);
        box-shadow: 1px 1px 2px 0 #fff8 inset, -1px -1px 2px 0 #0002 inset, 0 2px 6px 0px #0002;
        transition: box-shadow 0.1s ease-in-out, transform 0.1s ease-in-out;
      }

      .gp-printer .print-button:hover:not(:disabled) {
        box-shadow: 2px 2px 2px 0 #fff9 inset, -2px -2px 2px 0 #0002 inset, 0 2px 10px 0px #0002;
        transform: scale(1.05);
      }

      .gp-printer .print-button:active:not(:disabled) {
        box-shadow: 2px 2px 2px 0 #0002 inset, -2px -2px 2px 0 #fff9 inset, 0 0px 4px 0px #fff9;
        transform: scale(0.95);
      }

      .gp-printer .print-button:disabled { cursor: not-allowed; opacity: 0.7; }

      .gp-printer .receipt-wrapper {
        position: absolute;
        top: 0;
        left: 44px;
        filter: drop-shadow(0 0 12px #0001);
        transform: translateY(-100%);
        clip-path: inset(100% -100px -100px -100px);
        transition: clip-path 0.5s;
      }

      .gp-printer .receipt {
        z-index: 2;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 1em;
        padding: 16px;
        width: 232px;
        min-height: 160px;
        font-size: 0.75em;
        font-family: "Azeret Mono", "Roboto Mono", monospace;
        font-weight: 400;
        color: #444;
        background-color: var(--receipt-color);
        box-shadow: 0 12px 12px 0 #0001, 0 24px 24px 0 #0001, 0 36px 36px 0 #0001;
      }

      .gp-printer .receipt::before,
      .gp-printer .receipt::after {
        --angle: 45deg;
        content: "";
        display: block;
        position: absolute;
        left: 0px;
        width: 100%;
        height: 8px;
        background: linear-gradient(calc(var(--angle) * -1), var(--receipt-color) 4px, transparent 0),
                    linear-gradient(var(--angle), var(--receipt-color) 4px, transparent 0);
        background-position: 4px 0;
        background-repeat: repeat-x;
        background-size: 8px 8px;
      }
      .gp-printer .receipt::before { top: -8px; background-position: 4px 0; }
      .gp-printer .receipt::after { bottom: -8px; background-position: 0 100%; --angle: 225deg; }

      .gp-printer .receipt-header,
      .gp-printer .receipt-subheader,
      .gp-printer .receipt-message {
        display: flex;
        justify-content: space-between;
        padding: 0.2em 0;
      }

      .gp-printer .receipt-header { font-size: 1.1em; font-weight: 600; }
      .gp-printer .receipt-subheader { border-bottom: 1px dashed #ccc; }
      .gp-printer .receipt-message { justify-content: center; text-align: center; padding: 0 0.5em; line-height: 1.5em; }

      .gp-printer .receipt .logo {
        width: 48px;
        font-size: 2.4em;
        transform: rotate(10deg);
        filter: grayscale(1);
        text-align: right;
      }

      .gp-printer .receipt-subtotal td { border-top: 1px dashed #ccc; }
      .gp-printer .receipt-total td { border-top: 1px dashed #ccc; font-weight: 600; }

      .gp-printer .receipt-table {
        font: inherit;
        color: inherit;
        text-align: left;
        line-height: 1.5em;
        width: 100%;
      }
      .gp-printer .receipt-table th:last-child,
      .gp-printer .receipt-table td:last-child { text-align: right; }

      .gp-printer .letter-wrapper { position: inherit; display: flex; }
      .gp-printer .letter { display: inline-block; opacity: 0; white-space: pre; }

      /* --- print sequence, triggered by the .is-printing class --- */
      .gp-printer .is-printing .receipt-wrapper {
        animation: gp-print 1.2s 1 forwards ease-in,
                   gp-display 0.4s 1 forwards cubic-bezier(0, 0.63, 0.96, 1.1);
        animation-delay: 0s, 1.35s;
      }
      .gp-printer .is-printing .printer-message { opacity: 0; }
      .gp-printer .is-printing .letter { animation: gp-show-text 0.6s 1 forwards linear; }
      .gp-printer .is-printing .letter:nth-child(1)  { animation-delay: 0.05s; }
      .gp-printer .is-printing .letter:nth-child(2)  { animation-delay: 0.10s; }
      .gp-printer .is-printing .letter:nth-child(3)  { animation-delay: 0.15s; }
      .gp-printer .is-printing .letter:nth-child(4)  { animation-delay: 0.20s; }
      .gp-printer .is-printing .letter:nth-child(5)  { animation-delay: 0.25s; }
      .gp-printer .is-printing .letter:nth-child(6)  { animation-delay: 0.30s; }
      .gp-printer .is-printing .letter:nth-child(7)  { animation-delay: 0.35s; }
      .gp-printer .is-printing .letter:nth-child(8)  { animation-delay: 0.40s; }
      .gp-printer .is-printing .letter:nth-child(9)  { animation-delay: 0.45s; }
      .gp-printer .is-printing .letter:nth-child(10) { animation-delay: 0.50s; }
      .gp-printer .is-printing .letter:nth-child(11) { animation-delay: 0.55s; }

      /* --- standalone (no printer): sit in normal flow, fully visible ---
         The vars and base font-size normally come from .wrapper, which this
         variant doesn't render, so they're re-declared on the root here. */
      .gp-printer.is-static {
        --receipt-color: #f5f5f5;
        font-size: 14px;
      }
      .gp-printer.is-static .receipt-wrapper {
        position: static;
        transform: none;
        clip-path: none;
        animation: none;
        left: 0;
        filter: drop-shadow(0 0 12px #0001);
      }

      @keyframes gp-print {
        100% { transform: translateY(10%); clip-path: inset(-20% -100px -100px -100px); }
      }
      @keyframes gp-display {
        30%  { transform: translateY(22%) rotate3d(1, 0, 1, -5deg); }
        70%  { z-index: 5; }
        100% { z-index: 5; transform: translateY(-40%) scale(1.2); }
      }
      @keyframes gp-show-text {
        10%, 100% { opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        .gp-printer .is-printing .receipt-wrapper {
          animation: none;
          transform: translateY(10%);
          clip-path: inset(-20% -100px -100px -100px);
        }
        .gp-printer .is-printing .letter { animation: none; opacity: 1; }
      }
    `}</style>
  )
}
