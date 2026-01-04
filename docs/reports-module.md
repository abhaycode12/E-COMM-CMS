
# Reports & Analytics Engine: Enterprise Specification

## 1. Data Aggregation Engine (OLAP Pattern)

To avoid heavy runtime queries on the transactional DB, the backend uses a "Reporting Schema" or Materialized Views.

### Aggregation Schedules
- **Hourly**: Total Sales, Active Carts, Traffic.
- **Daily**: Category-wise distribution, Regional heatmaps.
- **Monthly**: Tax settlements, Profit/Loss, Cohort retention.

## 2. Business Logic & Query Filters

### SQL Aggregation Examples (Eloquent Context)
```php
// Sales by Category
$categorySales = DB::table('order_items')
    ->join('orders', 'order_items.order_id', '=', 'orders.id')
    ->join('products', 'order_items.product_id', '=', 'products.id')
    ->join('categories', 'products.category_id', '=', 'categories.id')
    ->where('orders.status', 'delivered')
    ->select('categories.name', DB::raw('SUM(order_items.total) as revenue'))
    ->groupBy('categories.id')
    ->get();
```

### Profit & Margin Logic
Profit is calculated as `Order Subtotal - COGS (Cost of Goods Sold) - Shipping Costs`. 
COGS is snapshotted in `order_items` at the time of purchase.

## 3. Export Services (Adapter Pattern)

`app/Services/Export/ReportExporter.php`
- Uses `SnappyPDF` (wkhtmltopdf) for high-fidelity PDF reports.
- Uses `Laravel Excel` (PhpSpreadsheet) for CSV/Excel generation.
- All exports are generated in the background (`ShouldQueue`) and stored in a temporary S3 bucket.

## 4. AI Business Intelligence
Gemini API is used to:
1. Identify "Underperforming Categories" based on trend data.
2. Predict "Inventory Burn Rate" for high-volume SKUs.
3. Suggest "Promotion Windows" based on regional peak traffic.

## 5. API Endpoints
- `GET /api/v1/analytics/sales`: Time-series sales data.
- `GET /api/v1/analytics/inventory`: Categories/Stock health.
- `GET /api/v1/analytics/financials`: GST/Tax and Profit reports.
- `POST /api/v1/analytics/export`: Request a report file (returns download URL or job ID).
