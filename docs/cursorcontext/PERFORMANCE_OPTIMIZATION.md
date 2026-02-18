# DATABASE PERFORMANCE OPTIMIZATION

**CRITICAL: QUERY PERFORMANCE & INDEX STRATEGY**

All database design must consider performance from the start.

## 📈 **INDEX STRATEGY**

### **Basic Indexing Rules**
- ✅ Index ALL foreign keys
- ✅ Index columns used in WHERE clauses
- ✅ Index columns used in ORDER BY
- ✅ Index columns used in JOIN conditions
- ❌ Don't over-index (slows writes)
- ❌ Don't index low-cardinality columns (unless partial)

---

### **Composite Indexes**
```php
// ✅ GOOD: Composite index for common query patterns
Schema::table('packages', function (Blueprint $table) {
    // Index for: WHERE is_active = true AND is_popular = true ORDER BY views DESC
    $table->index(['is_active', 'is_popular', 'views'], 'idx_packages_active_popular_views');
});

// Use when:
// - Multiple WHERE conditions
// - ORDER BY on indexed columns
// - Covering indexes (all columns in query)
```

**Index Order Matters:**
- Put most selective column first
- Follow query WHERE clause order
- Include ORDER BY columns last

---

### **Partial Indexes (PostgreSQL)**
```php
// ✅ GOOD: Index only active records
Schema::table('packages', function (Blueprint $table) {
    $table->index(['views'], 'idx_packages_views_active')
          ->where('is_active', '=', true);
});

// Benefits:
// - Smaller index size
// - Faster queries
// - Less maintenance overhead
```

---

### **Covering Indexes**
```php
// ✅ GOOD: Include all columns needed for query
// Query: SELECT id, name, slug FROM packages WHERE is_active = true
Schema::table('packages', function (Blueprint $table) {
    $table->index(['is_active', 'id', 'name', 'slug'], 'idx_packages_covering');
});

// Benefits:
// - No table lookup needed
// - Index-only scan
// - Significant performance boost
```

---

### **Full-Text Indexes**
```php
// For search functionality
Schema::table('packages', function (Blueprint $table) {
    $table->fullText(['name', 'description'], 'packages_fulltext');
});

// Usage:
Package::whereFullText(['name', 'description'], 'search term')->get();
```

---

## 🗄️ **COLUMN TYPE BEST PRACTICES**

### **VARCHAR vs TEXT**
- ✅ **VARCHAR(n):** When max length is known (e.g., `slug`, `email`, `name`)
- ✅ **TEXT:** When length is unbounded (e.g., `description`, `content`, `bio`)
- ✅ **JSON:** For structured, non-queryable data
- ❌ Don't use VARCHAR(255) for everything

```php
Schema::table('packages', function (Blueprint $table) {
    $table->string('slug', 100);           // Max 100 chars
    $table->string('name', 200);           // Max 200 chars
    $table->text('description');           // Unbounded
    $table->json('metadata')->nullable();  // Structured data
});
```

---

### **ENUM vs Lookup Tables**
```php
// ✅ GOOD: Lookup table for queryable, extensible data
Schema::create('difficulty_levels', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique();
    $table->string('slug')->unique();
});

// Use ENUM only when:
// - Values are truly fixed (never change)
// - Never need to query by enum
// - Performance is absolutely critical
```

---

### **Integer Types**
- ✅ `TINYINT`: 0-255 (e.g., `age`, `order`, `status`)
- ✅ `SMALLINT`: -32,768 to 32,767 (e.g., `year`)
- ✅ `INT`: Standard integers (e.g., `quantity`, `count`)
- ✅ `BIGINT`: IDs, large numbers (e.g., `user_id`, `views`)
- ✅ `UNSIGNED`: When negative values impossible

```php
Schema::table('bookings', function (Blueprint $table) {
    $table->unsignedTinyInteger('status')->default(0);     // 0-255
    $table->unsignedSmallInteger('year')->default(2025);   // 0-65535
    $table->unsignedInteger('views')->default(0);          // 0-4 billion
    $table->unsignedBigInteger('user_id');                 // Foreign key
});
```

