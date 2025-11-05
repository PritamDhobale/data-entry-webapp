"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, ChevronDown, FileEdit, Trash2, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Sanitize function to handle missing or default values (N/A)
const sanitizeValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "N/A" || value === "") {
    return " ";  // You can return an empty string or another default value
  }
  return String(value); // Convert any value to string
}

// Put this directly below sanitizeValue
const getDBAText = (value: unknown): string => {
  if (value === null || value === undefined) return "N/A";
  const s = String(value).trim();
  return s === "" ? "N/A" : s;
};

const formatPrimaryContact = (
  first?: string,
  last?: string,
  title?: string
): string => {
  const parts: string[] = [];

  if (first && first.trim() && first !== "N/A") parts.push(first.trim());
  if (last && last.trim() && last !== "N/A") parts.push(last.trim());

  let name = parts.join(" ");
  if (title && title.trim() && title !== "N/A") {
    // add comma only if there's a name first
    name = name ? `${name}, ${title.trim()}` : title.trim();
  }

  return name;
};



// Fetch recent clients from Supabase (last 5)
const fetchRecentClients = async () => {
  try {
    const response = await fetch("/api/dashboard/recent-clients");
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching recent clients:", error);
    return [];
  }
};


export function DashboardTable() {
  const router = useRouter()
  const [clients, setClients] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch recent clients on page load
  useEffect(() => {
    const loadClients = async () => {
      const recentClients = await fetchRecentClients()
      setClients(recentClients)
    }
    loadClients()
  }, [])

  // Filter clients based on the search term
  const filteredClients = clients.filter((client) => {
  const search = searchTerm.toLowerCase();

  return (
    sanitizeValue(client.practice_name).toLowerCase().includes(search) ||
    getDBAText(client.dba).toLowerCase().includes(search) ||
    // sanitizeValue(client.primary_contact_first_name).toLowerCase().includes(search) ||
    // sanitizeValue(client.primary_contact_last_name).toLowerCase().includes(search) ||
    // sanitizeValue(client.primary_contact_title).toLowerCase().includes(search) ||
    formatPrimaryContact(
  client.primary_contact_first_name,
  client.primary_contact_last_name,
  client.primary_contact_title
).toLowerCase().includes(search) ||
    sanitizeValue(client.email).toLowerCase().includes(search) ||
    sanitizeValue(client.state).toLowerCase().includes(search) ||
    sanitizeValue(client.UniqueID).toLowerCase().includes(search) ||
    sanitizeValue(client.client_id).toLowerCase().includes(search)
  );
});

  
  const handleRowClick = (clientId: string) => {
      router.push(`/clients/${clientId}`)
  }
  // Handle clicking "View All" button to navigate to clients page
  const handleViewAll = () => {
    router.push("/clients")  // Adjust URL for your clients page
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search clients..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={handleViewAll}
          className="bg-[#112B74] hover:bg-[#0E2463] text-white text-sm font-semibold px-4 py-2 rounded-md shadow-sm transition-all duration-200 flex items-center"
        >
          View All
          <ChevronDown className="ml-2 h-4 w-4 text-[#E9A41A]" />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Practice Name</TableHead>
              <TableHead>DBA</TableHead>
              <TableHead className="hidden md:table-cell">Primary Contact</TableHead>
              {/* <TableHead className="hidden md:table-cell">Email</TableHead> */}
              <TableHead className="hidden md:table-cell">State</TableHead>
              <TableHead>Status</TableHead>
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          {/* <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.client_id}</TableCell>
                <TableCell>{client.practice_name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {`${sanitizeValue(client.primary_contact_first_name)} ${sanitizeValue(client.primary_contact_last_name)}, ${sanitizeValue(client.primary_contact_title)}`}
                </TableCell>
                <TableCell className="hidden md:table-cell">{sanitizeValue(client.email)}</TableCell>
                <TableCell className="hidden md:table-cell">{sanitizeValue(client.state)}</TableCell>
                <TableCell>
                  <Badge variant={client.client_status === "active" ? "default" : "secondary"}>
                    {client.client_status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell> */}
                {/* <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push(`/clients/${client.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/clients/${client.id}/edit`)}>
                        <FileEdit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => alert("Archive client")}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell> */}
              {/* </TableRow>
            ))}
          </TableBody> */}
          <TableBody>
  {filteredClients.map((client) => (
    <TableRow
      key={client.client_id}
      className="cursor-pointer hover:bg-gray-50"
     onClick={(e) => {
                        // Prevent navigation if user is selecting text
                        const selection = window.getSelection();
                        if (!selection || selection.toString().length === 0) {
                          handleRowClick(client.client_id);
                        }
                      }}
    >
      <TableCell className="font-medium">{sanitizeValue(client.UniqueID)}</TableCell>
      <TableCell>{sanitizeValue(client.practice_name)}</TableCell>
      <TableCell>{getDBAText(client.dba)}</TableCell>
      {/* <TableCell className="hidden md:table-cell">
        {`${sanitizeValue(client.primary_contact_first_name)} ${sanitizeValue(client.primary_contact_last_name)}, ${sanitizeValue(client.primary_contact_title)}`}
      </TableCell> */}
      <TableCell className="hidden md:table-cell">
  {formatPrimaryContact(
    client.primary_contact_first_name,
    client.primary_contact_last_name,
    client.primary_contact_title
  )}
</TableCell>


      {/* <TableCell className="hidden md:table-cell">{sanitizeValue(client.email)}</TableCell> */}
      <TableCell className="hidden md:table-cell">{sanitizeValue(client.state)}</TableCell>
      <TableCell>
        <Badge variant={client.client_status === "active" ? "default" : "destructive"}>
  {sanitizeValue(client.client_status)}
</Badge>

      </TableCell>
    </TableRow>
  ))}
</TableBody>

        </Table>
      </div>
    </div>
  )
}
