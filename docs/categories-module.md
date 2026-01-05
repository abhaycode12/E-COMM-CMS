
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
    $table->string('meta_title', 60)->nullable();
    $table->string('meta_description', 160)->nullable();
    
    $table->integer('sort_order')->default(0);
    $table->timestamps();

    $table->foreign('parent_id')->references('id')->on('categories')->onDelete('set null');
    $table->index(['is_active', 'parent_id', 'sort_order']);
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
        'sort_order' => 'integer',
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
    
    /**
     * Scope for active storefront categories
     */
    public function scopeActive($query) {
        return $query->where('is_active', true);
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
use Illuminate\Support - Facades\Storage;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        // Fetch categories with product counts and order
        $categories = Category::withCount('products')->orderBy('sort_order')->get();
        return response()->json(CategoryResource::collection($categories));
    }

    public function tree(): JsonResponse
    {
        // Recursive tree structure for the UI
        $tree = Category::roots()->with(['children' => function($q) {
            $q->withCount('products')->orderBy('sort_order');
        }])->withCount('products')->orderBy('sort_order')->get();
        
        return response()->json(CategoryResource::collection($tree));
    }

    public function store(CategoryRequest $request): CategoryResource
    {
        $data = $request->validated();
        
        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }
        
        $category = Category::create($data);
        return new CategoryResource($category);
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($category->image_path) {
                Storage::disk('public')->delete($category->image_path);
            }
            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($data);
        return new CategoryResource($category);
    }

    public function reorder(Request $request): JsonResponse
    {
        $order = $request->input('order'); // array of IDs
        foreach($order as $index => $id) {
            Category::where('id', $id)->update(['sort_order' => $index]);
        }
        return response()->json(['message' => 'Hierarchy reordered.']);
    }

    public function toggleStatus(Category $category): JsonResponse
    {
        $category->update(['is_active' => !$category->is_active]);
        return response()->json(['message' => 'Visibility updated.', 'is_active' => $category->is_active]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->children()->exists()) {
            return response()->json(['message' => 'Cannot delete category with sub-categories.'], 422);
        }
        
        if ($category->image_path) {
            Storage::disk('public')->delete($category->image_path);
        }
        
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
```

## 4. Category Validation (SEO & Logic)
`app/Http/Requests/V1/CategoryRequest.php`
```php
return [
    'name' => 'required|string|max:255',
    'slug' => 'required|string|lowercase|unique:categories,slug,' . $this->id . '|regex:/^[a-z0-9-]+$/',
    'parent_id' => 'nullable|exists:categories,id',
    'description' => 'nullable|string',
    'meta_title' => 'nullable|string|max:60',
    'meta_description' => 'nullable|string|max:160',
    'is_active' => 'boolean',
    'image' => 'nullable|image|mimes:jpeg,png,webp|max:2048', // 2MB max
];
```
