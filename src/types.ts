export type Transmission = 'Automatic' | 'Manual';
export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid';
export type BodyType = 'Hatchback' | 'Sedan' | 'SUV';
export type SellerType = 'Dealer' | 'Private';

export interface Seller {
  name: string;
  type: SellerType;
  phone: string;
  rating: number;
  memberSince: string;
  city: string;
}

export interface Car {
  id: string;
  slug: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  mileage: number;
  city: string;
  transmission: Transmission;
  fuel: FuelType;
  engine: number;
  fuelAverage: number;
  bodyType: BodyType;
  color: string;
  seats: number;
  registeredIn: string;
  features: string[];
  description: string;
  images: string[];
  seller: Seller;
  featured: boolean;
  verified: boolean;
  condition: 'Used' | 'Certified Pre-Owned';
  dateListed: string;
  views: number;
  ownerEmail?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  joinedAt: string;
}

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface CarFilters {
  q: string;
  brand: string;
  model: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  year: string;
  transmission: string;
  fuel: string;
  bodyType: string;
  sort: string;
}
