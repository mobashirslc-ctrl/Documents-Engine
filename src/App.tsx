import { useRef, useState, useEffect } from 'react'
import { collection, addDoc, getDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from './firebase'
import QRCodeLib from 'qrcode'

type IconName =
  | 'grid' | 'file' | 'bank' | 'history' | 'settings' | 'search' 
  | 'bell' | 'upload' | 'copy' | 'download' | 'check' | 'arrow' 
  | 'phone' | 'mail' | 'pin' | 'printer' | 'external'

const paths: Record<IconName, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  file: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>,
  bank: <><path d="m3 9 9-6 9 6M5 10h14M6 10v8m4-8v8m4-8v8m4-8v8M3 21h18"/></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  upload: <><path d="M12 16V3m0 0L7 8m5-5 5 5M4 14v6h16v-6"/></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
  download: <><path d="M12 3v13m0 0 5-5m-5 5-5-5M4 20h16"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  arrow: <path d="m9 18 6-6-6-6"/>,
  phone: <path d="M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4c0 1-1 2-2 2A16 16 0 0 1 3 5c0-1 1-2 2-2Z"/>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  printer: <><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/></>,
  external: <><path d="M14 3h7v7M21 3l-9 9"/><path d="M18 13v7H4V6h7"/></>,
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function QRCode({ value, canvasRef, size = 150 }: { value: string; canvasRef: React.RefObject<HTMLCanvasElement | null>; size?: number }) {
  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(
        canvasRef.current,
        value || window.location.href,
        { width: size, margin: 1 },
        (err) => {
          if (err) console.error("QR Rendering error:", err)
        }
      )
    }
  }, [value, canvasRef, size])

  return <canvas ref={canvasRef} style={{ display: 'block' }} />
}

function UploadBox({ title, hint, compact = false, onFile }: { title: string; hint: string; compact?: boolean; onFile: (file: File) => void }) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className={`upload ${compact ? 'compact' : ''}`} onClick={() => input.current?.click()}>
      <input ref={input} type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
      <span className="upload-icon"><Icon name="upload" size={20}/></span>
      <strong>{title}</strong>
      <span>{hint}</span>
      <button type="button" className="secondary">Browse files</button>
    </div>
  )
}

