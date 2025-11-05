import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportsGenerator } from "@/components/reports-generator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthGuard } from "@/hooks/useAuthGuard"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <Tabs defaultValue="client">
        <TabsList>
          <TabsTrigger value="client">Client Reports</TabsTrigger>
          {/* <TabsTrigger value="agreement">Agreement Reports</TabsTrigger>
          <TabsTrigger value="service">Service Reports</TabsTrigger>
          <TabsTrigger value="invoice">invoice Reports</TabsTrigger> */}
        </TabsList>

        <TabsContent value="client" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Reports</CardTitle>
              <CardDescription>Generate reports about client information, status, and demographics.</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsGenerator type="client" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="agreement" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Agreement Reports</CardTitle>
              <CardDescription>Generate reports about agreements, terms, and expiration dates.</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsGenerator type="agreement" />
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* <TabsContent value="service" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Reports</CardTitle>
              <CardDescription>Generate reports about services, rates, and NPP status.</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsGenerator type="service" />
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* <TabsContent value="invoice" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoicing Reports</CardTitle>
              <CardDescription>Generate reports about billing, revenue, and financial metrics.</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsGenerator type="invoice" />
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
    </div>
  )
}
