
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export type PaymentMethodType = 'credit_card' | 'paypal' | 'bank_transfer' | 'cod' | 'stripe';

// RBAC Types
export type ActionType = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';
export type ModuleType = 'users' | 'roles' | 'products' | 'categories' | 'orders' | 'customers' | 'payments' | 'reports' | 'settings' | 'content';

export interface Permission {
  id: string;
  module: ModuleType;
  action: ActionType;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  is_active: boolean;
  permissions: string[]; // Array of permission IDs
  created_at: string;
}

export interface UserPermissionOverride {
  permission_id: string;
  is_allowed: boolean;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  role_at_time: string;
  module: ModuleType | 'auth';
  action: string;
  old_data?: any;
  new_data?: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole; // Default primary role
  roles: string[]; // Assigned Role IDs for multi-role support
  avatar?: string;
  permissions: string[]; // Merged permission IDs (Inherited + Overrides)
  overrides: UserPermissionOverride[];
  last_login?: string;
}

export type UserRole = 'super-admin' | 'admin' | 'manager' | 'support' | 'warehouse';

export interface AIIntent {
  action: 'SEARCH' | 'REPORT' | 'PREDICT' | 'NAVIGATE' | 'CONTENT' | 'UNKNOWN';
  params: Record<string, any>;
  confidence: number;
  reasoning: string;
}

export interface CommandResponse {
  message: string;
  data?: any;
  suggestions?: string[];
  viewToOpen?: string;
}

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft' | 'archived';
  meta_title?: string;
  meta_description?: string;
  last_updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  position: 'hero_main' | 'sub_banner' | 'footer_promo';
  status: 'active' | 'inactive';
  sort_order: number;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'push';
  subject?: string;
  body: string;
  variables: string[];
  purpose: 'transactional' | 'marketing';
}

export interface Payment {
  id: string;
  order_id: string;
  order_number: string;
  transaction_id?: string;
  method: PaymentMethodType;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  captured_at?: string;
  created_at: string;
}

export interface Refund {
  id: string;
  payment_id: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processed' | 'failed';
  processed_at?: string;
  created_at: string;
}

export interface Settlement {
  id: string;
  period_start: string;
  period_end: string;
  total_gross: number;
  total_refunds: number;
  net_amount: number;
  status: 'pending' | 'settled';
}

export interface Courier {
  id: string;
  name: string;
  code: string;
  api_key?: string;
  is_active: boolean;
  tracking_url_template: string;
  contact_number?: string;
}

export interface ShipmentUpdate {
  id: string;
  shipment_id: string;
  status: string;
  location?: string;
  note?: string;
  timestamp: string;
}

export interface LogisticsReport {
  id: string;
  courier_id: string;
  courier_name: string;
  total_shipments: number;
  avg_delivery_days: number;
  success_rate: number;
  failed_delivery_count: number;
}

export interface SalesAnalyticsItem {
  date: string;
  revenue: number;
  orders: number;
  aov: number;
  profit: number;
}

export interface CategorySalesPerformance {
  category: string;
  revenue: number;
  units: number;
  margin: number;
}

export interface GeographicPerformance {
  region: string;
  city: string;
  orders: number;
  revenue: number;
}

export interface TaxReportLine {
  hsn: string;
  taxable_value: number;
  gst_rate: number;
  igst: number;
  cgst: number;
  sgst: number;
  total_tax: number;
}

export interface SystemSettings {
  store_name: string;
  store_email: string;
  currency: string;
  timezone: string;
  maintenance_mode: boolean;
  api_keys: {
    stripe_publishable?: string;
    stripe_secret?: string;
    google_maps?: string;
  }
}

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  name: string;
  sku: string;
  quantity: number;
  shipped_quantity: number;
  returned_quantity: number;
  price: number;
  tax_amount: number;
  total: number;
}

export interface Shipment {
  id: string;
  shipment_number: string;
  courier_id: string;
  courier_name: string;
  tracking_number: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed_attempt' | 'returned';
  shipped_at?: string;
  delivered_at?: string;
  items: { order_item_id: string; quantity: number }[];
  updates: ShipmentUpdate[];
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  date: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  items: OrderItem[];
  shipments: Shipment[];
  shipping_address: Address;
  billing_address: Address;
  timeline: { status: OrderStatus; timestamp: string; note?: string }[];
}

export interface BulkPricing {
  id: string;
  min_quantity: number;
  discount_price: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode?: string;
  price: number;
  compare_at_price?: number;
  stock_quantity: number;
  weight?: number;
  attributes: Record<string, string>;
  bulk_pricing?: BulkPricing[];
}

export interface ProductImage {
  id: string;
  path: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name?: string;
  brand?: string;
  status: 'live' | 'draft' | 'archived' | 'out_of_stock';
  description: string;
  short_description?: string;
  hsn_code?: string;
  gst_percentage?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  meta_title?: string;
  meta_description?: string;
}

export interface InventoryLog {
  id: string;
  sku: string;
  product_name: string;
  change: number;
  previous_stock: number;
  new_stock: number;
  reason: 'restock' | 'sale' | 'return' | 'adjustment' | 'damage';
  user_name: string;
  created_at: string;
  warehouse_name: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  parent_id?: string;
  name: string;
  slug: string;
  description?: string;
  image_path?: string;
  icon?: string;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  product_count: number;
  sort_order: number;
  children?: Category[];
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  is_default: boolean;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface CustomerNote {
  id: string;
  admin_id: string;
  admin_name: string;
  note: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  is_blocked: boolean;
  total_orders: number;
  lifetime_value: number;
  is_repeat_customer: boolean;
  joined_at: string;
  last_order_at?: string;
  addresses: Address[];
  notes: CustomerNote[];
}
