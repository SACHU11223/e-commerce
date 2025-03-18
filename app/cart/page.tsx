"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, ArrowLeft, ShoppingBag, CreditCard, Gift, Truck, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

type CartItem = {
  id: number
  name: string
  price: number
  image: string
  color: string
  size: string
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [isApplying, setIsApplying] = useState(false)
  const [couponError, setCouponError] = useState("")
  const router = useRouter()

  // Load cart items from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    }
  }, [])

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

  // Animation sequence for elements
  useEffect(() => {
    const elements = document.querySelectorAll(".animate-item")
    elements.forEach((el, index) => {
      ;(el as HTMLElement).style.animationDelay = `${index * 0.1}s`
    })
  }, [])

  const removeItem = (index: number) => {
    const newCartItems = [...cartItems]
    newCartItems.splice(index, 1)
    setCartItems(newCartItems)
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const newCartItems = [...cartItems]
    newCartItems[index].quantity = newQuantity
    setCartItems(newCartItems)
  }

  const applyCoupon = () => {
    setCouponError("")
    setIsApplying(true)

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would validate the coupon code with the backend
      if (couponCode.toLowerCase() === "luxury10") {
        setDiscount(10)
      } else if (couponCode.toLowerCase() === "luxury20") {
        setDiscount(20)
      } else if (couponCode.toLowerCase() === "vip30") {
        setDiscount(30)
      } else {
        setCouponError("Invalid coupon code")
        setDiscount(0)
      }
      setIsApplying(false)
    }, 1000)
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = (subtotal * discount) / 100
  const shipping = subtotal > 0 ? 5.99 : 0
  const total = subtotal - discountAmount + shipping

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="flex items-center text-gray-600 hover:text-purple-700 group transition-colors duration-300 mb-6"
          onClick={() => router.push("/shop")}
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Continue Shopping
        </Button>

        <h1 className="text-3xl font-bold mb-8 font-serif text-gradient-primary">Your Shopping Bag</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-purple-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-3 font-serif">Your bag is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any luxury products to your bag yet.
            </p>
            <Button
              className="bg-gradient-primary hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 px-8 py-6"
              onClick={() => router.push("/shop")}
            >
              Explore Collection
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in">
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-semibold mb-6 font-serif flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2 text-purple-500" />
                    Shopping Bag ({cartItems.length})
                  </h2>

                  <div className="space-y-8">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-6 animate-item animate-slide-up">
                        <div className="flex-shrink-0 relative w-full sm:w-32 h-32 bg-gray-50 rounded-lg overflow-hidden group">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>

                        <div className="flex-grow">
                          <Link
                            href={`/shop/${item.id}`}
                            className="font-medium text-lg text-gray-800 hover:text-purple-700 transition-colors duration-300 font-serif"
                          >
                            {item.name}
                          </Link>

                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                            <span className="px-2 py-1 bg-gray-100 rounded-full">Color: {item.color}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded-full">Size: {item.size}</span>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
                              <button
                                className="px-3 py-1 text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-300"
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-gray-800 font-medium">{item.quantity}</span>
                              <button
                                className="px-3 py-1 text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-300"
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center gap-6">
                              <span className="font-medium text-lg text-gradient-primary">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                              <button
                                className="text-gray-400 hover:text-red-500 transition-colors duration-300 hover-scale"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div
                className="bg-white rounded-xl shadow-md p-6 md:p-8 sticky top-6 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <h2 className="text-xl font-semibold mb-6 font-serif">Order Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl text-gradient-primary">${total.toFixed(2)}</span>
                  </div>

                  <div className="pt-4">
                    <div className="relative">
                      <div className="flex gap-2 mb-1">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                        />
                        <Button
                          variant="outline"
                          onClick={applyCoupon}
                          disabled={isApplying || !couponCode}
                          className="border-2 border-purple-500 text-purple-700 hover:bg-purple-50 transition-all duration-300"
                        >
                          {isApplying ? "Applying..." : "Apply"}
                        </Button>
                      </div>
                      {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                      <p className="text-xs text-gray-500 mt-1">Try: LUXURY10, LUXURY20, VIP30</p>
                    </div>

                    <Button
                      className="w-full mt-6 bg-gradient-primary hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 h-12"
                      onClick={() => router.push("/checkout")}
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Button>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center text-xs text-gray-600">
                        <Truck className="h-4 w-4 mr-2 text-purple-500" />
                        <span>Free shipping on orders over $100</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Gift className="h-4 w-4 mr-2 text-purple-500" />
                        <span>Complimentary gift wrapping</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Shield className="h-4 w-4 mr-2 text-purple-500" />
                        <span>Secure checkout with 256-bit encryption</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

