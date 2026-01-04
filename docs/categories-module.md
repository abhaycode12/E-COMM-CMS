
# Category Management Module: Backend Architecture

## 1. Database Schema
`database/migrations/xxxx_xx_xx_create_categories_table.php`
```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('parent_id')->nullable();
    $table->string('name');
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->string('image_path')->nullable();
    $table->string('icon')->nullable();
    $table->boolean('is_active')->default(true);
    
    // SEO Fields
    $table->string('meta_title')->nullable();
    $table->string('meta_description')->nullable();
    
    $table->integer('sort_order')->default(0);
    $table->timestamps();

    $table->foreign('parent_id')->references('id')->on('categories')->onDelete('set null');
    $table->index(['is_active', 'parent_id']);
});
```

## 2. Category Model
`app/Models/Category.php`
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Category extends Model
{
    protected $fillable = [
        'parent_id', 'name', 'slug', 'description', 
        'image_path', 'icon', 'is_active', 
        'meta_title', 'meta_description', 'sort_order'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function parent(): BelongsTo {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order');
    }

    public function products(): HasMany {
        return $this->hasMany(Product::class);
    }

    /**
     * Scope to get only root categories
     */
    public function scopeRoots($query) {
        return $query->whereNull('parent_id');
    }
}
```

## 3. Category Controller (V1)
`app/Http/Controllers/Api/V1/CategoryController.php`
```php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Requests\V1\CategoryRequest;
use App\Http\Resources\V1\CategoryResource;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        // Fetch categories with product counts (eager loading)
        $categories = Category::withCount('products')->orderBy('sort_order')->get();
        return response()->json(CategoryResource::collection($categories));
    }

    public function tree(): JsonResponse
    {
        // Recursive tree structure for the UI
        $tree = Category::roots()->with(['children' => function($q) {
            $q->withCount('products');
        }])->withCount('products')->get();
        
        return response()->json(CategoryResource::collection($tree));
    }

    public function store(CategoryRequest $request): CategoryResource
    {
        $category = Category::create($request->validated());
        return new CategoryResource($category);
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        $category->update($request->validated());
        return new CategoryResource($category);
    }

    public function destroy(Category $category): JsonResponse
    {
        // Business Rule: Ensure we don't leave orphaned children or products
        if ($category->children()->exists()) {
            return response()->json(['message' => 'Cannot delete category with sub-categories.'], 422);
        }
        
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
```

## 4. API Routes
`routes/api.php`
```php
Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::get('categories/tree', [CategoryController::class, 'tree']);
    Route::apiResource('categories', CategoryController::class);
});
```
