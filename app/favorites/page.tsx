"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

// Sample product data - in a real app, this would come from a database
const PRODUCTS = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  description: "High-quality product with premium features",
  price: Math.floor(Math.random() * 100) + 10,
  image: `/placeholder.svg?height=200&width=200&text=Product+${i + 1}`,
}))

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<number[]>([])
  const router = useRouter()

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }
  }, [])

  // Get favorite products
  const favoriteProducts = PRODUCTS.filter((product) => favorites.includes(product.id))

  const removeFromFavorites = (productId: number) => {
    const newFavorites = favorites.filter((id) => id !== productId)
    setFavorites(newFavorites)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  const addToCart = (productId: number) => {
    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) return

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cart.find((item: any) => item.id === productId)

    let newCart

    if (existingItem) {
      newCart = cart.map((item: any) => {
        if (item.id === productId) {
          return { ...item, quantity: item.quantity + 1 }
        }
        return item
      })
    } else {
      newCart = [
        ...cart,
        {
          id: productId,
          name: product.name,
          price: product.price,
          image: product.image,
          color: "Default",
          size: "M",
          quantity: 1,
        },
      ]
    }

    localStorage.setItem("cart", JSON.stringify(newCart))
    router.push("/cart")
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

        <h1 className="text-2xl font-bold mb-8">Your Favorites</h1>

        {favoriteProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">You haven't added any products to your favorites yet.</p>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => router.push("/shop")}>
              Explore Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favoriteProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-48 bg-gray-100">
                  <Link href={`/shop/${product.id}`}>
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain p-4"
                    />
                  </Link>
                  <button
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-100 text-red-500"
                    onClick={() => removeFromFavorites(product.id)}
                  >
                    <Heart className="h-4 w-4 fill-red-500" />
                    <span className="sr-only">Remove from favorites</span>
                  </button>
                </div>

                <div className="p-4">
                  <Link href={`/shop/${product.id}`}>
                    <h3 className="font-semibold text-gray-800 mb-1 truncate hover:text-indigo-600">{product.name}</h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600">${product.price}</span>
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => addToCart(product.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

