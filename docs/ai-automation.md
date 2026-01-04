
# AI-Ready Automation & Intent Schema

## 1. Intent Matrix

The Lumina CMS uses Gemini to map natural language to internal actions.

| Intent | Sample Command | Parameters Extracted | System Action |
| :--- | :--- | :--- | :--- |
| `SEARCH` | "Find red jackets" | `query`, `category` | Product lookup + View switch |
| `REPORT` | "Monthly sales PDF" | `format`, `period` | Trigger Report Job |
| `PREDICT` | "When is stock out?" | `sku`, `warehouse` | Timeseries Forecast |
| `NAVIGATE` | "Go to analytics" | `target` | UI Context Switch |
| `CONTENT` | "Write order email" | `template`, `context` | Template Editor Helper |

## 2. Automation Service Layer

Our `AutomationService` (Laravel) listens for specific AI intents to trigger heavy background jobs.

### Auto-Report Generation Hook
```php
public function handleReportIntent(AIIntent $intent) {
    $report = ReportJob::dispatch($intent->params);
    $this->notifyUser("Your {$intent->params['type']} is being compiled.");
}
```

### Low Stock Predictive Hook
Runs daily. If `burn_rate * lead_time > current_stock`, it automatically creates a Draft Purchase Order.

## 3. UI Command Center (CMD+K)

A global search bar that handles:
1. **Direct Navigation**: "go to orders"
2. **Global Search**: "marcus customer"
3. **Complex Queries**: "how many orders from seattle last week?"

## 4. Example AI Responses

- **Input**: "How is my electronics category doing?"
- **AI reasoning**: Action: `REPORT`, Params: `{category: "electronics"}`
- **System Action**: Fetch category performance data.
- **AI Response**: "Electronics is your best performer this month with 45% margin, though stock for Laptops is low."