---

### **Decimal Types**
- ✅ `DECIMAL(10, 2)`: Money, prices (exact precision)
- ✅ `FLOAT/DOUBLE`: Scientific data (approximate, faster)

```php
Schema::table('packages', function (Blueprint $table) {
    $table->decimal('price', 10, 2);       // £999,999.99 max
    $table->decimal('discount', 5, 2);     // Percentage: 100.00 max
});
```

---

## 🔍 **QUERY OPTIMIZATION**

### **N+1 Query Problem**

**❌ BAD: N+1 queries**
```php
// 1 query to get packages
$packages = Package::all();

// N queries (one per package)
foreach ($packages as $package) {
    echo $package->trainer->name;  // Query per package!
}
```

**✅ GOOD: Eager loading**
```php
// 2 queries total (1 for packages, 1 for trainers)
$packages = Package::with('trainer')->get();

foreach ($packages as $package) {
    echo $package->trainer->name;  // No additional query
}
```

**✅ EVEN BETTER: Nested eager loading**
```php
Package::with(['trainer', 'activities.trainers'])->get();
```

---

### **Select Only Needed Columns**

**❌ BAD: Select all columns**
```php
Package::all();  // SELECT * FROM packages
```

**✅ GOOD: Select specific columns**
```php
Package::select(['id', 'name', 'slug', 'price'])->get();
// SELECT id, name, slug, price FROM packages
```

**Benefits:**
- Less data transferred
- Less memory usage
- Faster queries
- Can use covering indexes

---

### **Chunking Large Datasets**

**❌ BAD: Load all records into memory**
```php
$packages = Package::all();  // Could be millions of records!
foreach ($packages as $package) {
    // Process
}
```

**✅ GOOD: Process in chunks**
```php
Package::chunk(100, function ($packages) {
    foreach ($packages as $package) {
        // Process
    }
});
```

**✅ EVEN BETTER: Lazy collections**
```php
Package::lazy()->each(function ($package) {
    // Process one at a time
});
```

---

### **Query Caching**

**Application-Level Caching:**
```php
// Cache query results
$packages = Cache::remember('packages.all', 3600, function () {
    return Package::with('trainer')->get();
});
```

**Database Query Cache (MySQL):**
```php
// Enable query cache in my.cnf
query_cache_type = 1
query_cache_size = 64M
```

---

### **Using EXPLAIN**

**Analyze query performance:**
```php
// Laravel
DB::listen(function ($query) {
    Log::info($query->sql);
    Log::info($query->bindings);
    Log::info($query->time);
});

// Raw SQL
EXPLAIN SELECT * FROM packages WHERE is_active = true;
```

**Look for:**
- ✅ `type: ref` or `const` (good)
- ❌ `type: ALL` (full table scan - bad)
- ✅ `key: idx_name` (using index)
- ❌ `key: NULL` (not using index)
- ✅ `rows: 10` (few rows scanned)
- ❌ `rows: 10000` (many rows scanned)

---

## 📊 **INDEX MAINTENANCE**

### **Monitoring Index Usage**

**Check unused indexes:**
```sql
-- MySQL
SELECT * FROM sys.schema_unused_indexes;

-- PostgreSQL
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
```

**Check index size:**
```sql
-- MySQL
SELECT 
    table_name,
    index_name,
    ROUND(stat_value * @@innodb_page_size / 1024 / 1024, 2) AS size_mb
FROM mysql.innodb_index_stats
WHERE stat_name = 'size'
ORDER BY stat_value DESC;
```

---

### **Rebuilding Indexes**

**When to rebuild:**
- After bulk inserts/updates
- Index fragmentation > 30%
- Performance degradation

**How to rebuild:**
```sql
-- MySQL
OPTIMIZE TABLE packages;

-- PostgreSQL
REINDEX TABLE packages;
```

---

## 🚀 **QUERY PERFORMANCE TIPS**

### **1. Use Exists Instead of Count**

**❌ SLOW:**
```php
if (Package::where('slug', $slug)->count() > 0) {
    // ...
}
```

