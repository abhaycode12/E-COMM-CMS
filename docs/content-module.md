
# CMS Content Module: Backend Specification

## 1. Database Migrations

### Pages
```php
Schema::create('cms_pages', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->string('slug')->unique();
    $table->longText('content');
    $table->enum('status', ['published', 'draft', 'archived'])->default('draft');
    $table->string('meta_title')->nullable();
    $table->string('meta_description')->nullable();
    $table->timestamps();
});
```

### Banners
```php
Schema::create('banners', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->string('image_url');
    $table->string('link_url')->nullable();
    $table->enum('position', ['hero_main', 'sub_banner', 'footer_promo']);
    $table->enum('status', ['active', 'inactive'])->default('active');
    $table->integer('sort_order')->default(0);
    $table->timestamps();
});
```

### Communication Templates
```php
Schema::create('communication_templates', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->enum('channel', ['email', 'sms', 'push']);
    $table->string('subject')->nullable();
    $table->text('body');
    $table->json('variables'); // List of allowed variables like ["customer_name", "order_id"]
    $table->enum('purpose', ['transactional', 'marketing'])->default('transactional');
    $table->timestamps();
});
```

## 2. Controllers & Logic

### PageController
- `index()`: Returns all pages with pagination.
- `store()`: Validates slug uniqueness and creates a page.
- `update()`: Updates page content and metadata.

### BannerController
- `index()`: Returns active banners grouped by position.
- `reorder()`: Updates `sort_order` for a collection of banners.

### TemplateController
- `preview()`: Replaces template variables with mock data and returns HTML/Text preview.
- `sendTest()`: Triggers a test email/SMS to an admin user.

## 3. API Endpoints
- `GET /api/v1/content/pages`: List all static pages.
- `GET /api/v1/content/banners`: Fetch active storefront banners.
- `GET /api/v1/content/templates`: List communication templates.
- `POST /api/v1/content/templates/{id}/preview`: Generate a variable-populated preview.
