"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Table, KeyRound, Hash, Calendar, DollarSign, FileText, User, Mail, Phone } from "lucide-react"

interface SchemaTable {
  name: string
  description: string
  fields: {
    name: string
    type: string
    description: string
    icon: React.ReactNode
  }[]
}

export function SchemaReference() {
  const [activeTab, setActiveTab] = useState("clients")

  const tables: Record<string, SchemaTable> = {
    clients: {
      name: "Clients",
      description: "Stores information about healthcare practices and organizations.",
      fields: [
        {
          name: "id",
          type: "string",
          description: "Unique identifier for the client (e.g., CL001)",
          icon: <Hash className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "practiceName",
          type: "string",
          description: "Name of the healthcare practice",
          icon: <FileText className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "primaryContact",
          type: "string",
          description: "Name of the primary contact person",
          icon: <User className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "email",
          type: "string",
          description: "Primary contact email address",
          icon: <Mail className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "phone",
          type: "string",
          description: "Primary contact phone number",
          icon: <Phone className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "status",
          type: "enum",
          description: "Client status (active or inactive)",
          icon: <KeyRound className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "createdAt",
          type: "date",
          description: "Date when the client was added",
          icon: <Calendar className="h-4 w-4 text-gray-500" />,
        },
      ],
    },
    agreements: {
      name: "Agreements",
      description: "Stores contract information between clients and Sage Healthy.",
      fields: [
        {
          name: "id",
          type: "string",
          description: "Unique identifier for the agreement (e.g., AG001)",
          icon: <Hash className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "clientId",
          type: "string",
          description: "Reference to the client",
          icon: <KeyRound className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "agreementDate",
          type: "date",
          description: "Date when the agreement was signed",
          icon: <Calendar className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "commencementDate",
          type: "date",
          description: "Date when services begin",
          icon: <Calendar className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "term",
          type: "string",
          description: "Duration of the agreement (e.g., 1 year)",
          icon: <FileText className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "endDate",
          type: "date",
          description: "Date when the agreement expires",
          icon: <Calendar className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "status",
          type: "enum",
          description: "Agreement status (active, expiring-soon, expired)",
          icon: <KeyRound className="h-4 w-4 text-gray-500" />,
        },
      ],
    },
    services: {
      name: "Services",
      description: "Stores information about services provided to clients.",
      fields: [
        {
          name: "id",
          type: "string",
          description: "Unique identifier for the service (e.g., SV001)",
          icon: <Hash className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "clientId",
          type: "string",
          description: "Reference to the client",
          icon: <KeyRound className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "serviceName",
          type: "string",
          description: "Name of the service provided",
          icon: <FileText className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "rate",
          type: "string",
          description: "Rate charged for the service",
          icon: <DollarSign className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "minimumCharge",
          type: "string",
          description: "Minimum charge for the service",
          icon: <DollarSign className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "nppStatus",
          type: "boolean",
          description: "NPP (Notice of Privacy Practices) status",
          icon: <KeyRound className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "notes",
          type: "string",
          description: "Additional notes about the service",
          icon: <FileText className="h-4 w-4 text-gray-500" />,
        },
      ],
    },
    financial: {
      name: "Financial",
      description: "Stores financial transaction data related to clients and services.",
      fields: [
        {
          name: "id",
          type: "string",
          description: "Unique identifier for the transaction",
          icon: <Hash className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "clientId",
          type: "string",
          description: "Reference to the client",
          icon: <KeyRound className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "serviceId",
          type: "string",
          description: "Reference to the service",
          icon: <KeyRound className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "amount",
          type: "number",
          description: "Transaction amount",
          icon: <DollarSign className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "date",
          type: "date",
          description: "Transaction date",
          icon: <Calendar className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "description",
          type: "string",
          description: "Description of the transaction",
          icon: <FileText className="h-4 w-4 text-gray-500" />,
        },
        {
          name: "status",
          type: "enum",
          description: "Transaction status (pending, completed, failed)",
          icon: <KeyRound className="h-4 w-4 text-gray-500" />,
        },
      ],
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Database Schema Reference
        </CardTitle>
        <CardDescription>
          Reference for database tables and fields used in reports. This helps understand the data structure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          {Object.entries(tables).map(([key, table]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="flex items-center">
                <Table className="h-5 w-5 mr-2 text-primary" />
                <h3 className="text-lg font-medium">{table.name} Table</h3>
              </div>
              <p className="text-sm text-gray-500">{table.description}</p>

              <div className="border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Field
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {table.fields.map((field, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                          {field.icon}
                          <span className="ml-2">{field.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{field.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Schema
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
