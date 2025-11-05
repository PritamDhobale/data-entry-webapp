import { AlertTriangle, Clock } from "lucide-react"
import { useEffect, useState } from "react"
// import { supabase } from "@/lib/supabaseClient"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation";

interface AlertItem {
  id: string | number;        // agreement_id
  clientId: string | number;  // ✅ add this
  client: string;
  expiryDate: string;
  daysRemaining: number;
}

export function DashboardAlerts() {

  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
  const fetchExpiryAlerts = async () => {
    try {
      const response = await fetch("/api/dashboard/alerts");
      const data = await response.json();

      const today = new Date();

      // const alertsData = data.map((agreement: any) => {
      //   const end = new Date(agreement.end_date);
      //   const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      //   return {
      //     id: agreement.agreement_id || Math.random(),
      //     client: agreement.practice_name || "Unknown Client",
      //     expiryDate: agreement.end_date,
      //     daysRemaining,
      //   };
      // });
      const alertsData = data.map((agreement: any) => {
        const end = new Date(agreement.end_date);
        const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: agreement.agreement_id || Math.random(),
          clientId: agreement.client_id,   // ✅ add this
          client: agreement.practice_name || "Unknown Client",
          expiryDate: agreement.end_date,
          daysRemaining,
        };
      });
      setAlerts(
  alertsData.sort((a: AlertItem, b: AlertItem) => a.daysRemaining - b.daysRemaining)
);

    } catch (err) {
      console.error("Failed to fetch expiry alerts:", err);
    }
  };

  fetchExpiryAlerts();
}, []);

  
  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="text-center py-6 text-gray-500">No contract expiry alerts at this time</div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => router.push(`/clients/${alert.clientId}`)}  // 👈 navigate to client details
              className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md cursor-pointer hover:bg-amber-100 transition"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                <div>
                  <h4 className="font-medium">{alert.client}</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Expires: {new Date(alert.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Badge
                variant={
                  alert.daysRemaining <= 2
                    ? "destructive"
                    : alert.daysRemaining <= 10
                    ? "outline"
                    : "secondary"
                }
              >
                {alert.daysRemaining} days remaining
              </Badge>
            </div>

            // <div
            //   key={alert.id}
            //   className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md"
            // >
            //   <div className="flex items-center">
            //     <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
            //     <div>
            //       <h4 className="font-medium">{alert.client}</h4>
            //       <div className="flex items-center text-sm text-gray-600">
            //         <Clock className="h-3 w-3 mr-1" />
            //         <span>Expires: {new Date(alert.expiryDate).toLocaleDateString()}</span>
            //       </div>
            //     </div>
            //   </div>
            //   <Badge
            //     variant={alert.daysRemaining <= 2 ? "destructive" : alert.daysRemaining <= 10 ? "outline" : "secondary"}
            //   >
            //     {alert.daysRemaining} days remaining
            //   </Badge>
            // </div>
          ))}
        </div>
      )}
    </div>
  )
}
