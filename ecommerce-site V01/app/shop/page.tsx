"use client"

import { Label } from "@/components/ui/label"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Heart,
  Search,
  ShoppingCart,
  User,
  ChevronRight,
  ChevronLeft,
  Edit,
  Package,
  MessageSquare,
  Phone,
  LogOut,
  Plus,
  Sparkles,
  MapPin,
  Mail,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { getProducts, addToCart, addToFavorites, removeFromFavorites, type Product } from "@/lib/supabase"

// Sample slider images
const SLIDER_IMAGES = [
  "/placeholder.svg?height=400&width=1200&text=Luxury+Collection",
  "/placeholder.svg?height=400&width=1200&text=Premium+Selection",
  "/placeholder.svg?height=400&width=1200&text=Exclusive+Offers",
  "/placeholder.svg?height=400&width=1200&text=VIP+Access",
]

export default function ShopPage() {
  const [sliderIndex, setSliderIndex] = useState(0)
  const [visibleProducts, setVisibleProducts] = useState(15)
  const [cartItems, setCartItems] = useState<number[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [feedbackName, setFeedbackName] = useState("")
  const [feedbackEmail, setFeedbackEmail] = useState("")
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const isMobile = useMobile()
  const sliderRef = useRef<HTMLDivElement>(null)
  const sliderIntervalRef = useRef<NodeJS.Timeout>()
  const { user } = useAuth()

  // Check if user is logged in as agent and redirect if needed
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (userType === "agent") {
      router.push("/agent-dashboard")
    }
  }, [router])

  // Fetch products from Supabase
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true)
        const data = await getProducts(50, undefined, searchQuery)
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [searchQuery])

  // Get cart and favorites from localStorage for now (will be replaced with Supabase data)
  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart)
      setCartItems(parsedCart.map((item: any) => item.id))
    }

    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }
  }, [])

  // Handle slider navigation
  const nextSlide = () => {
    setSliderIndex((prev) => (prev === SLIDER_IMAGES.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setSliderIndex((prev) => (prev === 0 ? SLIDER_IMAGES.length - 1 : prev - 1))
  }

  // Auto-rotate slider
  useEffect(() => {
    sliderIntervalRef.current = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => {
      if (sliderIntervalRef.current) {
        clearInterval(sliderIntervalRef.current)
      }
    }
  }, [])

  // Pause auto-rotation when hovering over slider
  const handleSliderMouseEnter = () => {
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current)
    }
  }

  const handleSliderMouseLeave = () => {
    sliderIntervalRef.current = setInterval(() => {
      nextSlide()
    }, 5000)
  }

  // Load more products on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Hide/show header based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false)
      } else {
        setIsHeaderVisible(true)
      }

      setLastScrollY(currentScrollY)

      // Infinite scroll
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setVisibleProducts((prev) => Math.min(prev + 10, products.length))
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY, products.length])

  // Add to cart functionality
  const handleAddToCart = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const product = products.find((p) => p.id === productId)
    if (!product) return

    try {
      // Add to cart in Supabase
      await addToCart(user.id, productId, 1, "Default", "M")

      // Update local state
      setCartItems((prev) => [...prev, productId])

      // Add animation effect
      const button = e.currentTarget
      button.classList.add("animate-pulse-slow")
      setTimeout(() => {
        button.classList.remove("animate-pulse-slow")
      }, 1000)

      // Show toast notification
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle favorite functionality
  const handleToggleFavorite = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your favorites",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      if (favorites.includes(productId)) {
        // Remove from favorites in Supabase
        await removeFromFavorites(user.id, productId)

        // Update local state
        setFavorites(favorites.filter((id) => id !== productId))
      } else {
        // Add to favorites in Supabase
        await addToFavorites(user.id, productId)

        // Update local state
        setFavorites([...favorites, productId])
      }

      // Add animation effect
      const button = e.currentTarget
      button.classList.add("animate-pulse-slow")
      setTimeout(() => {
        button.classList.remove("animate-pulse-slow")
      }, 1000)

      // Show toast notification
      const product = products.find((p) => p.id === productId)
      if (product) {
        toast({
          title: favorites.includes(productId) ? "Removed from favorites" : "Added to favorites",
          description: `${product.name} has been ${favorites.includes(productId) ? "removed from" : "added to"} your favorites.`,
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Navigation functions
  const navigateToProfile = () => {
    router.push("/profile")
  }

  const navigateToOrders = () => {
    router.push("/orders")
  }

  const navigateToFavorites = () => {
    router.push("/favorites")
  }

  const navigateToCart = () => {
    router.push("/cart")
  }

  // Feedback form submission
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this data to your backend
    console.log("Feedback submitted:", { feedbackName, feedbackEmail, feedbackMessage })

    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback! We'll get back to you soon.",
      duration: 5000,
    })

    // Reset form
    setFeedbackName("")
    setFeedbackEmail("")
    setFeedbackMessage("")
    setFeedbackDialogOpen(false)
  }

  // Contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this data to your backend
    console.log("Contact form submitted:", { feedbackName, feedbackEmail, feedbackMessage })

    toast({
      title: "Message Sent",
      description: "Thank you for contacting us! Our team will respond shortly.",
      duration: 5000,
    })

    // Reset form
    setFeedbackName("")
    setFeedbackEmail("")
    setFeedbackMessage("")
    setContactDialogOpen(false)
  }

  // Logout functionality
  const handleLogout = () => {
    localStorage.removeItem("userType")
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark-1 dark:bg-gradient-dark-2 animated-gradient">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 bg-black/80 dark:bg-black/90 backdrop-blur-md shadow-md transition-transform duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/shop" className="text-2xl font-bold text-gradient-1 font-serif tracking-wide">
            LuxeMarket
          </Link>

          {/* Search Bar */}
          <div className="relative max-w-md w-full mx-4 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors duration-300 group-hover:text-purple-500" />
            <Input
              type="text"
              placeholder="Search luxury products..."
              className="pl-10 pr-4 py-2 w-full rounded-full border-2 border-gray-700 focus:border-purple-500 transition-all duration-300 bg-gray-900/50 text-white focus:bg-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-1 transition-all duration-300 group-hover:w-full"></div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full hover:bg-purple-900/30 transition-colors duration-300 text-white"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                  <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 animate-in slide-in-from-top-1 fade-in-20 p-2 bg-black/95 backdrop-blur-md border border-purple-900 text-white"
              >
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 py-3 px-3 rounded-md hover:bg-purple-900/30 transition-colors duration-200"
                  onClick={navigateToProfile}
                >
                  <Edit className="h-4 w-4 text-purple-400" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 py-3 px-3 rounded-md hover:bg-purple-900/30 transition-colors duration-200"
                  onClick={navigateToOrders}
                >
                  <Package className="h-4 w-4 text-purple-400" />
                  <span>Orders</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 py-3 px-3 rounded-md hover:bg-purple-900/30 transition-colors duration-200"
                  onClick={() => setFeedbackDialogOpen(true)}
                >
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  <span>Feedback</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 py-3 px-3 rounded-md hover:bg-purple-900/30 transition-colors duration-200"
                  onClick={() => setContactDialogOpen(true)}
                >
                  <Phone className="h-4 w-4 text-purple-400" />
                  <span>Contact Us</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 py-3 px-3 mt-1 rounded-md hover:bg-red-900/30 text-red-400 transition-colors duration-200"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Favorites */}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-red-900/30 transition-colors duration-300 text-white"
              onClick={navigateToFavorites}
            >
              <Heart
                className={`h-5 w-5 ${favorites.length > 0 ? "text-red-500 fill-red-500" : "text-white"} transition-colors duration-300`}
              />
              {favorites.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 animate-pulse-slow">
                  {favorites.length}
                </Badge>
              )}
              <span className="sr-only">Favorites</span>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-purple-900/30 transition-colors duration-300 text-white"
              onClick={navigateToCart}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-1 animate-pulse-slow">
                  {cartItems.length}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Image Slider */}
        <div
          className="relative overflow-hidden h-[350px] md:h-[500px]"
          ref={sliderRef}
          onMouseEnter={handleSliderMouseEnter}
          onMouseLeave={handleSliderMouseLeave}
        >
          <div
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${sliderIndex * 100}%)` }}
          >
            {SLIDER_IMAGES.map((src, index) => (
              <div key={index} className="min-w-full h-full relative">
                <Image
                  src={src || "/placeholder.svg"}
                  alt={`Slide ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
                  <div className="container mx-auto px-8 md:px-16">
                    <div className="max-w-lg animate-fade-in" style={{ animationDelay: "0.3s" }}>
                      <h2 className="text-3xl md:text-5xl font-bold text-white font-serif mb-4 animate-slide-up">
                        {index === 0
                          ? "Luxury Collection"
                          : index === 1
                            ? "Premium Selection"
                            : index === 2
                              ? "Exclusive Offers"
                              : "VIP Access"}
                      </h2>
                      <p className="text-lg text-white/90 mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                        {index === 0
                          ? "Discover our handcrafted luxury items"
                          : index === 1
                            ? "Curated selection of premium products"
                            : index === 2
                              ? "Limited time offers on exclusive items"
                              : "Members-only access to rare collections"}
                      </p>
                      <Button
                        className="btn-gradient-1 text-white hover:shadow-lg transition-all duration-300 animate-slide-up"
                        style={{ animationDelay: "0.4s" }}
                      >
                        Explore Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Controls */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/80 hover:scale-110 transition-all duration-300 text-white border-purple-500"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous slide</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/80 hover:scale-110 transition-all duration-300 text-white border-purple-500"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next slide</span>
          </Button>

          {/* Slider Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {SLIDER_IMAGES.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === sliderIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
                }`}
                onClick={() => setSliderIndex(index)}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-2 text-white font-serif text-center">Luxury Collection</h2>
          <p className="text-center text-gray-300 mb-10 max-w-2xl mx-auto font-serif">
            Discover our handcrafted selection of premium products, designed for those who appreciate the finer things
            in life.
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="luxury-spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
              {filteredProducts.slice(0, visibleProducts).map((product, index) => (
                <div
                  key={product.id}
                  className="group hover-lift bg-black/50 dark:bg-black/60 backdrop-blur-sm rounded-xl shadow-md overflow-hidden transition-all duration-500 hover:shadow-xl border border-purple-900/30 animated-border-card"
                >
                  <Link href={`/shop/${product.id}`} className="block">
                    <div className="relative h-56 bg-gray-900 overflow-hidden">
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                      />
                      {product.tag && (
                        <div
                          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
                            product.tag === "New"
                              ? "bg-green-900/70 text-green-300"
                              : product.tag === "Sale"
                                ? "bg-red-900/70 text-red-300"
                                : "bg-purple-900/70 text-purple-300"
                          }`}
                        >
                          {product.tag}
                        </div>
                      )}
                      <button
                        className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
                          favorites.includes(product.id)
                            ? "bg-red-900/70 text-red-300"
                            : "bg-black/50 text-gray-400 hover:text-red-300 hover:bg-black/70"
                        }`}
                        onClick={(e) => handleToggleFavorite(product.id, e)}
                      >
                        <Heart className={`h-4 w-4 ${favorites.includes(product.id) ? "fill-red-300" : ""}`} />
                        <span className="sr-only">Add to favorites</span>
                      </button>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link href={`/shop/${product.id}`}>
                      <h3 className="font-serif text-lg font-medium text-white mb-1 group-hover:text-purple-300 transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2 font-light">{product.description}</p>
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gradient-1 text-lg">${product.price}</span>
                      <Button
                        size="sm"
                        className="btn-gradient-1 text-white rounded-full h-9 w-9 p-0 flex items-center justify-center transition-all duration-300"
                        onClick={(e) => handleAddToCart(product.id, e)}
                      >
                        <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                        <span className="sr-only">Add to cart</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loading indicator */}
          {!isLoading && visibleProducts < filteredProducts.length && (
            <div className="flex justify-center mt-12">
              <div className="luxury-spinner"></div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-dark-2 text-white pt-16 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* About */}
            <div className="animate-fade-in">
              <h3 className="text-xl font-serif font-semibold mb-6 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-300" />
                About LuxeMarket
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                LuxeMarket is your premier destination for luxury shopping. We curate the finest products from around
                the world, offering unparalleled quality and exclusivity to our discerning clientele.
              </p>
              <div className="mt-6">
                <Link href="/shop" className="text-gradient-1 font-medium hover:underline transition-all duration-300">
                  Discover Our Story
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-xl font-serif font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="transform-gpu transition-transform duration-300 hover:translate-x-2">
                  <Link href="/shop" className="hover:text-white hover:underline flex items-center">
                    <ChevronRight className="h-3 w-3 mr-2" />
                    Collections
                  </Link>
                </li>
                <li className="transform-gpu transition-transform duration-300 hover:translate-x-2">
                  <Link href="/shop" className="hover:text-white hover:underline flex items-center">
                    <ChevronRight className="h-3 w-3 mr-2" />
                    New Arrivals
                  </Link>
                </li>
                <li className="transform-gpu transition-transform duration-300 hover:translate-x-2">
                  <Link href="/favorites" className="hover:text-white hover:underline flex items-center">
                    <ChevronRight className="h-3 w-3 mr-2" />
                    Wishlist
                  </Link>
                </li>
                <li className="transform-gpu transition-transform duration-300 hover:translate-x-2">
                  <Link href="/cart" className="hover:text-white hover:underline flex items-center">
                    <ChevronRight className="h-3 w-3 mr-2" />
                    Shopping Bag
                  </Link>
                </li>
                <li className="transform-gpu transition-transform duration-300 hover:translate-x-2">
                  <Link href="/orders" className="hover:text-white hover:underline flex items-center">
                    <ChevronRight className="h-3 w-3 mr-2" />
                    Order History
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <h3 className="text-xl font-serif font-semibold mb-6">Customer Service</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="transform-gpu transition-transform duration-300 hover:translate-x-2">
                  <button
                    onClick={() => setContactDialogOpen(true)}
                    className="hover:text-white hover:underline flex items-center"
                  >
                    <ChevronRight className="h-3 w-3 mr-2" />
                    Contact Us
                  </button>
                </li>
                <li className="transform-gpu transition-transform duration-300 hover:translate-x-2">
                  <Link href="#" className="hover:text-white hover:underline flex items-center">
                    <ChevronRight className="h-3 w-3 mr-2" />
                    FAQs
                  </Link>
                </li>
                <li className="transform-gpu transition-transform duration-300 hover:translate-x-2">
                  <Link href="#" className="hover:text-white hover:underline flex items-center">
                    <ChevronRight className="h-3 w-3 mr-2" />
                    Shipping Policy
                  </Link>
                </li>
                <li className="transform-gpu transition-transform duration-300 hover:translate-x-2">
                  <Link href="#" className="hover:text-white hover:underline flex items-center">
                    <ChevronRight className="h-3 w-3 mr-2" />
                    Returns & Refunds
                  </Link>
                </li>
                <li className="transform-gpu transition-transform duration-300 hover:translate-x-2">
                  <Link href="#" className="hover:text-white hover:underline flex items-center">
                    <ChevronRight className="h-3 w-3 mr-2" />
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <h3 className="text-xl font-serif font-semibold mb-6">Get In Touch</h3>
              <address className="not-italic text-sm text-gray-300 space-y-3">
                <p className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-purple-300 flex-shrink-0 mt-0.5" />
                  <span>
                    123 Luxury Avenue
                    <br />
                    Prestige District, PD 10001
                  </span>
                </p>
                <p className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-purple-300 flex-shrink-0" />
                  <span>concierge@luxemarket.com</span>
                </p>
                <p className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-purple-300 flex-shrink-0" />
                  <span>+1 (555) 123-4567</span>
                </p>
              </address>
              <div className="flex space-x-4 mt-6">
                <Link
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-110 transform-gpu"
                >
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-110 transform-gpu"
                >
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-110 transform-gpu"
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700/50 mt-12 pt-8 text-sm text-gray-400 text-center">
            <p>&copy; {new Date().getFullYear()} LuxeMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="bg-gradient-dark-3 text-white border-purple-900 dark:bg-gradient-dark-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-gradient-1">Share Your Feedback</DialogTitle>
            <DialogDescription className="text-gray-300">
              We value your opinion. Let us know how we can improve your shopping experience.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-name" className="text-white">
                Name
              </Label>
              <Input
                id="feedback-name"
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                className="bg-black/50 border-purple-900 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-email" className="text-white">
                Email
              </Label>
              <Input
                id="feedback-email"
                type="email"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
                className="bg-black/50 border-purple-900 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-message" className="text-white">
                Your Feedback
              </Label>
              <Textarea
                id="feedback-message"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                className="bg-black/50 border-purple-900 text-white min-h-[120px]"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="btn-gradient-1 text-white">
                Submit Feedback
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="bg-gradient-dark-3 text-white border-purple-900 dark:bg-gradient-dark-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-gradient-1">Contact Us</DialogTitle>
            <DialogDescription className="text-gray-300">
              Have questions or need assistance? Reach out to our customer service team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name" className="text-white">
                Name
              </Label>
              <Input
                id="contact-name"
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                className="bg-black/50 border-purple-900 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email" className="text-white">
                Email
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
                className="bg-black/50 border-purple-900 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message" className="text-white">
                Message
              </Label>
              <Textarea
                id="contact-message"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                className="bg-black/50 border-purple-900 text-white min-h-[120px]"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="btn-gradient-1 text-white">
                Send Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

