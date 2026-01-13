"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Ticket, Loader2 } from "lucide-react"

const TICKET_CATEGORIES = [
  'payment',
  'pass_access',
  'event_registration',
  'team',
  'event_query',
  'technical',
  'other'
]


interface TicketType {
  id: string
  category: string
  description: string
  status: string
  created_at: string
}

export default function HelpPage() {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTicket, setNewTicket] = useState({ category: "", description: "" })

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
      } else {
        console.error("Failed to fetch tickets")
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicket.category || !newTicket.description) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: newTicket.category, 
          description: newTicket.description,
        }),
      })

      if (response.ok) {
        await fetchTickets() // Refresh list
        setNewTicket({ category: "", description: "" })
        setIsDialogOpen(false)
        console.log("Ticket created successfully")
      } else {
        const errorData = await response.json()
        console.error("Failed to create ticket:", errorData.error)
      }
    } catch (error) {
      console.error("Error creating ticket:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 relative z-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold font-['Michroma'] text-white mb-2 tracking-wide">
            HELP CENTER
          </h1>
          <p className="text-gray-400">
            Need assistance? Raise a ticket or view your existing requests.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7D0D2C] hover:bg-[#600a22] text-white font-medium shadow-[0_0_15px_rgba(125,13,44,0.5)]">
              <Plus className="mr-2 h-4 w-4" /> Raise Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-black/90 border-gray-800 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="font-['Michroma']">Create Support Ticket</DialogTitle>
              <DialogDescription className="text-gray-400">
                Describe your issue below. We&apos;ll get back to you as soon as possible.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-gray-300">Category</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-white focus:ring-[#7D0D2C]">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    {TICKET_CATEGORIES.map((category) => (
                      <SelectItem 
                        key={category} 
                        value={category}
                      >
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="bg-gray-900 border-gray-700 text-white focus:border-[#7D0D2C] min-h-[100px]"
                  placeholder="Detailed explanation..."
                  required
                />
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-[#7D0D2C] hover:bg-[#600a22] w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Tickets Section */}
      <Card className="bg-black/40 border-gray-800 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-['Michroma'] text-xl">
            <Ticket className="h-5 w-5 text-[#7D0D2C]" />
            My Tickets
          </CardTitle>
          <CardDescription className="text-gray-400">
            View and track the status of your support requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Ticket ID</TableHead>
                <TableHead className="text-gray-400">Category</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400 text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                   <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading tickets...
                      </div>
                   </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No tickets found. Raise a new ticket to get help.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="border-gray-800 hover:bg-white/5 transition-colors group">
                    <TableCell className="font-medium text-[#7D0D2C] group-hover:text-[#9e1037] transition-colors">
                      {ticket.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-white group-hover:text-gray-100">
                      <div>
                        <div>{ticket.category}</div>
                        <div className="text-xs text-gray-500 md:hidden mt-1">{ticket.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        ticket.status === 'Open' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        ticket.status === 'Closed' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}>
                        {ticket.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-gray-400">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
         <Card className="bg-[#7D0D2C]/10 border-[#7D0D2C]/20 hover:bg-[#7D0D2C]/20 transition-all cursor-pointer">
            <CardHeader>
                <CardTitle className="text-[#a31139] text-lg">General Inquiries</CardTitle>
                <CardDescription>For general questions about the fest, events, or schedule.</CardDescription>
            </CardHeader>
         </Card>
         <Card className="bg-blue-900/10 border-blue-500/20 hover:bg-blue-900/20 transition-all cursor-pointer">
            <CardHeader>
                <CardTitle className="text-blue-300 text-lg">Technical Support</CardTitle>
                <CardDescription>Issues with the website, login, or registration process.</CardDescription>
            </CardHeader>
         </Card>
      </div>
    </div>
  )
}
