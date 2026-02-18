# DATABASE VERSIONING & MIGRATION STRATEGY

**CRITICAL: ZERO-DOWNTIME MIGRATIONS & SCHEMA VERSIONING**

All database changes must follow these FAANG-level principles for production safety.

## 🔄 **MIGRATION VERSIONING RULES**

### **Never Modify Existing Migrations**
- ✅ **ALWAYS** create new migrations for schema changes
- ✅ **NEVER** modify existing migration files (even in development)
- ✅ Use descriptive migration names: `YYYY_MM_DD_HHMMSS_description.php`
- ✅ Include rollback logic in `down()` method
- ✅ Document breaking changes in migration comments

### **Migration Checklist**
Every migration must include:
1. ✅ **New migration file** (never edit existing)
2. ✅ **Fallback path** (reversible `down()` method)
3. ✅ **Reversible changes** (can rollback safely)
4. ✅ **Version bump notes** (if breaking change)
5. ✅ **Data migration** (if schema change affects data)

---

## 🚀 **ZERO-DOWNTIME MIGRATION PATTERNS**

### **1. Adding Columns**
```php
// ✅ GOOD: Phased approach
// Step 1: Add nullable column
Schema::table('users', function (Blueprint $table) {
    $table->string('new_field')->nullable();
});

// Step 2: Backfill data (separate migration or seeder)
// Step 3: Make required (separate migration)
Schema::table('users', function (Blueprint $table) {
    $table->string('new_field')->nullable(false)->change();
});
```

### **2. Renaming Columns**
```php
// ✅ GOOD: Add new column, migrate data, drop old
// Step 1: Add new column
Schema::table('users', function (Blueprint $table) {
    $table->string('new_name')->nullable();
});

// Step 2: Data migration (copy old → new)
// Step 3: Drop old column (separate migration)
// ❌ NEVER: Rename and drop in same migration
```

### **3. Dropping Columns**
```php
// ✅ GOOD: Phased removal
// Step 1: Mark as deprecated (code comments)
// Step 2: Stop using in application code
// Step 3: Drop column (separate migration after deployment)
// ❌ NEVER: Drop column in same migration as rename
```

### **4. Adding Indexes**
```php
// ✅ GOOD: Concurrent index creation (PostgreSQL)
// Use `->algorithm('concurrent')` for large tables
Schema::table('packages', function (Blueprint $table) {
    $table->index(['package_id', 'order'], 'idx_package_order');
});
```

### **5. Changing Column Types**
```php
// ✅ GOOD: Add new column, migrate, drop old
// ❌ NEVER: Direct type change on production data
// Always use phased approach with data migration
```

---

## 📊 **SCHEMA DEPRECATION STRATEGY**

### **Phased Rollouts**
1. **Phase 1:** Add new schema (nullable/optional)
2. **Phase 2:** Backfill data
3. **Phase 3:** Update application code
4. **Phase 4:** Make required (if needed)
5. **Phase 5:** Remove old schema (after full rollout)

### **Version Locking**
- ✅ Lock database version in `composer.json` / `package.json`
- ✅ Document required database version in README
- ✅ Include version checks in deployment scripts

### **Shadow Tables**
- Use for major schema refactors
- Create new table structure
- Sync data in background
- Switch over atomically

---

## 🔄 **DATA MIGRATION PATTERNS**

### **1. JSON → Normalized Tables**
```php
// Pattern: Extract JSON → Create records → Create relationships
public function up(): void {
    // 1. Create new tables
    Schema::create('activities', ...);
    Schema::create('package_activity', ...);
    
    // 2. Extract and create records
    $packages = Package::whereNotNull('activities')->get();
    foreach ($packages as $package) {
        foreach ($package->activities as $activityData) {
            $activity = Activity::firstOrCreate(['name' => $activityData['name']], ...);
            $package->activities()->attach($activity->id, ['order' => $activityData['order']]);
        }
    }
    
    // 3. Keep JSON column for backward compatibility (remove later)
}
```

