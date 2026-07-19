import { useState } from 'react'
import BillFetcher from './BillFetcher'
import BillSplitter from './BillSplitter'

function App() {
  const [billData, setBillData] = useState(null)

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {!billData ? (
        <BillFetcher onBillFetched={setBillData} />
      ) : (
        <div className="space-y-6">
          <BillSplitter data={billData} />
        </div>
      )}
    </div>
  )
}

export default App
