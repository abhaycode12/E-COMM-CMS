
# Payment Management Module: Backend Specification

## 1. Database Schema

### Payments
```php
Schema::create('payments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained();
    $table->string('transaction_id')->nullable()->unique();
    $table->string('method'); // stripe, paypal, cod, bank_transfer
    $table->decimal('amount', 15, 2);
    $table->string('currency', 3)->default('USD');
    $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
    $table->timestamp('captured_at')->nullable();
    $table->timestamps();
});
```

### Refunds
```php
Schema::create('refunds', function (Blueprint $table) {
    $table->id();
    $table->foreignId('payment_id')->constrained();
    $table->decimal('amount', 15, 2);
    $table->text('reason')->nullable();
    $table->enum('status', ['pending', 'processed', 'failed'])->default('pending');
    $table->timestamp('processed_at')->nullable();
    $table->timestamps();
});
```

### Settlements
Aggregates completed payments for financial reconciliation.
```php
Schema::create('settlements', function (Blueprint $table) {
    $table->id();
    $table->timestamp('period_start');
    $table->timestamp('period_end');
    $table->decimal('total_gross', 15, 2);
    $table->decimal('total_refunds', 15, 2);
    $table->decimal('net_amount', 15, 2);
    $table->enum('status', ['pending', 'settled'])->default('pending');
    $table->timestamps();
});
```

## 2. Business Logic

### Refund Workflow
1. **Request**: Admin initiates a refund via `RefundController@store`.
2. **Validation**: System checks if `refund_amount <= (payment_amount - sum_of_previous_refunds)`.
3. **Execution**:
    - If method is `stripe`/`paypal`, call gateway API.
    - If success, create `Refund` record with `processed` status.
    - Update `Payment` status.
    - Update `Order` payment status to `refunded` or `partially_refunded`.
4. **Failure**: Log error and set `Refund` status to `failed`.

### Settlement Calculation
Automated via Cron job (Daily at 00:00).
- Sum `completed` payments within the timeframe.
- Subtract `processed` refunds within the same timeframe.
- Generate a PDF report and save the `Settlement` record.

## 3. APIs
- `GET /api/v1/payments`: Paginated list of all transactions.
- `POST /api/v1/payments/{payment}/refund`: Trigger a refund process.
- `GET /api/v1/settlements`: Retrieve historical settlement reports.
