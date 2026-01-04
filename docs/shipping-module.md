
# Shipping & Logistics Module: Enterprise Architecture

## 1. Database Schema

### Couriers
```php
Schema::create('couriers', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('code')->unique(); // fedex, ups, dhl, bluedart
    $table->string('api_key')->nullable();
    $table->string('api_secret')->nullable();
    $table->string('tracking_url_template'); // https://track.com/?id={{tracking_number}}
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### Shipment Tracking History
```php
Schema::create('shipment_updates', function (Blueprint $table) {
    $table->id();
    $table->foreignId('shipment_id')->constrained()->onDelete('cascade');
    $table->string('status'); // Out for delivery, In Hub, etc.
    $table->string('location')->nullable();
    $table->text('note')->nullable();
    $table->timestamp('timestamp');
});
```

## 2. Courier Integration Layer (Adapter Pattern)

We use an Interface to ensure the system can plug into any courier API.

`app/Contracts/CourierAdapterInterface.php`
```php
interface CourierAdapterInterface {
    public function createLabel(Shipment $shipment): string; // Returns PDF URL
    public function getTrackingInfo(string $trackingNumber): array;
    public function cancelShipment(string $trackingNumber): bool;
}
```

`app/Services/Logistics/FedexAdapter.php`
```php
class FedexAdapter implements CourierAdapterInterface {
    public function getTrackingInfo($trackingNumber) {
        // Call Fedex API
        // Normalize response to system format
    }
}
```

## 3. Webhooks & Background Jobs
- **Webhook Controller**: Receives real-time status updates from couriers.
- **Tracking Sync Job**: Scheduled task (Every 4 hours) to poll tracking status for all `in_transit` shipments.
- **Performance Listener**: On `shipment_delivered`, calculate delivery time and update `courier_performance` stats.

## 4. APIs
- `GET /api/v1/shipping/couriers`: List of active courier partners.
- `POST /api/v1/shipping/shipments/{id}/track`: Manual refresh of tracking data.
- `GET /api/v1/shipping/reports/performance`: Delivery success metrics by courier.