**✅ FAST:**
```php
if (Package::where('slug', $slug)->exists()) {
    // ...
}
```

---

### **2. Use Limit for Top N Queries**

**❌ SLOW:**
```php
$packages = Package::orderBy('views', 'desc')->get()->take(10);
```

**✅ FAST:**
```php
$packages = Package::orderBy('views', 'desc')->limit(10)->get();
```

---

### **3. Use whereBetween Instead of Multiple Conditions**

**❌ SLOW:**
```php
Package::where('price', '>=', 100)
       ->where('price', '<=', 500)
       ->get();
```

**✅ FAST:**
```php
Package::whereBetween('price', [100, 500])->get();
```

---

### **4. Use pluck() Instead of get() for Single Column**

**❌ SLOW:**
```php
$names = Package::all()->pluck('name');
```

**✅ FAST:**
```php
$names = Package::pluck('name');
```

---

### **5. Use Raw Queries for Complex Aggregations**

**When Laravel query builder is inefficient:**
```php
$results = DB::table('bookings')
    ->select(DB::raw('DATE(created_at) as date, COUNT(*) as count'))
    ->groupBy('date')
    ->get();
```

---

## 📈 **PERFORMANCE MONITORING**

### **Slow Query Log**

**Enable slow query log (MySQL):**
```ini
# my.cnf
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 1  # Log queries > 1 second
```

**Analyze slow queries:**
```bash
mysqldumpslow /var/log/mysql/slow-query.log
```

---

### **Query Performance Metrics**

**Track these KPIs:**
1. **Query Execution Time:** Average, P50, P95, P99
2. **Queries Per Second:** QPS by endpoint
3. **Slow Queries:** Count and frequency
4. **Cache Hit Rate:** % of queries served from cache
5. **Index Usage:** % of queries using indexes
6. **Connection Pool:** Active connections, wait time

**Alert Thresholds:**
- ⚠️ Query execution time > 100ms (P95)
- ⚠️ Slow queries > 10/minute
- ⚠️ Cache hit rate < 80%
- 🚨 Query execution time > 1s
- 🚨 Slow queries > 50/minute
- 🚨 Cache hit rate < 50%

---

## 🔧 **OPTIMIZATION CHECKLIST**

Before deploying any query:

- [ ] Eager load relationships (prevent N+1)
- [ ] Select only needed columns
- [ ] Use appropriate indexes
- [ ] Test with production-sized dataset
- [ ] Run EXPLAIN to check execution plan
- [ ] Set reasonable LIMIT for list queries
- [ ] Use chunking for large datasets
- [ ] Cache expensive queries
- [ ] Monitor query performance
- [ ] Set slow query alerts

---

## 🎯 **PERFORMANCE TARGETS**

### **Query Response Times:**
- ✅ Simple queries (single table): < 10ms
- ✅ Medium queries (1-2 joins): < 50ms
- ✅ Complex queries (3+ joins): < 200ms
- ⚠️ Very complex queries: < 500ms
- 🚨 Any query > 1s needs optimization

### **Database Metrics:**
- ✅ Cache hit rate: > 95%
- ✅ Index usage: > 90%
- ✅ Connection pool usage: < 80%
- ✅ Queries per second: Depends on hardware
- ✅ Average query time: < 50ms

---

## 💡 **COMMON ANTI-PATTERNS**

### **❌ DON'T:**
1. Use `SELECT *` in production
2. Query in loops (N+1 problem)
3. Load entire tables into memory
4. Use LIKE '%search%' without index
5. Over-normalize (too many joins)
6. Under-index (missing foreign keys)
7. Over-index (every column indexed)
8. Ignore slow query log
9. Skip EXPLAIN analysis
10. Use ORM for complex aggregations

### **✅ DO:**
1. Select specific columns
2. Eager load relationships
3. Use chunking/lazy collections
4. Use full-text search for text queries
5. Balance normalization vs performance
6. Index strategically (foreign keys, WHERE, ORDER BY)
7. Monitor and remove unused indexes
8. Review slow query log regularly
9. Always EXPLAIN before deploying
10. Use raw SQL for complex queries when needed
