"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Sample order data
const ORDERS = [
  {
    id: "ORD-12345",
    date: "2023-12-15",
    status: "Delivered",
    total: 129.99,
    items: [
      { id: 1, name: "Product 1", price: 49.99, quantity: 1, image: "/placeholder.svg?height=80&width=80&text=P1" },
      { id: 2, name: "Product 2", price: 79.99, quantity: 1, image: "/placeholder.svg?height=80&width=80&text=P2" },
    ],
  },
  {
    id: "ORD-67890",
    date: "2023-12-10",
    status: "Processing",
    total: 59.99,
    items: [
      { id: 3, name: "Product 3", price: 59.99, quantity: 1, image: "/placeholder.svg?height=80&width=80&text=P3" },
    ],
  },
  {
    id: "ORD-54321",
    date: "2023-11-28",
    status: "Cancelled",
    total: 89.99,
    items: [
      { id: 4, name: "Product 4", price: 89.99, quantity: 1, image: "/placeholder.svg?height=80&width=80&text=P4" },
    ],
  },
]

export default function OrdersPage() {
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const toggleOrderDetails = (orderId: string) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null)
    } else {
      setSelectedOrder(orderId)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800"
      case "Processing":
        return "bg-blue-100 text-blue-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="h-4 w-4" />
      case "Processing":
        return <Clock className="h-4 w-4" />
      case "Cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          onClick={() => router.push("/shop")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>

        <h1 className="text-2xl font-bold mb-8">Your Orders</h1>

        {ORDERS.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => router.push("/shop")}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {ORDERS.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">{order.id}</h2>
                      <p className="text-sm text-gray-500">Ordered on {new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center mt-2 sm:mt-0">
                      <Badge className={`flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="ml-2" onClick={() => toggleOrderDetails(order.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        {selectedOrder === order.id ? "Hide Details" : "View Details"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        Total: <span className="font-semibold">${order.total.toFixed(2)}</span>
                      </p>
                      <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                    </div>

                    {order.status === "Delivered" && (
                      <Button variant="outline" size="sm" onClick={() => alert("Feature not implemented yet")}>
                        Buy Again
                      </Button>
                    )}
                  </div>

                  {selectedOrder === order.id && (
                    <div className="mt-6">
                      <Separator className="mb-4" />
                      <h3 className="font-medium mb-3">Order Items</h3>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center">
                            <div className="flex-shrink-0 relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-contain p-2"
                              />
                            </div>
                            <div className="ml-4 flex-grow">
                              <Link href={`/shop/${item.id}`} className="font-medium hover:text-indigo-600">
                                {item.name}
                              </Link>
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            </div>
                            <div className="ml-2 text-right">
                              <p className="font-medium">${item.price.toFixed(2)}</p>
                              {order.status === "Delivered" && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-indigo-600"
                                  onClick={() => alert("Feature not implemented yet")}
                                >
                                  Write a review
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 space-y-2">
                        <h3 className="font-medium">Shipping Address</h3>
                        <p className="text-sm text-gray-600">
                          John Doe
                          <br />
                          123 Main Street
                          <br />
                          New York, NY 10001
                          <br />
                          United States
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