// Verification Component - Directly opens the uploaded document on scan
function Verification({ docId, isBankMode }: { docId: string; isBankMode: boolean }) {
  const [docData, setDocData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDoc() {
      if (!docId) return
      try {
        const docRef = doc(db, isBankMode ? "bank_statements" : "documents", docId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setDocData(docSnap.data())
        }
      } catch (err) {
        console.error("Error fetching document:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDoc()
  }, [docId, isBankMode])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '18px', color: '#64748b', fontWeight: 600 }}>Loading document...</p>
      </div>
    )
  }

  if (!docData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '18px', color: '#ef4444', fontWeight: 600 }}>Document not found or expired.</p>
      </div>
    )
  }

  if (isBankMode) {
    return (
      <div className="verify-page">
        <header className="bank-header">
          <div className="bank-brand">
            {docData.bankLogoUrl ? (
              <img src={docData.bankLogoUrl} alt="Bank Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }} />
            ) : (
              <div className="bank-seal">{docData.bankLogoText || 'PB'}</div>
            )}
            <div><b>{docData.bankName || 'Pubali Bank PLC.'}</b><span>DIGITAL VERIFIED STATEMENT</span></div>
          </div>
        </header>
        <main className="verify-main">
          <div className="valid-badge"><span><Icon name="check" size={20}/></span>Valid Statement</div>
          <article className="certificate">
            <h1>OFFICIAL BANK STATEMENT</h1>
            <div className="certificate-details">
              <label>ACCOUNT HOLDER NAME: <b>{docData.holderName}</b></label>
              <label>CERTIFICATE ID: <b>{docData.certId}</b></label>
              <label>DATE: <b>{docData.stmtPeriod}</b></label>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>SL#</th><th>A/C NUMBER</th><th>OPEN DATE</th><th>A/C TYPE</th><th>BALANCE (BDT)</th></tr></thead>
                <tbody>
                  <tr><td>1</td><td>{docData.accNumber}</td><td>25-Jun-2019</td><td>{docData.accType}</td><td className="amount">{docData.balance}</td></tr>
                  <tr className="total"><td colSpan={4}>Total</td><td>{docData.balance}</td></tr>
                </tbody>
              </table>
            </div>
          </article>
        </main>
      </div>
    )
  }

  // Direct trade license / document full view on scan
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', margin: 0, padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {docData.fileData ? (
        docData.fileName?.match(/\.pdf$/i) ? (
          <iframe src={docData.fileData} style={{ width: '100vw', height: '100vh', border: 'none' }} title="Document PDF" />
        ) : (
          <img src={docData.fileData} alt="Document Copy" style={{ width: '100%', height: 'auto', maxHeight: '100vh', objectFit: 'contain' }} />
        )
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>{docData.fileName || 'Document'}</h2>
          <p>File loaded successfully.</p>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [mode, setMode] = useState<'direct' | 'bank'>('direct')
  const [page, setPage] = useState<'app' | 'verify'>('app')
  const [verifyId, setVerifyId] = useState('')
  const [fileName, setFileName] = useState('')
  const [activeFileBase64, setActiveFileBase64] = useState('')
  
  // Bank Custom States
  const [bankLogoFile, setBankLogoFile] = useState<File | null>(null)
  const [bankLogoText, setBankLogoText] = useState('PB')
  const [bankLogoUrl, setBankLogoUrl] = useState('')
  const [bankName, setBankName] = useState('Pubali Bank PLC.')
  const [holderName, setHolderName] = useState('SAJID MAHMUD FAHAD')
  const [accNumber, setAccNumber] = useState('3720101077850')
  const [stmtPeriod, setStmtPeriod] = useState('22-Sep-2026')
  const [balance, setBalance] = useState('৳6,09,671.50')
  const [accType, setAccType] = useState('Savings Bank Account')
  const [certId, setCertId] = useState('226047078')

  const [copied, setCopied] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const baseUrl = window.location.origin
  const [generatedUrl, setGeneratedUrl] = useState(baseUrl)
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (id) {
      setVerifyId(id)
      setPage('verify')
    }
  }, [])

  if (page === 'verify') return <Verification docId={verifyId} isBankMode={mode === 'bank'} />

  const downloadPNG = () => {
    if (!qrCanvasRef.current) return
    const image = qrCanvasRef.current.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = image
    a.download = `QR_${Date.now()}.png`
    a.click()
  }

  const downloadSVG = () => {
    QRCodeLib.toString(generatedUrl, { type: 'svg' }, (err, svgString) => {
      if (err) return
      const blob = new Blob([svgString], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `QR_${Date.now()}.svg`
      a.click()
    })
  }

  // Convert file to base64 for persistent cloud storage
  const handleFileUpload = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setActiveFileBase64(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  // Direct Document Upload Handler
  const handleDirectUploadProcess = async () => {
    if (!activeFileBase64) return
    setLoading(true)
    try {
      const docRef = await addDoc(collection(db, "documents"), {
        type: "direct_pdf",
        fileName: fileName,
        fileData: activeFileBase64,
        createdAt: serverTimestamp()
      })
      const liveLink = `${baseUrl}?id=${docRef.id}`
      setGeneratedUrl(liveLink)
      setGenerated(true)
    } catch (error) {
      console.error("Firestore error:", error)
      alert("Failed to generate QR link. Please check Firebase config.")
    } finally {
      setLoading(false)
    }
  }

  // Custom Bank Statement Handler
  const handleBankStatementProcess = async () => {
    setLoading(true)
    try {
      let logoUrl = bankLogoUrl
      if (bankLogoFile) {
        logoUrl = URL.createObjectURL(bankLogoFile)
      }

      const docRef = await addDoc(collection(db, "bank_statements"), {
        bankName,
        bankLogoText,
        bankLogoUrl: logoUrl,
        holderName,
        accNumber,
        stmtPeriod,
        balance,
        accType,
        certId,
        createdAt: serverTimestamp()
      })
      const liveLink = `${baseUrl}?id=${docRef.id}`
      setGeneratedUrl(liveLink)
      setGenerated(true)
    } catch (error) {
      console.error("Firestore error:", error)
    } finally {
      setLoading(false)
    }
  }

  const nav = [['grid','Dashboard'],['file','Direct PDF QR'],['bank','Bank Statement'],['history','History / Records'],['settings','Settings']] as [IconName,string][]

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><i/><i/><i/></span><span>Eduaimers<b>QR Suite</b></span></div>
        <nav>{nav.map(([icon,label], i) => <button key={label} className={i === (mode === 'direct' ? 1 : 2) ? 'active' : ''} onClick={() => { if(i === 1) setMode('direct'); if(i === 2) setMode('bank') }}><Icon name={icon}/><span>{label}</span>{i===1 && <Icon name="arrow" size={14}/>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="quota"><div><span>Monthly usage</span><b>68%</b></div><i><em/></i><small>680 of 1,000 documents</small></div><div className="support"><span>Need help?</span><button>Contact support</button></div></div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div className="crumb"><span>Workspace</span><b>/</b><strong>{mode === 'direct' ? 'Direct PDF QR' : 'Custom Bank Statement'}</strong></div>
          <div className="top-actions"><label className="search"><Icon name="search"/><input placeholder="Search records..."/><kbd>⌘ K</kbd></label><button className="icon-btn"><Icon name="bell"/><i/></button><div className="profile"><span>MA</span><div><b>Mostak Ahmed</b><small>Administrator</small></div><Icon name="arrow" size={14}/></div></div>
        </header>
        <main className="content">
          <div className="title-row"><div><p>DOCUMENT ENGINE</p><h1>Generate secure document QR</h1><span>Upload your document to generate instant view QR link.</span></div></div>
          <div className="tabs">
            <button className={mode==='direct'?'active':''} onClick={() => { setMode('direct'); setGenerated(false); }}><Icon name="file"/>Direct PDF upload</button>
            <button className={mode==='bank'?'active':''} onClick={() => { setMode('bank'); setGenerated(false); }}><Icon name="bank"/>Custom bank statement</button>
          </div>

          {mode === 'direct' ? (
            <div className="grid-layout">
              <section className="panel form-panel">
                <div className="panel-head"><span className="step">01</span><div><h2>Upload Trade License / Document</h2><p>Scanning QR will directly open your uploaded file soft copy instantly.</p></div></div>
                <UploadBox title={fileName || 'Drop your Trade License PDF/Image here'} hint={fileName ? 'Ready to generate QR code' : 'or click to browse · up to 25MB'} onFile={handleFileUpload}/>
                <button className="primary wide" disabled={loading || !activeFileBase64} onClick={handleDirectUploadProcess}><span>{generated ? <Icon name="check"/> : <Icon name="grid"/>}</span>{loading ? 'Processing...' : generated ? 'QR code generated' : 'Generate QR code'}</button>
              </section>
              <aside className="panel preview-panel">
                <div className="panel-head small"><div><h2>QR code preview</h2><p>Updates after generation</p></div><span className={generated?'status live':'status'}>{generated?'Live':'Preview'}</span></div>
                <div className="qr-stage" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <QRCode value={generatedUrl} canvasRef={qrCanvasRef}/>
                  <span style={{ marginTop: '10px' }}>Scan to view original document copy</span>
                </div>
                <div className="url-block"><label>Unique document URL</label><div><span style={{ fontSize: '12px', wordBreak: 'break-all' }}>{generatedUrl}</span><button onClick={() => {navigator.clipboard?.writeText(generatedUrl);setCopied(true)}}><Icon name={copied?'check':'copy'} size={16}/>{copied?'Copied':'Copy'}</button></div></div>
                <div className="download-row">
                  <button onClick={downloadPNG}><Icon name="download"/> PNG</button>
                  <button onClick={downloadSVG}><Icon name="download"/> SVG</button>
                </div>
              </aside>
            </div>
          ) : (
            <div className="bank-builder">
              <section className="panel builder-form">
                <div className="panel-head"><span className="step">01</span><div><h2>Custom bank statement template options</h2><p>Configure bank name, upload bank logo image and statement details.</p></div></div>
                <div className="fields">
                  <label><span>Bank Name</span><input value={bankName} onChange={e => setBankName(e.target.value)}/></label>
                  <label><span>Bank Logo Image Upload</span>
                    <input type="file" accept="image/*" onChange={e => {
                      if(e.target.files?.[0]) {
                        setBankLogoFile(e.target.files[0])
                        setBankLogoUrl(URL.createObjectURL(e.target.files[0]))
                      }
                    }} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%' }}/>
                  </label>
                  <label><span>Account holder name</span><input value={holderName} onChange={e => setHolderName(e.target.value)}/></label>
                  <label><span>Account number</span><input value={accNumber} onChange={e => setAccNumber(e.target.value)}/></label>
                  <label><span>Statement period / Date</span><input value={stmtPeriod} onChange={e => setStmtPeriod(e.target.value)}/></label>
                  <label><span>Balance (BDT)</span><input value={balance} onChange={e => setBalance(e.target.value)}/></label>
                  <label><span>Account type</span><input value={accType} onChange={e => setAccType(e.target.value)}/></label>
                  <label><span>Certificate ID</span><input value={certId} onChange={e => setCertId(e.target.value)}/></label>
                </div>
                <button className="primary wide" disabled={loading} onClick={handleBankStatementProcess}><span><Icon name={generated?'check':'grid'}/></span>{loading ? 'Processing...' : generated?'Statement generated successfully':'Process & generate custom statement with QR'}</button>
              </section>
              <aside className="panel document-preview">
                <div className="panel-head small"><div><h2>Statement preview</h2><p>Real-time document preview</p></div><span className="status live">Live</span></div>
                <div className="mini-doc">
                  <div className="mini-brand">
                    {bankLogoUrl ? <img src={bankLogoUrl} alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }}/> : <div className="bank-seal">{bankLogoText}</div>}
                    <div><b>{bankName}</b><span>Digital Statement</span></div>
                    <QRCode value={generatedUrl} canvasRef={qrCanvasRef}/>
                  </div>
                  <h3>ACCOUNT STATEMENT</h3>
                  <div className="mini-details"><span>Account holder<b>{holderName}</b></span><span>Statement period<b>{stmtPeriod}</b></span></div>
                  <div className="mini-balance"><span>Closing balance</span><b>{balance}</b></div>
                  <div className="mini-lines"><i/><i/><i/><i/></div>
                  <small>Digitally generated statement · Certificate ID {certId}</small>
                </div>
              </aside>
            </div>
          )}
        </main>
      </section>
    </div>
  )
}