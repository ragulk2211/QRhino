import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import "../styles/admin.css"
import "../styles/QRCodeGenerator.css"

function QRGenerator() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedId = searchParams.get("restaurantId")

  const [restaurants, setRestaurants] = useState([])
  const [selectedId, setSelectedId] = useState(preselectedId || "")
  const [qrSrc, setQrSrc] = useState(null)
  const [menuUrl, setMenuUrl] = useState("")

  useEffect(() => {
    fetch("http://localhost:5000/api/restaurants")
      .then(r => r.json())
      .then(data => {
        setRestaurants(data)
        if (!selectedId && data.length > 0) {
          setSelectedId(data[0]._id)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (preselectedId) {
      setSelectedId(preselectedId)
    }
  }, [preselectedId])

  function generateQR() {
    const url = `${window.location.origin}/menu?restaurantId=${selectedId}`
    setMenuUrl(url)
    const encoded = encodeURIComponent(url)
    setQrSrc(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encoded}`)
  }

  function downloadQR() {
    const link = document.createElement("a")
    link.href = qrSrc
    link.download = "menu-qr.png"
    link.click()
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>📱 Generate QR Code</h1>
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="admin-form">
        <div className="form-group">
          <label>Select Restaurant</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            {restaurants.map(r => (
              <option key={r._id} value={r._id}>{r.name} — {r.location}</option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button className="btn-submit" onClick={generateQR} disabled={!selectedId}>Generate QR</button>
        </div>
      </div>

      {qrSrc && (
        <div className="qr-container">
          <p>Scan this QR code to open the menu:</p>
          <p className="qr-url">{menuUrl}</p>
          <img src={qrSrc} alt="QR Code" className="qr-image" />
          <br />
          <button className="btn-submit" onClick={downloadQR}>⬇ Download QR</button>
        </div>
      )}
    </div>
  )
}

export default QRGenerator
