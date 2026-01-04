
# LuminaCommerce Backend: Enterprise Design Pattern

## 1. Directory Structure

| Folder | Responsibility |
| :--- | :--- |
| `app/Contracts` | Interfaces for Repositories and Services. Enables easy mocking for Unit Tests. |
| `app/Repositories` | Abstracted data layer. Handles all DB queries via Eloquent. |
| `app/Services` | Core business logic. Orchestrates repositories and handles external API integrations. |
| `app/Http/Requests` | Input validation and authorization before reaching the controller. |
| `app/Http/Resources` | Defines the API response shape. Decouples DB columns from JSON keys. |
| `app/Events & Listeners` | Decouples main flows from side effects (e.g. sending emails). |
| `app/Jobs` | Heavy processing tasks handled in the background (Queues). |

## 2. API Implementation Example (V1)

### Controller Implementation
`app/Http/Controllers/Api/V1/OrderController.php`
```php
public function store(StoreOrderRequest $request, ICheckoutService $checkout)
{
    // Controller is thin: it just passes validated data to the service
    $order = $checkout->processOrder($request->validated(), auth()->user());
    
    return new OrderResource($order);
}
```

### Service Implementation
`app/Services/CheckoutService.php`
```php
public function processOrder(array $data, User $user): Order
{
    return DB::transaction(function () use ($data, $user) {
        $order = $this->orderRepo->create([...]);
        
        // Complex logic handled here
        $this->inventoryService->reduceStock($data['items']);
        
        // Trigger async side effects
        event(new OrderPlaced($order));
        
        return $order;
    });
}
```

## 3. RBAC System
We implement a Permission-based system where Roles are collections of Permissions.
- **Admin**: Full access.
- **Manager**: View reports, manage products, cannot delete users.
- **Warehouse**: Update stock and shipments only.

```php
// Usage in Controller or Middleware
if ($user->can('manage-inventory')) {
    // Proceed
}
```

## 4. Queue & Event Strategy
- **Queue Driver**: Redis (Production), Database (Development).
- **Critical Tasks**: Stock updates happen synchronously.
- **Non-Critical Tasks**: Email receipts, courier API calls, and PDF invoice generation are pushed to the `default` and `high` priority queues.