### **2. Merging Tables**
```php
// Pattern: Create new table → Migrate data → Update foreign keys → Drop old
public function up(): void {
    // 1. Create merged table
    Schema::create('unified_content', ...);
    
    // 2. Migrate data from both tables
    DB::table('unified_content')->insert(
        DB::table('old_table_1')->select(...)->get()->toArray()
    );
    DB::table('unified_content')->insert(
        DB::table('old_table_2')->select(...)->get()->toArray()
    );
    
    // 3. Update foreign keys (separate migration)
    // 4. Drop old tables (separate migration)
}
```

### **3. Soft Deletion → Archival**
```php
// Pattern: Archive soft-deleted records → Purge after retention period
public function up(): void {
    // 1. Create archive table
    Schema::create('packages_archive', function (Blueprint $table) {
        $table->id();
        // ... same structure as packages
        $table->timestamp('archived_at');
    });
    
    // 2. Archive old soft-deletes
    $deleted = Package::onlyTrashed()
        ->where('deleted_at', '<', now()->subYear())
        ->get();
    
    foreach ($deleted as $package) {
        DB::table('packages_archive')->insert($package->toArray() + ['archived_at' => now()]);
        $package->forceDelete();
    }
}
```

### **4. Column Splitting**
```php
// Pattern: Add new columns → Migrate data → Drop old column
public function up(): void {
    // 1. Add new columns
    Schema::table('users', function (Blueprint $table) {
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
    });
    
    // 2. Migrate data
    User::chunk(100, function ($users) {
        foreach ($users as $user) {
            [$firstName, $lastName] = explode(' ', $user->name, 2);
            $user->update(['first_name' => $firstName, 'last_name' => $lastName ?? '']);
        }
    });
    
    // 3. Make required (separate migration)
    // 4. Drop old column (separate migration)
}
```

---

## 🔢 **API VERSIONING STRATEGY**

### **Version Structure**
- ✅ All APIs live under `/api/v1/` by default
- ✅ Only bump to `/api/v2/` for **breaking changes**
- ✅ Maintain previous version for deprecation period
- ✅ Document version in API responses

### **Breaking Changes (Require v2)**
- ❌ Removing fields
- ❌ Changing field types
- ❌ Changing required fields
- ❌ Changing response structure
- ❌ Removing endpoints

### **Non-Breaking Changes (Stay in v1)**
- ✅ Adding new fields (optional)
- ✅ Adding new endpoints
- ✅ Adding new query parameters
- ✅ Extending response with new data

### **Implementation**
```php
// routes/api.php
Route::prefix('v1')->group(function () {
    Route::get('/packages', [PackageController::class, 'index']);
    Route::get('/packages/{slug}', [PackageController::class, 'show']);
});

Route::prefix('v2')->group(function () {
    Route::get('/packages', [V2\PackageController::class, 'index']);
});
```

### **Deprecation Strategy**
```php
// Response headers
return response()->json($data)
    ->header('API-Version', 'v1')
    ->header('Deprecation', 'v1 will be deprecated on 2026-01-01')
    ->header('Sunset', 'v1 will be removed on 2026-06-01');
```

---

## 🚨 **BREAKING CHANGE PROTOCOL**

### **Breaking Change Definition**

A change is **breaking** if it:
- ❌ Removes a field/endpoint
- ❌ Changes field type (string → integer)
- ❌ Makes optional field required
- ❌ Changes response structure
- ❌ Removes query parameters
- ❌ Changes authentication requirements

### **Breaking Change Process**

**1. Assessment**
- Identify all affected consumers
- Document impact
- Estimate migration effort

**2. Communication**
- ✅ Announce deprecation (30+ days notice)
- ✅ Update API documentation
- ✅ Add deprecation headers
- ✅ Provide migration guide

**3. Implementation**
- ✅ Create new version (v2)
- ✅ Maintain old version (v1) during transition
- ✅ Provide both versions simultaneously
- ✅ Monitor usage of old version

**4. Sunset**
- ✅ Set sunset date (6+ months after deprecation)
- ✅ Send final warnings
- ✅ Remove old version after sunset

