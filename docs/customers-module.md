
# Customer Management Module: Backend Specification

## 1. Database Schema

### Customers
```php
Schema::create('customers', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('phone')->nullable();
    $table->string('password');
    $table->string('avatar')->nullable();
    $table->boolean('is_blocked')->default(false);
    $table->decimal('lifetime_value', 15, 2)->default(0.00);
    $table->integer('total_orders')->default(0);
    $table->timestamp('last_order_at')->nullable();
    $table->timestamps();
});
```

### Addresses
```php
Schema::create('addresses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('customer_id')->constrained()->onDelete('cascade');
    $table->enum('type', ['shipping', 'billing']);
    $table->boolean('is_default')->default(false);
    $table->string('full_name');
    $table->string('phone');
    $table->string('address_line1');
    $table->string('address_line2')->nullable();
    $table->string('city');
    $table->string('state');
    $table->string('zip_code');
    $table->string('country');
    $table->timestamps();
});
```

### Customer Notes (Internal)
```php
Schema::create('customer_notes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('customer_id')->constrained()->onDelete('cascade');
    $table->foreignId('user_id')->constrained(); // Admin who wrote the note
    $table->text('note');
    $table->timestamps();
});
```

## 2. Business Logic & Analytics

### Lifetime Value (LTV) Calculation
LTV is updated asynchronously via a `Job` triggered by `OrderPlaced` or `OrderCancelled` events.
```php
public function updateLTV(Customer $customer)
{
    $customer->lifetime_value = $customer->orders()
        ->where('status', 'delivered')
        ->sum('total_amount');
    $customer->total_orders = $customer->orders()
        ->where('status', 'delivered')
        ->count();
    $customer->save();
}
```

### Repeat Customer Detection
A repeat customer is defined as any customer with more than 1 successful order.
```php
public function isRepeatCustomerAttribute()
{
    return $this->total_orders > 1;
}
```

### Controller Logic (V1)
`app/Http/Controllers/Api/V1/CustomerController.php`
```php
public function index(Request $request)
{
    return Customer::query()
        ->when($request->search, function($q, $search) {
            $q->where('name', 'like', "%$search%")
              ->orWhere('email', 'like', "%$search%");
        })
        ->withCount('orders')
        ->paginate();
}

public function block(Customer $customer)
{
    $customer->update(['is_blocked' => true]);
    return response()->json(['message' => 'Customer blocked']);
}
```
