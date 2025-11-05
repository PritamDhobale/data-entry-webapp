// import { useEffect, useState } from "react"

// export function ClientAgreements({ clientId }: { clientId: string }) {
//   const [agreements, setAgreements] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const fetchAgreements = async () => {
//       try {
//         const res = await fetch(`/api/agreements/get?clientId=${clientId}`, { cache: "no-store" })
//         if (!res.ok) throw new Error("Failed to fetch agreements")
//         const data = await res.json()
//         setAgreements(data)
//       } catch (error) {
//         console.error("Error fetching agreements:", error)
//         setAgreements([])
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (clientId) fetchAgreements()
//   }, [clientId])

//   if (loading) return <p>Loading agreements...</p>

//   if (!agreements.length) return <p className="text-gray-500">No agreements found.</p>

//   return (
//     <div className="space-y-4">
//       {agreements.map((agreement) => (
//         <div key={agreement.id} className="p-4 border rounded">
//           <p><strong>Agreement Date:</strong> {agreement.agreement_date}</p>
//           <p><strong>Commencement Date:</strong> {agreement.commencement_date}</p>
//           {/* Add more fields as needed */}
//         </div>
//       ))}
//     </div>
//   )
// }
