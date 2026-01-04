
# Advanced Product Management: Backend Specification

## 1. Database Schema

### Products
```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->foreignId('category_id')->constrained();
    $table->string('name');
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->string('brand')->nullable();
    $table->string('hsn_code')->nullable();
    $table->decimal('gst_percentage', 5, 2)->default(18.00);
    $table->enum('status', ['active', 'draft', 'archived', 'out_of_stock'])->default('draft');
    $table->string('meta_title')->nullable();
    $table->text('meta_description')->nullable();
    $table->timestamps();
});
```

### Variants
```php
Schema::create('product_variants', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->onDelete('cascade');
    $table->string('sku')->unique();
    $table->string('barcode')->nullable()->unique();
    $table->decimal('price', 15, 2);
    $table->decimal('compare_at_price', 15, 2)->nullable();
    $table->integer('stock_quantity')->default(0);
    $table->decimal('weight', 8, 2)->nullable();
    $table->json('attributes'); // e.g. {"color": "Blue", "size": "L"}
    $table->timestamps();
});
```

### Images & Media
```php
Schema::create('product_images', function (Blueprint $table) {
    $table->id();
    $table->foreignId('product_id')->constrained()->onDelete('cascade');
    $table->string('path');
    $table->boolean('is_primary')->default(false);
    $table->integer('sort_order')->default(0);
});
```

## 2. CSV Import/Export Logic
`app/Services/ProductExportService.php`
```php
public function export()
{
    $products = Product::with('variants', 'category')->get();
    // Logic to generate CSV buffer
    return $csv;
}

public function import($file)
{
    // Chunked processing for SaaS scalability
    Excel::filter('chunk')->load($file)->chunk(250, function($results) {
        foreach($results as $row) {
            Product::updateOrCreate(['slug' => $row->slug], [...]);
        }
    });
}
```

## 3. Image Handling
Images are stored via Laravel MediaLibrary or S3.
- `POST /api/v1/products/{id}/images`: Accepts multipart/form-data.
- Primary image is automatically updated if `is_primary` is passed as true.
