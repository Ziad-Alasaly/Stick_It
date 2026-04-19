export type StickerShape = 'circle' | 'square' | 'die-cut';
export type ProductType = 'sticker' | 'poster' | 'keyboard';

export interface StickerItem {
  id: string;
  url: string;
  file?: File;
  name: string;
  type: ProductType;
  width: number; // in cm
  height: number; // in cm
  customSize?: string;
  shape: StickerShape;
  quantity: number;
  price: number;
}

export const PRODUCT_LABELS: Record<ProductType, string> = {
  sticker: 'ستيكر عادي',
  poster: 'بوستر فني',
  keyboard: 'ستيكر كيبورد',
};

export const PRODUCT_LABELS_EN: Record<ProductType, string> = {
  sticker: 'Regular Sticker',
  poster: 'Art Poster',
  keyboard: 'Keyboard Sticker',
};

export const SHAPE_LABELS: Record<StickerShape, string> = {
  circle: 'دائري',
  square: 'مربع',
  'die-cut': 'قص خاص (Die-cut)',
};

export const SHAPE_LABELS_EN: Record<StickerShape, string> = {
  circle: 'Circle',
  square: 'Square',
  'die-cut': 'Die-cut',
};

export const calculatePrice = (type: ProductType, width: number, height: number, quantity: number): number => {
  const area = width * height;
  // New formula: sqrt(area)
  const basePrice = Math.sqrt(area);
  return Math.ceil(basePrice) * quantity;
};

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'ready' | 'delivered';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  governorate: string;
  items: StickerItem[];
  totalAmount: number;
  paymentMethod: 'vodafone' | 'cod';
  vodafoneReceiptUrl?: string; // We'll store data URL for mock
  status: OrderStatus;
  createdAt: string;
}
