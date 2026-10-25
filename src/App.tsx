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

// Verification Component - Renders either Trade License or Bank Statement Templates
function Verification({ docId }: { docId: string }) {
  const [docData, setDocData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDoc() {
      if (!docId) return
      try {
        let docRef = doc(db, "bank_statements", docId)
        let docSnap = await getDoc(docRef)
        
        if (!docSnap.exists()) {
          docRef = doc(db, "documents", docId)
          docSnap = await getDoc(docRef)
        }

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
  }, [docId])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '18px', color: '#64748b', fontWeight: 600 }}>Loading verified document...</p>
      </div>
    )
  }

  if (!docData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '18px', color: '#ef4444', fontWeight: 600 }}>Document not found or invalid link.</p>
      </div>
    )
  }

  // Direct Document Soft Copy View
  if (docData.type === "direct_pdf") {
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

  // BANK STATEMENT TEMPLATE VIEW
  const themeColor = docData.themeColor || '#006a4e'

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif', paddingBottom: '40px' }}>
      {/* Dynamic Bank Header Bar */}
      <header style={{ background: themeColor, color: '#fff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {docData.bankLogoUrl ? (
            <img src={docData.bankLogoUrl} alt="Bank Logo" style={{ width: '36px', height: '36px', objectFit: 'contain', background: '#fff', borderRadius: '4px', padding: '2px' }} />
          ) : (
            <div style={{ background: '#fff', color: themeColor, fontWeight: 'bold', width: '36px', height: '36px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              {docData.bankLogoText || 'BANK'}
            </div>
          )}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{docData.bankName || 'PUBALI BANK PLC.'}</h2>[cite: 12, 13]
            <span style={{ fontSize: '11px', opacity: 0.9 }}>Document Verifier</span>[cite: 12]
          </div>
        </div>
        <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          Visit Website
        </button>
      </header>

      {/* Main Body */}
      <main style={{ maxWidth: '640px', margin: '30px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="check" size={16}/> Valid Statement[cite: 12, 13]
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', margin: '0 0 20px 0' }}>
          The following details are confirmed and digitally generated by {docData.bankName || 'Pubali Bank PLC.'}[cite: 12, 13]
        </p>

        {/* TEMPLATE TYPE 1: TO WHOM IT MAY CONCERN */}
        {docData.templateType === 'certificate' ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ textDecoration: 'underline', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', margin: '0 0 20px 0', color: '#0f172a' }}>
              TO WHOM IT MAY CONCERN[cite: 12]
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '11px', color: '#64748b', marginBottom: '20px' }}>
              <div>
                <span>ACCOUNT HOLDER NAME:</span>[cite: 12]<br/>
                <b style={{ fontSize: '13px', color: '#0f172a' }}>{docData.holderName}</b>[cite: 12]
              </div>
              <div style={{ textAlign: 'right' }}>
                <span>DATE:</span>[cite: 12]<br/>
                <b style={{ fontSize: '13px', color: '#0f172a' }}>{docData.stmtPeriod}</b>[cite: 12]
              </div>
              <div>
                <span>CERTIFICATE ID:</span>[cite: 12]<br/>
                <b style={{ fontSize: '13px', color: '#0f172a' }}>{docData.certId}</b>[cite: 12]
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#334155' }}>
                    <th style={{ padding: '8px' }}>SL#[cite: 12]</th>
                    <th style={{ padding: '8px' }}>A/C NUMBER[cite: 12]</th>
                    <th style={{ padding: '8px' }}>OPEN DATE[cite: 12]</th>
                    <th style={{ padding: '8px' }}>A/C TYPE[cite: 12]</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>BALANCE (BDT)[cite: 12]</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>BALANCE (USD)[cite: 12]</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 8px' }}>1[cite: 12]</td>
                    <td style={{ padding: '10px 8px' }}>{docData.accNumber}[cite: 12]</td>
                    <td style={{ padding: '10px 8px' }}>{docData.openDate || '25-Jun-2019'}</td>[cite: 12]
                    <td style={{ padding: '10px 8px' }}>{docData.accType}[cite: 12]</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold' }}>{docData.balanceBdt}</td>[cite: 12]
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold' }}>{docData.balanceUsd}</td>[cite: 12]
                  </tr>
                  <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                    <td colSpan={4} style={{ padding: '10px 8px', textAlign: 'right' }}>Total[cite: 12]</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: themeColor }}>{docData.balanceBdt}</td>[cite: 12]
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: themeColor }}>{docData.balanceUsd}</td>[cite: 12]
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TEMPLATE TYPE 2: STATEMENT SUMMARY */
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', margin: '0 0 20px 0', color: '#0f172a' }}>
              Statement Summary[cite: 13]
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>ACCOUNT NO:</span>[cite: 13]<br/>
                <b style={{ fontSize: '15px', color: '#0f172a' }}>{docData.accNumber}</b>[cite: 13]
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>ACCOUNT TYPE:</span>[cite: 13]<br/>
                <b style={{ fontSize: '14px', color: '#0f172a' }}>{docData.accType}</b>[cite: 13]
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>ACCOUNT NAME:</span>[cite: 13]<br/>
                <b style={{ fontSize: '14px', color: '#0f172a' }}>{docData.holderName} (OWNER NAME: {docData.ownerName || docData.holderName})</b>[cite: 13]
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>OPENING BALANCE:</span>[cite: 13]<br/>
                <b style={{ fontSize: '14px', color: themeColor }}>{docData.openingBalance}</b>[cite: 13]
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>CLOSING BALANCE:</span>[cite: 13]<br/>
                <b style={{ fontSize: '14px', color: themeColor }}>{docData.closingBalance}</b>[cite: 13]
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>STATEMENT PERIOD:</span>[cite: 13]<br/>
                <b style={{ fontSize: '13px', color: '#0f172a' }}>{docData.stmtPeriod}</b>[cite: 13]
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>CERTIFICATE ID:</span>[cite: 13]<br/>
                <b style={{ fontSize: '13px', color: '#0f172a' }}>{docData.certId}</b>[cite: 13]
              </div>

              <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textAlign: 'center' }}>
                STATEMENT GENERATED DATE: {docData.generatedDate || '9/22/2026 12:59:42 PM'}[cite: 13]
              </div>
            </div>
          </div>
        )}

        {/* Footer Contact Details */}
        <footer style={{ marginTop: '25px', textAlign: 'center', fontSize: '11px', color: '#64748b', lineHeight: '1.6' }}>
          {docData.helpline && <div>Helpline: {docData.helpline}</div>}[cite: 12]
          {docData.email && <div>Email: {docData.email}</div>}
          {docData.address && <div>Head Office: {docData.address}</div>}[cite: 12]
        </footer>
      </main>
    </div>
  )
}

