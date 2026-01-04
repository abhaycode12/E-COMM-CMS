
# LuminaCommerce Laravel Migration Guide

This guide details the advanced Eloquent migration patterns for our SaaS-ready E-commerce CMS.

## Key Principles
1. **Snapshots**: `order_items` must store price and name snapshots to prevent historical data corruption when product prices change.
2. **Indexing**: Always index polymorphic columns and frequently searched slugs.
3. **JSON Fields**: Use MySQL `JSON` columns for flexible metadata (dimensions, payment payloads).

## Order Migration Example

```php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('order_number', 20)->unique();
    $table->foreignId('customer_id')->constrained();
    
    // Status tracking
    $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
    $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
    
    // Financials
    $table->decimal('total_amount', 15, 2);
    $table->decimal('tax_amount', 15, 2);
    $table->decimal('shipping_amount', 15, 2);
    $table->char('currency', 3)->default('USD');
    
    // Address snapshots
    $table->foreignId('shipping_address_id')->constrained('addresses');
    $table->foreignId('billing_address_id')->constrained('addresses');
    
    $table->text('notes')->nullable();
    $table->timestamps();
    
    // Indexes for the reporting engine
    $table->index(['status', 'created_at']);
});
```

## Inventory Tracking Logic
Instead of just a `stock` column, use an `inventory_logs` table to track stock movements (Inbound, Sale, Return, Adjustment).

```php
Schema::create('inventory_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('variant_id')->constrained('product_variants');
    $table->integer('quantity_change'); // +10 or -2
    $table->string('reason'); // 'restock', 'sale', 'adjustment'
    $table->foreignId('user_id')->nullable()->constrained(); // Who did the adjustment?
    $table->timestamps();
});
```

## Relationship Reference
- `Category` -> **HasMany** `Product`
- `Product` -> **HasMany** `ProductVariant`
- `ProductVariant` -> **HasMany** `ProductImage`
- `Order` -> **HasMany** `OrderItem`
- `Order` -> **HasOne** `Payment`
- `Order` -> **HasOne** `Shipment`
