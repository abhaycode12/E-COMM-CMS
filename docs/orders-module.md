
# Order Management Module: Enterprise Specification

## 1. Database Schema

### Orders
```php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('order_number')->unique();
    $table->foreignId('customer_id')->constrained();
    $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])->default('pending');
    $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
    
    $table->decimal('subtotal', 15, 2);
    $table->decimal('tax', 15, 2);
    $table->decimal('shipping_cost', 15, 2);
    $table->decimal('discount', 15, 2)->default(0);
    $table->decimal('total', 15, 2);
    
    $table->json('shipping_address');
    $table->json('billing_address');
    $table->timestamps();
});
```

### Order Items (Snapshots)
```php
Schema::create('order_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->onDelete('cascade');
    $table->foreignId('product_id')->nullable();
    $table->foreignId('variant_id')->nullable();
    $table->string('name'); // Snapshot
    $table->string('sku');  // Snapshot
    $table->integer('quantity');
    $table->integer('shipped_quantity')->default(0);
    $table->integer('returned_quantity')->default(0);
    $table->decimal('price', 15, 2);
    $table->decimal('tax_amount', 15, 2);
    $table->decimal('total', 15, 2);
    $table->timestamps();
});
```

### Shipments (Partial Support)
```php
Schema::create('shipments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained();
    $table->string('shipment_number')->unique();
    $table->string('courier_name');
    $table->string('tracking_number')->nullable();
    $table->enum('status', ['pending', 'in_transit', 'delivered'])->default('pending');
    $table->timestamp('shipped_at')->nullable();
    $table->timestamps();
});

Schema::create('shipment_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('shipment_id')->constrained()->onDelete('cascade');
    $table->foreignId('order_item_id')->constrained();
    $table->integer('quantity');
});
```

## 2. Status Workflow Logic

### Order Transition Matrix
- `pending` -> `processing`: Admin verifies inventory.
- `processing` -> `shipped`: Triggered when at least one shipment is created.
- `shipped` -> `delivered`: Triggered via Courier Webhook or manual update.
- `any` -> `cancelled`: Only if not shipped.

### Events & Listeners
- `OrderCreated`: Sends confirmation email, reduces "reserved" stock.
- `ShipmentCreated`: Sends tracking URL to customer.
- `OrderDelivered`: Updates Customer LTV, triggers "Ask for Review" email.

## 3. Controller Logic (Partial Shipping)
`app/Http/Controllers/Api/V1/OrderShipmentController.php`
```php
public function store(Request $request, Order $order)
{
    // Validate that items chosen for shipment don't exceed remaining quantity
    // Create Shipment record
    // Update order_items.shipped_quantity
    // Update Order status to 'shipped' (if all or partial items are out)
}
```
