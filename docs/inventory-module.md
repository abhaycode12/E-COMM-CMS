
# Inventory & Warehouse Management: Backend Specification

## 1. Database Schema

### Warehouses
```php
Schema::create('warehouses', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('code')->unique(); // e.g., NYC-01
    $table->string('location')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### Warehouse Inventory (Multi-Warehouse Support)
```php
Schema::create('warehouse_inventory', function (Blueprint $table) {
    $table->id();
    $table->foreignId('warehouse_id')->constrained();
    $table->foreignId('variant_id')->constrained('product_variants');
    $table->integer('quantity')->default(0);
    $table->integer('reserved_quantity')->default(0); // For items in processing orders
    $table->integer('low_stock_threshold')->default(10);
    $table->timestamps();
    
    $table->unique(['warehouse_id', 'variant_id']);
});
```

### Inventory Logs (Audit Trail)
```php
Schema::create('inventory_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('warehouse_id')->constrained();
    $table->foreignId('variant_id')->constrained('product_variants');
    $table->foreignId('user_id')->nullable()->constrained(); // The admin who made the change
    $table->integer('change_amount'); // e.g., +50 or -2
    $table->integer('previous_stock');
    $table->integer('new_stock');
    $table->enum('reason', ['restock', 'sale', 'return', 'adjustment', 'damage', 'transfer']);
    $table->string('reference_id')->nullable(); // e.g., Order ID or Transfer ID
    $table->timestamps();
});
```

## 2. Business Logic

### Stock Deduction Workflow
1. **Order Placed**: `reserved_quantity` is increased by the ordered amount. Core `quantity` remains same.
2. **Order Shipped**: `reserved_quantity` is decreased, and `quantity` is decreased.
3. **Order Cancelled**: `reserved_quantity` is decreased.

### Low Stock Alert System
A scheduled task runs hourly to check `quantity` against `low_stock_threshold`.
- Triggers `LowStockDetected` event.
- Sends notification via Slack/Email to warehouse managers.

### Inventory Reconciliation
The system provides a "Stocktake" API where managers can submit physical counts. Differences are automatically logged as `adjustment` reasons.

## 3. APIs
- `GET /api/v1/inventory`: List inventory levels with variant and product details.
- `POST /api/v1/inventory/adjust`: Manually adjust stock levels (requires reason).
- `GET /api/v1/inventory/logs`: Audit trail for stock movements.
