
# LuminaCommerce Auth & RBAC Implementation

## 1. Database Migrations

### Users & RBAC Tables
```php
Schema::create('roles', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique(); // super-admin, admin, manager, support
    $table->string('display_name');
    $table->timestamps();
});

Schema::create('permissions', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique(); // products.create, orders.delete, etc.
    $table->string('module');
    $table->timestamps();
});

Schema::create('role_permission', function (Blueprint $table) {
    $table->foreignId('role_id')->constrained()->onDelete('cascade');
    $table->foreignId('permission_id')->constrained()->onDelete('cascade');
});

Schema::create('user_role', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('role_id')->constrained()->onDelete('cascade');
});
```

### Audit & History Tables
```php
Schema::create('login_histories', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained();
    $table->string('ip_address', 45);
    $table->string('user_agent');
    $table->timestamp('login_at');
});

Schema::create('activity_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained();
    $table->string('action'); // created_product, updated_order
    $table->string('model_type');
    $table->unsignedBigInteger('model_id');
    $table->json('payload')->nullable();
    $table->timestamps();
});
```

## 2. Middleware Implementation
`app/Http/Middleware/CheckPermission.php`
```php
public function handle($request, Closure $next, $permission)
{
    if (!auth()->user()->hasPermissionTo($permission)) {
        return response()->json(['message' => 'Unauthorized Action'], 403);
    }
    return $next($request);
}
```

## 3. API Routes (v1)
`routes/api.php`
```php
Route::prefix('v1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        
        // Protected Module Routes
        Route::middleware('permission:products.view')->group(function () {
            Route::apiResource('products', ProductController::class);
        });
    });
});
```
