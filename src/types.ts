export interface Tag {
  id: number;
  name: string;
}

export interface ProductTagLink {
  productId: number;
  tagId: number;
  tag: Tag;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  categoryId: number;

  category?: {
    id: number;
    name: string;
    slug: string;
  };
  productTags?: ProductTagLink[];
    promotionId?: number | null;
  promotion?: Promotion | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItemDto {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: Product;
}

export interface OrderDto {
  id: number;
  createdAt: string;
  status: number;
  paymentStatus: number;
  totalAmount: number;
  customer: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  items: OrderItemDto[];
}

export interface Promotion {
  id: number;
  name: string;
  discountPercent: number;
  startsAt?: string | null;
  endsAt?: string | null;
}


export interface ProductReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}
