import { createClient } from "@supabase/supabase-js"

// IMPORTANT: Replace these with your actual Supabase credentials
// You can set these in your environment variables
const supabaseUrl = process.env.https://ohcwlaigoueajfulkmhk.supabase.co || ""
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oY3dsYWlnb3VlYWpmdWxrbWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MDIzOTAsImV4cCI6MjA1NTM3ODM5MH0.nHnxg7r5jZQzCLuMzcGpO9Z4odbno-hCqCDQ8Q6Gdxg || ""

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database schema:
// - users: id, email, name, role (user/agent), created_at
// - products: id, name, description, price, stock, category, status, image_url, agent_id, created_at
// - orders: id, user_id, status, total, created_at
// - order_items: id, order_id, product_id, quantity, price
// - favorites: id, user_id, product_id, created_at
// - cart_items: id, user_id, product_id, quantity, color, size, created_at

// User types
export type UserRole = "user" | "agent"

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  created_at: string
}

// Product types
export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category: string
  status: "Published" | "Draft"
  image_url: string
  agent_id: string
  sales?: number
  revenue?: number
  tag?: string | null
  created_at: string
}

// Order types
export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total: number
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: number
  quantity: number
  price: number
}

// Cart item type
export interface CartItem {
  id: string
  user_id: string
  product_id: number
  quantity: number
  color: string
  size: string
  created_at: string
  product?: Product
}

// Favorite type
export interface Favorite {
  id: string
  user_id: string
  product_id: number
  created_at: string
}

// User authentication functions
export async function signUp(email: string, password: string, name: string, role: UserRole = "user") {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  if (data.user) {
    // Create a profile in the users table
    const { error: profileError } = await supabase.from("users").insert([{ id: data.user.id, email, name, role }])

    if (profileError) {
      throw profileError
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return null

  const { data, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data as User
}

// Product functions
export async function getProducts(limit = 50, category?: string, search?: string) {
  let query = supabase.from("products").select("*").order("created_at", { ascending: false }).limit(limit)

  if (category && category !== "All") {
    query = query.eq("category", category)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data as Product[]
}

export async function getProduct(id: number) {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching product:", error)
    return null
  }

  return data as Product
}

export async function createProduct(product: Omit<Product, "id" | "created_at">) {
  const { data, error } = await supabase.from("products").insert([product]).select()

  if (error) {
    throw error
  }

  return data[0] as Product
}

export async function updateProduct(id: number, updates: Partial<Product>) {
  const { data, error } = await supabase.from("products").update(updates).eq("id", id).select()

  if (error) {
    throw error
  }

  return data[0] as Product
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    throw error
  }

  return true
}

// Cart functions
export async function getCartItems(userId: string) {
  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      product:products(*)
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching cart items:", error)
    return []
  }

  return data as (CartItem & { product: Product })[]
}

export async function addToCart(userId: string, productId: number, quantity: number, color: string, size: string) {
  // Check if item already exists in cart
  const { data: existingItems, error: fetchError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("color", color)
    .eq("size", size)

  if (fetchError) {
    throw fetchError
  }

  if (existingItems && existingItems.length > 0) {
    // Update existing item
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItems[0].quantity + quantity })
      .eq("id", existingItems[0].id)

    if (error) {
      throw error
    }
  } else {
    // Add new item
    const { error } = await supabase
      .from("cart_items")
      .insert([{ user_id: userId, product_id: productId, quantity, color, size }])

    if (error) {
      throw error
    }
  }

  return true
}

export async function updateCartItemQuantity(id: string, quantity: number) {
  const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", id)

  if (error) {
    throw error
  }

  return true
}

export async function removeFromCart(id: string) {
  const { error } = await supabase.from("cart_items").delete().eq("id", id)

  if (error) {
    throw error
  }

  return true
}

export async function clearCart(userId: string) {
  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

  if (error) {
    throw error
  }

  return true
}

// Favorites functions
export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select(`
      *,
      product:products(*)
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching favorites:", error)
    return []
  }

  return data as (Favorite & { product: Product })[]
}

export async function addToFavorites(userId: string, productId: number) {
  const { error } = await supabase.from("favorites").insert([{ user_id: userId, product_id: productId }])

  if (error) {
    throw error
  }

  return true
}

export async function removeFromFavorites(userId: string, productId: number) {
  const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", productId)

  if (error) {
    throw error
  }

  return true
}

// Order functions
export async function createOrder(userId: string, items: { productId: number; quantity: number; price: number }[]) {
  // Calculate total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Create order
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert([{ user_id: userId, status: "Pending", total }])
    .select()

  if (orderError) {
    throw orderError
  }

  const orderId = orderData[0].id

  // Create order items
  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

  if (itemsError) {
    throw itemsError
  }

  // Clear cart
  await clearCart(userId)

  return orderId
}

export async function getOrders(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return data as Order[]
}

export async function getOrderDetails(orderId: string) {
  const { data: orderData, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (orderError) {
    console.error("Error fetching order:", orderError)
    return null
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from("order_items")
    .select(`
      *,
      product:products(*)
    `)
    .eq("order_id", orderId)

  if (itemsError) {
    console.error("Error fetching order items:", itemsError)
    return null
  }

  return {
    ...orderData,
    items: itemsData,
  }
}

// Agent analytics functions
export async function getAgentProducts(agentId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching agent products:", error)
    return []
  }

  return data as Product[]
}

export async function getAgentSalesAnalytics(agentId: string) {
  // This would be a more complex query in a real application
  // For now, we'll return mock data
  return {
    totalSales: 1245,
    totalRevenue: 78650,
    averageOrder: 63.17,
    customers: 876,
    monthlyData: [
      { month: "Jan", sales: 42, revenue: 2650 },
      { month: "Feb", sales: 58, revenue: 3720 },
      { month: "Mar", sales: 75, revenue: 4890 },
      { month: "Apr", sales: 92, revenue: 5840 },
      { month: "May", sales: 110, revenue: 7250 },
      { month: "Jun", sales: 135, revenue: 8760 },
      { month: "Jul", sales: 162, revenue: 10450 },
      { month: "Aug", sales: 188, revenue: 12340 },
      { month: "Sep", sales: 165, revenue: 10780 },
      { month: "Oct", sales: 142, revenue: 9120 },
      { month: "Nov", sales: 98, revenue: 6230 },
      { month: "Dec", sales: 78, revenue: 4980 },
    ],
    topProducts: [
      { id: 3, name: "Agent Product 3", sales: 87, revenue: 4350 },
      { id: 7, name: "Agent Product 7", sales: 65, revenue: 3250 },
      { id: 1, name: "Agent Product 1", sales: 54, revenue: 2700 },
      { id: 9, name: "Agent Product 9", sales: 42, revenue: 2100 },
      { id: 5, name: "Agent Product 5", sales: 38, revenue: 1900 },
    ],
  }
}

export async function getAgentOrders(agentId: string) {
  // Get all products by this agent
  const { data: products, error: productsError } = await supabase.from("products").select("id").eq("agent_id", agentId)

  if (productsError) {
    console.error("Error fetching agent products:", productsError)
    return []
  }

  if (!products.length) return []

  const productIds = products.map((p) => p.id)

  // Get all order items containing these products
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select(`
      *,
      order:orders(*)
    `)
    .in("product_id", productIds)

  if (itemsError) {
    console.error("Error fetching order items:", itemsError)
    return []
  }

  // Group by order
  const orderMap = new Map()
  orderItems.forEach((item) => {
    if (!orderMap.has(item.order.id)) {
      orderMap.set(item.order.id, item.order)
    }
  })

  return Array.from(orderMap.values())
}