### **Version Bump Decision Tree**
```
Is the change breaking?
├─ NO → Stay in current version
└─ YES → Bump version
    ├─ Add new version
    ├─ Maintain old version
    ├─ Deprecate old version
    └─ Sunset after grace period
```

---

## 📜 **TEMPORAL TABLES & AUDIT LOGS**

### **Simple Audit Log**
```php
Schema::create('audit_logs', function (Blueprint $table) {
    $table->id();
    $table->string('action'); // created, updated, deleted
    $table->morphs('auditable'); // auditable_type, auditable_id
    $table->json('old_values')->nullable();
    $table->json('new_values')->nullable();
    $table->foreignId('user_id')->nullable()->constrained();
    $table->string('ip_address')->nullable();
    $table->string('user_agent')->nullable();
    $table->timestamps();
    
    $table->index(['auditable_type', 'auditable_id']);
    $table->index('created_at');
});
```

### **Model Observers**
```php
// Observer
class PackageObserver {
    public function created(Package $package): void {
        AuditLog::create([
            'action' => 'created',
            'auditable_type' => Package::class,
            'auditable_id' => $package->id,
            'new_values' => $package->toArray(),
            'user_id' => auth()->id(),
        ]);
    }
    
    public function updated(Package $package): void {
        AuditLog::create([
            'action' => 'updated',
            'auditable_type' => Package::class,
            'auditable_id' => $package->id,
            'old_values' => $package->getOriginal(),
            'new_values' => $package->getChanges(),
            'user_id' => auth()->id(),
        ]);
    }
}
```

### **Temporal Tables (PostgreSQL)**
```php
// System-versioned temporal table
Schema::create('packages_history', function (Blueprint $table) {
    $table->id();
    // ... columns
    $table->timestamp('valid_from');
    $table->timestamp('valid_to');
    
    $table->index(['id', 'valid_from', 'valid_to']);
});
```

---

## ✅ **MIGRATION BEST PRACTICES**

### **DO:**
- ✅ Always create new migrations (never edit existing)
- ✅ Use descriptive migration names
- ✅ Include `up()` and `down()` methods
- ✅ Test migrations on staging before production
- ✅ Use transactions for data integrity
- ✅ Document breaking changes
- ✅ Phase changes for zero downtime
- ✅ Monitor migration performance

### **DON'T:**
- ❌ Modify existing migration files
- ❌ Drop columns without data migration
- ❌ Make breaking changes without version bump
- ❌ Skip rollback logic
- ❌ Run untested migrations on production
- ❌ Mix schema and data changes in one migration
- ❌ Forget to backup before major migrations

---

## 🧪 **TESTING MIGRATIONS**

### **Testing Checklist**

Before deploying any migration:

1. **Test on Local:**
   ```bash
   php artisan migrate:fresh --seed
   ```

2. **Test Rollback:**
   ```bash
   php artisan migrate:rollback
   php artisan migrate
   ```

3. **Test on Staging:**
   ```bash
   # Deploy to staging
   php artisan migrate --force
   # Verify application works
   # Test rollback if needed
   ```

4. **Backup Production:**
   ```bash
   # Always backup before production migration
   mysqldump -u user -p database > backup_$(date +%Y%m%d).sql
   ```

5. **Monitor Performance:**
   - Check migration execution time
   - Monitor table locks
   - Watch for slow queries
   - Check replication lag (if applicable)

---

## 📊 **MIGRATION MONITORING**

### **Key Metrics to Track**

1. **Execution Time:** Log how long each migration takes
2. **Table Locks:** Monitor locked tables during migration
3. **Replication Lag:** Check replica delay (if using replication)
4. **Rollback Success:** Verify rollbacks work correctly
5. **Data Integrity:** Validate data after migration

### **Alerting Thresholds**

- ⚠️ Migration takes > 5 minutes
- ⚠️ Table locked > 30 seconds
- ⚠️ Replication lag > 60 seconds
- 🚨 Migration fails
- 🚨 Rollback fails
- 🚨 Data integrity check fails
