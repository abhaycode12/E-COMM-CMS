
# LuminaCommerce Enterprise RBAC & Audit System

## 1. Multi-Level Architecture

The system uses a 3-tier permission resolution stack:
1. **User Overrides**: Explicit `is_allowed` (true/false) entries for a specific user.
2. **Role Permissions**: Permissions merged from all roles assigned to the user.
3. **Default Deny**: If no rule exists, access is prohibited.

### Database Schema Expansion

```php
Schema::create('roles', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->string('display_name');
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});

Schema::create('permissions', function (Blueprint $table) {
    $table->id();
    $table->string('module'); // products, orders, etc.
    $table->string('action'); // view, create, edit, delete, approve, export
    $table->string('name')->unique(); // e.g., products.edit
    $table->timestamps();
});

Schema::create('role_permission', function (Blueprint $table) {
    $table->foreignId('role_id')->constrained();
    $table->foreignId('permission_id')->constrained();
});

Schema::create('user_permission_overrides', function (Blueprint $table) {
    $table->foreignId('user_id')->constrained();
    $table->foreignId('permission_id')->constrained();
    $table->boolean('is_allowed'); // true to explicitly allow, false to explicitly block
});

Schema::create('audit_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained();
    $table->string('role_at_time');
    $table->string('module');
    $table->string('action');
    $table->json('old_data')->nullable();
    $table->json('new_data')->nullable();
    $table->string('ip_address', 45);
    $table->string('user_agent');
    $table->timestamps();
});
```

## 2. Permission Resolution Logic

The merged permission set for a user is calculated as:

```php
// Backend (Laravel Policy Example)
public function check(User $user, $permissionName) {
    // 1. Check Overrides
    $override = $user->overrides()->where('name', $permissionName)->first();
    if ($override) return $override->is_allowed;

    // 2. Check Roles
    return $user->roles()->whereHas('permissions', function($q) use ($permissionName) {
        $q->where('name', $permissionName);
    })->exists();
}
```

## 3. Audit Logging Strategy

Every state-changing request (`POST`, `PUT`, `PATCH`, `DELETE`) must be intercepted by the `AuditMiddleware`.

- **Context Capture**: Logs the `user_id`, `ip`, and the `role` they were acting as.
- **Data Drift**: Captures the request payload (new data) and the existing model state (old data) to provide a "diff" view for Super Admins.
- **Immutable Entry**: Audit logs cannot be deleted or edited via the CMS UI.

## 4. UI Enforcement

Frontend components should use a `useAuth` hook:

```tsx
const { can } = useAuth();

{can('products.edit') && (
  <button onClick={handleEdit}>Edit Product</button>
)}
```

## 5. Caching & Invalidation

- Permissions are cached in Redis per user (`user_perms_{id}`).
- Cache is automatically cleared whenever:
    - A Role is updated.
    - User roles are reassigned.
    - A User Override is created/deleted.
