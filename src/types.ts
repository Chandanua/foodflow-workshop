export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'customer' | 'restaurant';
}

export interface Restaurant {
  id: number;
  ownerId: number;
  name: string;
  cuisine: string;
  image: string;
  rating: number;
  deliveryTime: string;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

export interface Order {
  id: number;
  customerId: number;
  restaurantId: number;
  items: string; // JSON stringify of CartItem[]
  totalPrice: number;
  status: 'pending' | 'preparing' | 'delivered';
  createdAt: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
