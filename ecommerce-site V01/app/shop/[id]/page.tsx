"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Heart, ShoppingCart, Star, ArrowLeft, Plus, Minus, Check, Award, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample product data - in a real app, this would come from a database
const PRODUCTS = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  name: `Luxury Product ${i + 1}`,
  description: "Premium quality with exquisite craftsmanship",
  longDescription:
    "This premium product is crafted with the finest materials and designed to provide exceptional performance and durability. It features advanced technology that enhances user experience and delivers outstanding results. Perfect for everyday use, this product combines style, functionality, and reliability in one package.",
  price: Math.floor(Math.random() * 100) + 50,
  image: `/placeholder.svg?height=400&width=400&text=Product+${i + 1}`,
  rating: Math.floor(Math.random() * 5) + 1,
  reviews: Math.floor(Math.random() * 100) + 1,
  colors: ["Black", "White", "Gold", "Silver"],
  sizes: ["S", "M", "L", "XL"],
  stock: Math.floor(Math.random() * 50) + 1,
  specifications: [
    { name: "Material", value: "Premium Quality" },
    { name: "Dimensions", value: "10 x 15 x 5 cm" },
    { name: "Weight", value: "250g" },
    { name: "Warranty", value: "2 Years" },
  ],
  features: [
    "Handcrafted by expert artisans",
    "Made with sustainable materials",
    "Exclusive limited edition design",
    "Complimentary gift wrapping available",
  ],
}))

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const productId = Number.parseInt(params.id)
  const product = PRODUCTS.find((p) => p.id === productId)
  const router = useRouter()

  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || "")
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "")
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  // Product images (in a real app, each product would have multiple images)
  const productImages = [
    product?.image,
    `/placeholder.svg?height=400&width=400&text=Detail+1`,
    `/placeholder.svg?height=400&width=400&text=Detail+2`,
    `/placeholder.svg?height=400&width=400&text=Detail+3`,
  ]

  // Get cart and favorites from localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    setIsFavorite(favorites.includes(productId))
  }, [productId])

  // Animation sequence for elements
  useEffect(() => {
    const elements = document.querySelectorAll(".animate-item")
    elements.forEach((el, index) => {
      ;(el as HTMLElement).style.animationDelay = `${index * 0.1}s`
    })
  }, [])

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <h1 className="text-2xl font-bold mb-4 text-gradient-primary">Product not found</h1>
        <Button
          onClick={() => router.push("/shop")}
          className="bg-gradient-primary hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
        >
          Back to Shop
        </Button>
      </div>
    )
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    let newFavorites

    if (favorites.includes(productId)) {
      newFavorites = favorites.filter((id: number) => id !== productId)
      setIsFavorite(false)
    } else {
      newFavorites = [...favorites, productId]
      setIsFavorite(true)
    }

    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cart.find(
      (item: any) => item.id === productId && item.color === selectedColor && item.size === selectedSize,
    )

    let newCart

    if (existingItem) {
      newCart = cart.map((item: any) => {
        if (item.id === productId && item.color === selectedColor && item.size === selectedSize) {
          return { ...item, quantity: item.quantity + quantity }
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
          color: selectedColor,
          size: selectedSize,
          quantity,
        },
      ]
    }

    localStorage.setItem("cart", JSON.stringify(newCart))

    // Show added to cart animation
    setIsAddedToCart(true)
    setTimeout(() => {
      setIsAddedToCart(false)
    }, 2000)

    // In a real app, you might want to navigate to cart after a delay
    // setTimeout(() => {
    //   router.push("/cart")
    // }, 1500)
  }

  const buyNow = () => {
    addToCart()
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Back button */}
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          className="flex items-center text-gray-600 hover:text-purple-700 group transition-colors duration-300"
          onClick={() => router.push("/shop")}
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Shop
        </Button>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2 relative">
              <div className="h-96 md:h-[600px] bg-gray-50 relative overflow-hidden">
                <Image
                  src={productImages[activeImage] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-contain p-8 transition-all duration-700 hover:scale-105"
                  priority
                />
                <button
                  className={`absolute top-4 right-4 p-2.5 rounded-full ${
                    isFavorite
                      ? "bg-red-100 text-red-500"
                      : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
                  } transition-all duration-300 hover-scale`}
                  onClick={toggleFavorite}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""}`} />
                </button>

                {/* Product tag */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Limited Edition
                </div>
              </div>

              {/* Thumbnail images */}
              <div className="flex justify-center mt-4 space-x-2 px-4">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    className={`relative h-16 w-16 rounded-md overflow-hidden border-2 transition-all duration-300 ${
                      activeImage === index ? "border-purple-500 shadow-md" : "border-gray-200 hover:border-purple-300"
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-6 md:p-10">
              <div className="flex flex-col h-full">
                <div className="animate-slide-up animate-item">
                  <div className="flex items-center mb-2">
                    <Badge className="bg-gradient-gold text-white mr-3">Premium</Badge>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-500">{product.reviews} reviews</span>
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif">{product.name}</h1>

                  <p className="text-gray-600 mb-6 font-light leading-relaxed">{product.longDescription}</p>

                  <div className="mb-6 flex items-end">
                    <h2 className="text-3xl font-bold text-gradient-primary mr-3">${product.price}</h2>
                    <span className="text-sm text-gray-500 line-through">${(product.price * 1.2).toFixed(2)}</span>
                    <span className="ml-2 text-sm text-green-600 font-medium">Save 20%</span>
                  </div>

                  <div className="flex items-center mb-6">
                    <div className="flex items-center mr-6">
                      <Award className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="text-sm text-gray-700">Authenticity Guaranteed</span>
                    </div>
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="text-sm text-gray-700">Free Gift Wrapping</span>
                    </div>
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mb-6 animate-slide-up animate-item">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
                  <div className="flex space-x-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        className={`group relative w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                          selectedColor === color
                            ? "border-purple-600 ring-2 ring-purple-200"
                            : "border-gray-300 hover:border-purple-400"
                        }`}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          background:
                            color.toLowerCase() === "black"
                              ? "#000"
                              : color.toLowerCase() === "white"
                                ? "#fff"
                                : color.toLowerCase() === "gold"
                                  ? "linear-gradient(135deg, #bf953f 0%, #fcf6ba 50%, #b38728 100%)"
                                  : color.toLowerCase() === "silver"
                                    ? "linear-gradient(135deg, #e6e6e6 0%, #ffffff 50%, #c0c0c0 100%)"
                                    : "#fff",
                        }}
                      >
                        {selectedColor === color && (
                          <Check
                            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 ${
                              color.toLowerCase() === "white" ||
                              color.toLowerCase() === "silver" ||
                              color.toLowerCase() === "gold"
                                ? "text-gray-800"
                                : "text-white"
                            }`}
                          />
                        )}
                        <span className="sr-only">{color}</span>
                        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="mb-6 animate-slide-up animate-item">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                  <div className="flex space-x-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          selectedSize === size
                            ? "border-purple-600 bg-purple-50 text-purple-700 font-medium"
                            : "border-gray-300 text-gray-700 hover:border-purple-400"
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-8 animate-slide-up animate-item">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="h-10 w-10 rounded-full border-2 border-gray-300 hover:border-purple-400 transition-colors duration-300"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-6 w-8 text-center font-medium text-lg">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                      className="h-10 w-10 rounded-full border-2 border-gray-300 hover:border-purple-400 transition-colors duration-300"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    <span className="ml-6 text-sm text-gray-500">
                      {product.stock > 0 ? (
                        <span className="text-green-600">In Stock ({product.stock} available)</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Key Features */}
                <div className="mb-8 animate-slide-up animate-item">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Add to Cart Button */}
                <div className="mt-auto animate-slide-up animate-item">
                  <div className="flex space-x-4">
                    <Button
                      className={`flex-1 h-12 relative overflow-hidden transition-all duration-500 ${
                        isAddedToCart
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gradient-primary hover:shadow-lg hover:shadow-purple-500/30"
                      }`}
                      onClick={addToCart}
                      disabled={product.stock === 0 || isAddedToCart}
                    >
                      <span
                        className={`flex items-center justify-center transition-all duration-500 ${isAddedToCart ? "opacity-0" : "opacity-100"}`}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </span>
                      <span
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isAddedToCart ? "opacity-100" : "opacity-0"}`}
                      >
                        <Check className="mr-2 h-5 w-5" />
                        Added to Cart
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 border-2 border-purple-600 text-purple-700 hover:bg-purple-50 transition-all duration-300"
                      onClick={buyNow}
                      disabled={product.stock === 0}
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="p-6 md:p-10 border-t animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="description" className="text-sm md:text-base py-3">
                  Description
                </TabsTrigger>
                <TabsTrigger value="specifications" className="text-sm md:text-base py-3">
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-sm md:text-base py-3">
                  Reviews
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="py-4 animate-fade-in">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">{product.longDescription}</p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Each piece is meticulously crafted by our skilled artisans, ensuring exceptional quality and
                    attention to detail. The premium materials used in its construction guarantee durability and a
                    luxurious feel that will stand the test of time.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    This exclusive item is part of our limited edition collection, making it a truly special addition to
                    your lifestyle. We take pride in our sustainable manufacturing processes, ensuring that luxury and
                    environmental responsibility go hand in hand.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="specifications" className="py-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between border-b border-gray-200 pb-3">
                      <span className="font-medium text-gray-700">{spec.name}</span>
                      <span className="text-gray-600">{spec.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-700">Country of Origin</span>
                    <span className="text-gray-600">Italy</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-700">Certification</span>
                    <span className="text-gray-600">Premium Quality Certified</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-700">Package Contents</span>
                    <span className="text-gray-600">Product, Certificate of Authenticity, Care Guide</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-700">Care Instructions</span>
                    <span className="text-gray-600">Gentle Clean with Soft Cloth</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="py-4 animate-fade-in">
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6">
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-primary text-white flex items-center justify-center font-medium mr-3">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div>
                          <h4 className="font-medium">Customer {index + 1}</h4>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(Math.random() * 3) + 3
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-xs text-gray-500">
                              {new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        {index === 0
                          ? "Absolutely stunning quality! The craftsmanship is impeccable and the attention to detail is remarkable. This is truly a luxury item worth every penny. The packaging was also beautiful and made the unboxing experience special."
                          : index === 1
                            ? "I've been using this product for a month now and I'm extremely satisfied. The quality is exceptional and it has exceeded my expectations. The customer service was also excellent when I had questions about care instructions."
                            : "This makes a perfect gift! I purchased it for my partner's birthday and they were thrilled. The premium quality is evident and it arrived in beautiful packaging. Will definitely shop here again for special occasions."}
                      </p>
                    </div>
                  ))}

                  <Button className="bg-gradient-primary hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
                    View All Reviews
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