export default function App() {
  const [mode, setMode] = useState<'direct' | 'bank'>('direct')
  const [page, setPage] = useState<'app' | 'verify'>('app')
  const [verifyId, setVerifyId] = useState('')
  const [fileName, setFileName] = useState('')
  const [activeFileBase64, setActiveFileBase64] = useState('')
  
  // Bank Custom Branding States
  const [bankName, setBankName] = useState('PUBALI BANK PLC.')
  const [bankLogoText, setBankLogoText] = useState('PB')
  const [bankLogoUrl, setBankLogoUrl] = useState('')
  const [themeColor, setThemeColor] = useState('#006a4e')
  const [helpline, setHelpline] = useState('+8809660616253, 16253')
  const [email, setEmail] = useState('info@pubalibankbd.com')
  const [address, setAddress] = useState('26, Dilkusha C/A, Dhaka-1000, Bangladesh')

  // Statement Template Switcher
  const [templateType, setTemplateType] = useState<'certificate' | 'summary'>('certificate')

  // Statement Fields
  const [holderName, setHolderName] = useState('MOSTAK AHMED')
  const [ownerName, setOwnerName] = useState('HASHIM MOSTAK AHMAD')
  const [accNumber, setAccNumber] = useState('3720101077850')
  const [accType, setAccType] = useState('SAVINGS BANK ACCOUNT')
  const [stmtPeriod, setStmtPeriod] = useState('22-Sep-2026')
  const [openDate, setOpenDate] = useState('25-Jun-2019')
  const [certId, setCertId] = useState('226047078')
  
  // Amounts
  const [balanceBdt, setBalanceBdt] = useState('৳6,09,671.50')
  const [balanceUsd, setBalanceUsd] = useState('4,936.61')
  const [openingBalance, setOpeningBalance] = useState('৳8,54,117.50')
  const [closingBalance, setClosingBalance] = useState('৳15,15,318.00')
  const [generatedDate, setGeneratedDate] = useState('9/22/2026 12:59:42 PM')

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

  if (page === 'verify') return <Verification docId={verifyId} />

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
    } finally {
      setLoading(false)
    }
  }

  const handleBankStatementProcess = async () => {
    setLoading(true)
    try {
      const docRef = await addDoc(collection(db, "bank_statements"), {
        type: "bank_statement",
        templateType,
        bankName,
        bankLogoText,
        bankLogoUrl,
        themeColor,
        helpline,
        email,
        address,
        holderName,
        ownerName,
        accNumber,
        accType,
        stmtPeriod,
        openDate,
        certId,
        balanceBdt,
        balanceUsd,
        openingBalance,
        closingBalance,
        generatedDate,
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
          <div className="title-row"><div><p>DOCUMENT ENGINE</p><h1>Generate secure document QR</h1><span>Create dynamic, verifiable links for Trade License & Bank Statements.</span></div></div>
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
            <div className="bank-builder" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
              <section className="panel builder-form" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className="panel-head" style={{ marginBottom: '20px' }}>
                  <span className="step">01</span>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Custom Bank Statement Engine</h2>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>Configure Bank Branding & Statement Template Format</p>
                  </div>
                </div>

                {/* Template Selector */}
                <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <label style={{ fontWeight: 700, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Select Statement Template Type:</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => setTemplateType('certificate')}
                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: templateType==='certificate'?'2px solid #2563eb':'1px solid #cbd5e1', background: templateType==='certificate'?'#eff6ff':'#fff', color: templateType==='certificate'?'#2563eb':'#334155', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                    >
                      TO WHOM IT MAY CONCERN (Certificate)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setTemplateType('summary')}
                      style={{ flex: 1, padding: '10px', borderRadius: '6px', border: templateType==='summary'?'2px solid #2563eb':'1px solid #cbd5e1', background: templateType==='summary'?'#eff6ff':'#fff', color: templateType==='summary'?'#2563eb':'#334155', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                    >
                      Statement Summary
                    </button>
                  </div>
                </div>

                {/* Bank Branding Options */}
                <h3 style={{ fontSize: '14px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>1. Bank Branding & Contact Options</h3>
                <div className="fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <label><span>Bank Name</span><input value={bankName} onChange={e => setBankName(e.target.value)}/></label>
                  <label><span>Bank Theme Color (Pad Color)</span><input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} style={{ height: '38px', cursor: 'pointer' }}/></label>
                  <label><span>Bank Logo Text / Initials</span><input value={bankLogoText} onChange={e => setBankLogoText(e.target.value)}/></label>
                  <label><span>Bank Logo Upload (Image)</span>
                    <input type="file" accept="image/*" onChange={e => {
                      if(e.target.files?.[0]) {
                        const r = new FileReader()
                        r.onload = ev => setBankLogoUrl(ev.target?.result as string)
                        r.readAsDataURL(e.target.files[0])
                      }
                    }} style={{ fontSize: '11px' }}/>
                  </label>
                  <label><span>Helpline / Phone</span><input value={helpline} onChange={e => setHelpline(e.target.value)}/></label>
                  <label><span>Bank Email</span><input value={email} onChange={e => setEmail(e.target.value)}/></label>
                  <label style={{ gridColumn: 'span 2' }}><span>Head Office Address</span><input value={address} onChange={e => setAddress(e.target.value)}/></label>
                </div>

                {/* Statement Fields based on Selected Template */}
                <h3 style={{ fontSize: '14px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>2. Statement Information Fields</h3>
                <div className="fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <label><span>Account Holder Name</span><input value={holderName} onChange={e => setHolderName(e.target.value)}/></label>
                  <label><span>Owner Name (for Summary)</span><input value={ownerName} onChange={e => setOwnerName(e.target.value)}/></label>
                  <label><span>Account Number</span><input value={accNumber} onChange={e => setAccNumber(e.target.value)}/></label>
                  <label><span>Account Type</span><input value={accType} onChange={e => setAccType(e.target.value)}/></label>
                  <label><span>Certificate ID</span><input value={certId} onChange={e => setCertId(e.target.value)}/></label>
                  <label><span>Statement Period / Date</span><input value={stmtPeriod} onChange={e => setStmtPeriod(e.target.value)}/></label>

                  {templateType === 'certificate' ? (
                    <>
                      <label><span>Account Open Date</span><input value={openDate} onChange={e => setOpenDate(e.target.value)}/></label>
                      <label><span>Balance (BDT)</span><input value={balanceBdt} onChange={e => setBalanceBdt(e.target.value)}/></label>
                      <label><span>Balance (USD)</span><input value={balanceUsd} onChange={e => setBalanceUsd(e.target.value)}/></label>
                    </>
                  ) : (
                    <>
                      <label><span>Opening Balance</span><input value={openingBalance} onChange={e => setOpeningBalance(e.target.value)}/></label>
                      <label><span>Closing Balance</span><input value={closingBalance} onChange={e => setClosingBalance(e.target.value)}/></label>
                      <label style={{ gridColumn: 'span 2' }}><span>Statement Generated Date/Time</span><input value={generatedDate} onChange={e => setGeneratedDate(e.target.value)}/></label>
                    </>
                  )}
                </div>

                <button className="primary wide" disabled={loading} onClick={handleBankStatementProcess} style={{ background: themeColor }}>
                  <span><Icon name={generated?'check':'grid'}/></span>
                  {loading ? 'Processing...' : generated ? 'Bank Statement Generated' : 'Generate Custom Bank Statement QR'}
                </button>
              </section>

              {/* QR Preview Side Bar */}
              <aside className="panel preview-panel">
                <div className="panel-head small"><div><h2>QR Code Preview</h2><p>Updates after generation</p></div><span className={generated?'status live':'status'}>{generated?'Live':'Preview'}</span></div>
                <div className="qr-stage" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <QRCode value={generatedUrl} canvasRef={qrCanvasRef}/>
                  <span style={{ marginTop: '10px', fontSize: '12px', textAlign: 'center' }}>Scan to view verified bank statement page</span>
                </div>
                <div className="url-block"><label>Unique document URL</label><div><span style={{ fontSize: '12px', wordBreak: 'break-all' }}>{generatedUrl}</span><button onClick={() => {navigator.clipboard?.writeText(generatedUrl);setCopied(true)}}><Icon name={copied?'check':'copy'} size={16}/>{copied?'Copied':'Copy'}</button></div></div>
                <div className="download-row">
                  <button onClick={downloadPNG}><Icon name="download"/> PNG</button>
                  <button onClick={downloadSVG}><Icon name="download"/> SVG</button>
                </div>
              </aside>
            </div>
          )}
        </main>
      </section>
    </div>
  )
}