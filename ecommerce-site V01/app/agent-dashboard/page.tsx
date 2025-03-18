"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Store,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Upload,
  Trash2,
  Edit,
  Search,
  Filter,
  ArrowUpDown,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import {
  getAgentProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAgentSalesAnalytics,
  getAgentOrders,
  signOut,
  type Product,
} from "@/lib/supabase"

export default function AgentDashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [salesData, setSalesData] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])

  // New product form state
  const [newProductName, setNewProductName] = useState("")
  const [newProductDescription, setNewProductDescription] = useState("")
  const [newProductPrice, setNewProductPrice] = useState("")
  const [newProductStock, setNewProductStock] = useState("")
  const [newProductCategory, setNewProductCategory] = useState("Clothing")
  const [newProductStatus, setNewProductStatus] = useState("Published")

  const router = useRouter()
  const { user } = useAuth()

  // Check if user is logged in as agent
  useEffect(() => {
    if (!user) {
      const userType = localStorage.getItem("userType")
      if (userType !== "agent") {
        router.push("/login")
      }
    } else if (user.role !== "agent") {
      router.push("/login")
    }
  }, [router, user])

  // Fetch agent products from Supabase
  useEffect(() => {
    async function fetchAgentData() {
      if (!user) return

      try {
        setIsLoading(true)

        // Fetch products
        const productsData = await getAgentProducts(user.id)
        setProducts(productsData)

        // Fetch sales analytics
        const salesAnalytics = await getAgentSalesAnalytics(user.id)
        setSalesData(salesAnalytics)

        // Fetch orders
        const ordersData = await getAgentOrders(user.id)
        setOrders(ordersData)
      } catch (error) {
        console.error("Error fetching agent data:", error)
        toast({
          title: "Error",
          description: "Failed to load agent data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgentData()
  }, [user])

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const matchesCategory = categoryFilter === "All" || product.category === categoryFilter

      // Status filter
      const matchesStatus = statusFilter === "All" || product.status === statusFilter

      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      // Sort products
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortBy === "priceHigh") {
        return b.price - a.price
      } else if (sortBy === "priceLow") {
        return a.price - b.price
      } else if (sortBy === "bestSelling") {
        return (b.sales || 0) - (a.sales || 0)
      }
      return 0
    })

  // Handle add product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add products.",
        variant: "destructive",
      })
      return
    }

    try {
      const newProduct = {
        name: newProductName,
        description: newProductDescription,
        price: Number.parseFloat(newProductPrice),
        stock: Number.parseInt(newProductStock),
        category: newProductCategory,
        status: newProductStatus as "Published" | "Draft",
        image_url: `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(newProductName)}`,
        agent_id: user.id,
        sales: 0,
        revenue: 0,
      }

      const createdProduct = await createProduct(newProduct)
      setProducts([createdProduct, ...products])

      // Reset form
      setNewProductName("")
      setNewProductDescription("")
      setNewProductPrice("")
      setNewProductStock("")
      setNewProductCategory("Clothing")
      setNewProductStatus("Published")

      setIsAddProductOpen(false)

      toast({
        title: "Product Added",
        description: "Your product has been added successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle edit product
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentProduct) return

    try {
      const updatedProduct = {
        name: newProductName,
        description: newProductDescription,
        price: Number.parseFloat(newProductPrice),
        stock: Number.parseInt(newProductStock),
        category: newProductCategory,
        status: newProductStatus as "Published" | "Draft",
      }

      const result = await updateProduct(currentProduct.id, updatedProduct)

      setProducts(
        products.map((product) => {
          if (product.id === currentProduct.id) {
            return { ...product, ...updatedProduct }
          }
          return product
        }),
      )

      setIsEditProductOpen(false)

      toast({
        title: "Product Updated",
        description: "Your product has been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle delete product
  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProduct(id)
      setProducts(products.filter((product) => product.id !== id))

      toast({
        title: "Product Deleted",
        description: "Your product has been deleted successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Open edit product dialog
  const openEditDialog = (product: Product) => {
    setCurrentProduct(product)
    setNewProductName(product.name)
    setNewProductDescription(product.description)
    setNewProductPrice(product.price.toString())
    setNewProductStock(product.stock.toString())
    setNewProductCategory(product.category)
    setNewProductStatus(product.status)
    setIsEditProductOpen(true)
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut()
      localStorage.removeItem("userType")
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark-agent dark:bg-gradient-dark-6 animated-gradient">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-black/50 dark:bg-black/60 backdrop-blur-md">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <h1 className="text-xl font-bold text-gradient-agent font-serif">LuxeMarket Agent</h1>
            </div>
            <div className="flex flex-col flex-1 px-3 space-y-1">
              <Button
                variant="ghost"
                className="justify-start text-white hover:bg-orange-900/30 hover:text-orange-300 dark:hover:bg-orange-950/50 dark:hover:text-orange-200"
              >
                <Store className="mr-2 h-5 w-5" />
                Products
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-white hover:bg-orange-900/30 hover:text-orange-300 dark:hover:bg-orange-950/50 dark:hover:text-orange-200"
              >
                <Package className="mr-2 h-5 w-5" />
                Orders
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-white hover:bg-orange-900/30 hover:text-orange-300 dark:hover:bg-orange-950/50 dark:hover:text-orange-200"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Analytics
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-white hover:bg-orange-900/30 hover:text-orange-300 dark:hover:bg-orange-950/50 dark:hover:text-orange-200"
              >
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Button>
              <div className="flex-1"></div>
              <div className="mb-2">
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                className="justify-start text-red-400 hover:bg-red-900/30 hover:text-red-300 mt-auto mb-6 dark:hover:bg-red-950/50 dark:hover:text-red-200"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-black/50 dark:bg-black/60 backdrop-blur-md border-b border-orange-900/30 dark:border-orange-950/30">
            <div className="flex items-center md:hidden">
              <h1 className="text-xl font-bold text-gradient-agent font-serif">LuxeMarket Agent</h1>
            </div>
            <div className="flex items-center ml-auto">
              <ThemeToggle />
              <Button variant="ghost" className="text-white hover:bg-orange-900/30 hover:text-orange-300 md:hidden">
                <Store className="h-5 w-5" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-orange-900/30 hover:text-orange-300 md:hidden">
                <Package className="h-5 w-5" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-orange-900/30 hover:text-orange-300 md:hidden">
                <BarChart3 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-orange-900/30 hover:text-orange-300 md:hidden">
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                className="text-red-400 hover:bg-red-900/30 hover:text-red-300 md:hidden"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Dashboard content */}
          <main className="flex-1 p-6">
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-black/30 dark:bg-black/40">
                <TabsTrigger
                  value="products"
                  className="text-white data-[state=active]:bg-orange-900/50 data-[state=active]:text-white dark:data-[state=active]:bg-orange-950/50"
                >
                  Products
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="text-white data-[state=active]:bg-orange-900/50 data-[state=active]:text-white dark:data-[state=active]:bg-orange-950/50"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="text-white data-[state=active]:bg-orange-900/50 data-[state=active]:text-white dark:data-[state=active]:bg-orange-950/50"
                >
                  Orders
                </TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-white font-serif">Your Products</h2>
                  <Button className="btn-gradient-agent text-white" onClick={() => setIsAddProductOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Product
                  </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10 bg-black/30 dark:bg-black/40 border-orange-900/30 dark:border-orange-950/30 text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Filter className="text-gray-400 h-4 w-4" />
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="bg-black/30 dark:bg-black/40 border-orange-900/30 dark:border-orange-950/30 text-white">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 dark:bg-black/95 border-orange-900/30 dark:border-orange-950/30 text-white">
                        <SelectItem value="All">All Categories</SelectItem>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                        <SelectItem value="Home Decor">Home Decor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Filter className="text-gray-400 h-4 w-4" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-black/30 dark:bg-black/40 border-orange-900/30 dark:border-orange-950/30 text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 dark:bg-black/95 border-orange-900/30 dark:border-orange-950/30 text-white">
                        <SelectItem value="All">All Status</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <ArrowUpDown className="text-gray-400 h-4 w-4" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-black/30 dark:bg-black/40 border-orange-900/30 dark:border-orange-950/30 text-white">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 dark:bg-black/95 border-orange-900/30 dark:border-orange-950/30 text-white">
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                        <SelectItem value="priceLow">Price: Low to High</SelectItem>
                        <SelectItem value="bestSelling">Best Selling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Products Grid */}
                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="luxury-spinner"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="bg-black/30 dark:bg-black/40 border-orange-900/30 dark:border-orange-950/30 text-white overflow-hidden animated-border-card animated-border-card-agent"
                      >
                        <div className="relative h-48 bg-black/50 dark:bg-black/60">
                          <Image
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-contain p-4"
                          />
                          <div className="absolute top-2 right-2 flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-black/50 hover:bg-orange-900/50 text-white"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-black/50 hover:bg-red-900/50 text-white"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Badge
                            className={`absolute top-2 left-2 ${
                              product.status === "Published"
                                ? "bg-green-900/70 text-green-300 dark:bg-green-950/70 dark:text-green-200"
                                : "bg-gray-900/70 text-gray-300 dark:bg-gray-950/70 dark:text-gray-200"
                            }`}
                          >
                            {product.status}
                          </Badge>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-white">{product.name}</CardTitle>
                          <CardDescription className="text-gray-400">{product.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 text-sm line-clamp-2 mb-4">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-400">Price</p>
                              <p className="text-lg font-bold text-gradient-agent">${product.price}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Stock</p>
                              <p className="text-lg font-bold text-white">{product.stock}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Sales</p>
                              <p className="text-lg font-bold text-white">{product.sales || 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!isLoading && filteredProducts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-16 w-16 text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
                    <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
                    <Button className="btn-gradient-agent text-white" onClick={() => setIsAddProductOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Product
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <h2 className="text-2xl font-bold text-white font-serif mb-6">Sales Analytics</h2>

                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="luxury-spinner"></div>
                  </div>
                ) : salesData ? (
                  <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <Card className="bg-black/30 dark:bg-black/40 border-orange-900/30 dark:border-orange-950/30 text-white animated-border-card animated-border-card-agent">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-gray-400">Total Sales</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <ShoppingBag className="h-8 w-8 text-orange-400 mr-3" />
                            <div>
                              <p className="text-3xl font-bold text-white">{salesData.totalSales}</p>
                              <p className="text-sm text-green-400">+12.5% from last month</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-black/30 dark:bg-black/40 border-orange-900/30 dark:border-orange-950/30 text-white animated-border-card animated-border-card-agent">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-gray-400">Total Revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <DollarSign className="h-8 w-8 text-orange-400 mr-3" />
                            <div>
                              <p className="text-3xl font-bold text-white">
                                ${salesData.totalRevenue.toLocaleString()}
                              </p>
                              <p className="text-sm text-green-400">+8.3% from last month</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-black/30 dark:bg-black/40 border-orange-900/30 dark:border-orange-950/30 text-white animated-border-card animated-border-card-agent">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-gray-400">Average Order</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-orange-400 mr-3" />
                            <div>
                              <p className="text-3xl font-bold text-white">${salesData.averageOrder}</p>
                              <p className="text-sm text-green-400">+3.7% from last month</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-black/30 dark:bg-black/40 border-orange-900/30 dark:border-orange-950/30 text-white animated-border-card animated-border-card-agent">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-gray-400">Total Customers</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <Users className="h-8 w-8 text-orange-400 mr-3" />
                            <div>
                              <p className="text-3xl font-bold text-white">{salesData.customers}</p>
                              <p className="text-sm text-green-400">+5.2% from last month</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Monthly Sales Chart */}
                    <Card className="bg-black/30 dark:bg-black/40 border-orange-900/30 dark:border-orange-950/30 text-white animated-border-card animated-border-card-agent">
                      <CardHeader>
                        <CardTitle className="text-white">Monthly Sales Performance</CardTitle>
                        <CardDescription className="text-gray-400">
                          Sales and revenue over the past 12 months
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 flex items-end justify-between gap-2">
                          {salesData.monthlyData.map((month: any) => (
                            <div key={month.month} className="flex flex-col items-center">
                              <div className="relative w-12 flex-1 flex flex-col justify-end">
                                <div
                                  className="w-full bg-orange-900/50 dark:bg-orange-950/50 rounded-t-sm"
                                  style={{ height: `${(month.sales / 200) * 100}%` }}
                                ></div>
                                <div
                                  className="w-full bg-orange-500/50 dark:bg-orange-600/50 rounded-t-sm absolute bottom-0"
                                  style={{ height: `${(month.revenue / 15000) * 100}%`, maxHeight: "80%" }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">{month.month}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center mt-4 space-x-6">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-orange-900/50 dark:bg-orange-950/50 rounded-sm mr-2"></div>
                            <span className="text-sm text-gray-400">Sales</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-orange-500/50 dark:bg-orange-600/50 rounded-sm mr-2"></div>
                            <span className="text-sm text-gray-400">Revenue</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Products */}
                    <Card className="bg-black/30 dark:bg-black/40 border-orange-900/30 dark:border-orange-950/30 text-white animated-border-card animated-border-card-agent">
                      <CardHeader>
                        <CardTitle className="text-white">Top Selling Products</CardTitle>
                        <CardDescription className="text-gray-400">
                          Your best performing products by sales
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {salesData.topProducts.map((product: any, index: number) => (
                            <div key={product.id} className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-orange-900/50 dark:bg-orange-950/50 flex items-center justify-center text-white font-bold mr-4">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-white font-medium">{product.name}</h4>
                                <p className="text-sm text-gray-400">{product.sales} sales</p>
                              </div>
                              <p className="text-lg font-bold text-gradient-agent">${product.revenue}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="h-16 w-16 text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No analytics data available</h3>
                    <p className="text-gray-400 mb-6">Start selling products to see your analytics</p>
                  </div>
                )}
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <h2 className="text-2xl font-bold text-white font-serif mb-6">Recent Orders</h2>

                {isLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="luxury-spinner"></div>
                  </div>
                ) : orders.length > 0 ? (
                  <Card className="bg-black/30 dark:bg-black/40 border-orange-900/30 dark:border-orange-950/30 text-white animated-border-card animated-border-card-agent">
                    <CardContent className="p-0">
                      <div className="relative overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="text-gray-400 text-xs uppercase border-b border-orange-900/30 dark:border-orange-950/30">
                            <tr>
                              <th className="px-6 py-4">Order ID</th>
                              <th className="px-6 py-4">Customer</th>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Amount</th>
                              <th className="px-6 py-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-orange-900/30 dark:divide-orange-950/30">
                            {orders.map((order: any) => (
                              <tr key={order.id} className="hover:bg-orange-900/10 dark:hover:bg-orange-950/10">
                                <td className="px-6 py-4 font-medium text-white">#{order.id.substring(0, 8)}</td>
                                <td className="px-6 py-4 text-gray-300">{order.user_id.substring(0, 8)}</td>
                                <td className="px-6 py-4 text-gray-300">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-gray-300">${order.total.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      order.status === "Delivered"
                                        ? "bg-green-900/30 text-green-300 dark:bg-green-950/30 dark:text-green-200"
                                        : order.status === "Processing"
                                          ? "bg-orange-900/30 text-orange-300 dark:bg-orange-950/30 dark:text-orange-200"
                                          : "bg-blue-900/30 text-blue-300 dark:bg-blue-950/30 dark:text-blue-200"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-16 w-16 text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
                    <p className="text-gray-400 mb-6">
                      Your orders will appear here once customers start purchasing your products
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="bg-gradient-dark-agent dark:bg-gradient-dark-6 text-white border-orange-900 dark:border-orange-950">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-gradient-agent">Add New Product</DialogTitle>
            <DialogDescription className="text-gray-300">
              Fill in the details to add a new product to your store.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name" className="text-white">
                Product Name
              </Label>
              <Input
                id="product-name"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="bg-black/50 border-orange-900 dark:border-orange-950 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description" className="text-white">
                Description
              </Label>
              <Textarea
                id="product-description"
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
                className="bg-black/50 border-orange-900 dark:border-orange-950 text-white min-h-[100px]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-price" className="text-white">
                  Price ($)
                </Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  className="bg-black/50 border-orange-900 dark:border-orange-950 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-stock" className="text-white">
                  Stock
                </Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  value={newProductStock}
                  onChange={(e) => setNewProductStock(e.target.value)}
                  className="bg-black/50 border-orange-900 dark:border-orange-950 text-white"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-category" className="text-white">
                  Category
                </Label>
                <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                  <SelectTrigger
                    id="product-category"
                    className="bg-black/50 border-orange-900 dark:border-orange-950 text-white"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 dark:bg-black/95 border-orange-900 dark:border-orange-950 text-white">
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Home Decor">Home Decor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-status" className="text-white">
                  Status
                </Label>
                <Select value={newProductStatus} onValueChange={setNewProductStatus}>
                  <SelectTrigger
                    id="product-status"
                    className="bg-black/50 border-orange-900 dark:border-orange-950 text-white"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 dark:bg-black/95 border-orange-900 dark:border-orange-950 text-white">
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Product Image</Label>
              <div className="border-2 border-dashed border-orange-900/50 dark:border-orange-950/50 rounded-lg p-6 text-center">
                <Upload className="h-10 w-10 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Drag and drop your image here, or click to browse</p>
                <p className="text-xs text-gray-400">PNG, JPG or WEBP (max. 2MB)</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 border-orange-900/50 dark:border-orange-950/50 text-orange-300 dark:text-orange-200 hover:bg-orange-900/20 dark:hover:bg-orange-950/20"
                >
                  Upload Image
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-orange-900/50 dark:border-orange-950/50 text-orange-300 dark:text-orange-200 hover:bg-orange-900/20 dark:hover:bg-orange-950/20"
                onClick={() => setIsAddProductOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-gradient-agent text-white">
                Add Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="bg-gradient-dark-agent dark:bg-gradient-dark-6 text-white border-orange-900 dark:border-orange-950">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-gradient-agent">Edit Product</DialogTitle>
            <DialogDescription className="text-gray-300">Update the details of your product.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-product-name" className="text-white">
                Product Name
              </Label>
              <Input
                id="edit-product-name"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="bg-black/50 border-orange-900 dark:border-orange-950 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-description" className="text-white">
                Description
              </Label>
              <Textarea
                id="edit-product-description"
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
                className="bg-black/50 border-orange-900 dark:border-orange-950 text-white min-h-[100px]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-product-price" className="text-white">
                  Price ($)
                </Label>
                <Input
                  id="edit-product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  className="bg-black/50 border-orange-900 dark:border-orange-950 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product-stock" className="text-white">
                  Stock
                </Label>
                <Input
                  id="edit-product-stock"
                  type="number"
                  min="0"
                  value={newProductStock}
                  onChange={(e) => setNewProductStock(e.target.value)}
                  className="bg-black/50 border-orange-900 dark:border-orange-950 text-white"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-product-category" className="text-white">
                  Category
                </Label>
                <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                  <SelectTrigger
                    id="edit-product-category"
                    className="bg-black/50 border-orange-900 dark:border-orange-950 text-white"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 dark:bg-black/95 border-orange-900 dark:border-orange-950 text-white">
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Home Decor">Home Decor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product-status" className="text-white">
                  Status
                </Label>
                <Select value={newProductStatus} onValueChange={setNewProductStatus}>
                  <SelectTrigger
                    id="edit-product-status"
                    className="bg-black/50 border-orange-900 dark:border-orange-950 text-white"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 dark:bg-black/95 border-orange-900 dark:border-orange-950 text-white">
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-orange-900/50 dark:border-orange-950/50 text-orange-300 dark:text-orange-200 hover:bg-orange-900/20 dark:hover:bg-orange-950/20"
                onClick={() => setIsEditProductOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-gradient-agent text-white">
                Update Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

