<?php

// routes/web.php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\ReadingSessionController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\Reports\ReportController;
use App\Http\Controllers\Reports\SalesReportController;
use App\Http\Controllers\Reports\InventoryReportController;
use App\Http\Controllers\Reports\CustomerReportController;
use App\Http\Controllers\Reports\EmployeeReportController;
use App\Http\Controllers\Reports\ExportController;

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Welcome/Welcome');
})->name('welcome');

// ── Protected routes ─────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class , 'index'])->name('dashboard');
    Route::get('/dashboard/stats', [DashboardController::class , 'stats'])->name('dashboard.stats');

    // ── Notifications ──
    Route::prefix('notifications')->group(function () {
        Route::get('/', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/mark-read', [\App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('notifications.mark-read');
        Route::delete('/', [\App\Http\Controllers\NotificationController::class, 'clear'])->name('notifications.clear');
    });

    // ── POS Terminal ──
    Route::get('/pos', [POSController::class , 'index'])->name('pos.index');
    Route::get('/pos/invoice/{order_number}', [POSController::class , 'getInvoice'])->name('pos.invoice');
    Route::post('/pos/refund', [POSController::class , 'processRefund'])->name('pos.refund');
    // Alternative / fallback plain Inertia route (only use one of the two above)
    // Route::get('/pos', function () {
    //     return Inertia::render('POS/POSTerminal');
    // })->name('pos.terminal');

    // ── Sales & Returns ──
    Route::prefix('sales')->group(function () {
            Route::get('/', [SaleController::class , 'index'])->name('sales.index');
            Route::post('/', [SaleController::class , 'store'])->name('sales.store');
            Route::patch('/{order}', [SaleController::class , 'update'])->name('sales.update');
            Route::delete('/{order}', [SaleController::class , 'destroy'])->name('sales.destroy');

            Route::post('/returns', [SaleController::class , 'storeReturn'])->name('sales.returns.store');
            Route::patch('/returns/{orderReturn}', [SaleController::class , 'updateReturn'])->name('sales.returns.update');
        }
        );

        // ── Product Management ──
        Route::prefix('products')->group(function () {
            Route::get('/', [ProductController::class , 'index'])->name('products.index');
            Route::post('/', [ProductController::class , 'store'])->name('products.store');
            Route::get('/{product}', [ProductController::class , 'show'])->name('products.show');
            Route::put('/{product}', [ProductController::class , 'update'])->name('products.update');
            Route::delete('/{product}', [ProductController::class , 'destroy'])->name('products.destroy');

            Route::post('/{product}/stock', [ProductController::class , 'adjustStock'])->name('products.stock');
            Route::get('/low-stock', [ProductController::class , 'lowStock'])->name('products.low-stock');
            Route::get('/stats', [ProductController::class , 'stats'])->name('products.stats');
        });

        // ── Supplier Management ──
        Route::prefix('suppliers')->group(function () {
            Route::get('/', [\App\Http\Controllers\SupplierController::class, 'index'])->name('suppliers.index');
            Route::post('/', [\App\Http\Controllers\SupplierController::class, 'store'])->name('suppliers.store');
            Route::put('/{supplier}', [\App\Http\Controllers\SupplierController::class, 'update'])->name('suppliers.update');
            Route::delete('/{supplier}', [\App\Http\Controllers\SupplierController::class, 'destroy'])->name('suppliers.destroy');
        });

        // ── Purchase Order Management ──
        Route::prefix('purchase-orders')->group(function () {
            Route::get('/', [\App\Http\Controllers\PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
            Route::post('/', [\App\Http\Controllers\PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
            Route::get('/{purchaseOrder}', [\App\Http\Controllers\PurchaseOrderController::class, 'show'])->name('purchase-orders.show');
            Route::put('/{purchaseOrder}', [\App\Http\Controllers\PurchaseOrderController::class, 'update'])->name('purchase-orders.update');
            Route::post('/{purchaseOrder}/receive', [\App\Http\Controllers\PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');
            Route::delete('/{purchaseOrder}', [\App\Http\Controllers\PurchaseOrderController::class, 'destroy'])->name('purchase-orders.destroy');
        });

        // ── Category Management ──
        Route::prefix('categories')->group(function () {
            Route::get('/', [\App\Http\Controllers\CategoryController::class, 'index'])->name('categories.index');
            Route::post('/', [\App\Http\Controllers\CategoryController::class, 'store'])->name('categories.store');
            Route::put('/{slug}/fields', [\App\Http\Controllers\CategoryController::class, 'updateFields'])->name('categories.fields.update');
            Route::delete('/{slug}', [\App\Http\Controllers\CategoryController::class, 'destroy'])->name('categories.destroy');
        });

        // use App\Http\Controllers\LibraryController;

        
Route::prefix('library')->name('library.')->group(function () {
            // Main page
            Route::get('/', [LibraryController::class , 'index'])->name('index');

            // Books
            Route::post('/books', [LibraryController::class , 'storeBook'])->name('books.store');
            Route::put('/books/{id}', [LibraryController::class , 'updateBook'])->name('books.update');
            Route::delete('/books/{id}', [LibraryController::class , 'destroyBook'])->name('books.destroy');

            // Members
            Route::post('/members', [LibraryController::class , 'storeMember'])->name('members.store');
            Route::put('/members/{id}', [LibraryController::class , 'updateMember'])->name('members.update');

            // Loans
            Route::post('/loans', [LibraryController::class , 'issueLoan'])->name('loans.issue');
            Route::post('/loans/{id}/return', [LibraryController::class , 'returnLoan'])->name('loans.return');
            Route::post('/loans/{id}/extend', [LibraryController::class , 'extendLoan'])->name('loans.extend');
            Route::post('/loans/{id}/incident', [LibraryController::class , 'markIncident'])->name('loans.incident');
            Route::get('/loans/fee-preview', [LibraryController::class , 'previewFee'])->name('loans.fee-preview');        }
        );

        // ── Promotions Management ──
        Route::prefix('promotions')->group(function () {
            Route::get('/', [PromotionController::class, 'index'])->name('promotions.index');
            Route::post('/', [PromotionController::class, 'store'])->name('promotions.store');
            Route::put('/{promotion}', [PromotionController::class, 'update'])->name('promotions.update');
            Route::delete('/{promotion}', [PromotionController::class, 'destroy'])->name('promotions.destroy');
            Route::patch('/{promotion}/toggle', [PromotionController::class, 'toggle'])->name('promotions.toggle');
            Route::get('/active', [PromotionController::class, 'active'])->name('promotions.active');
        });

        // ── Customers (resource with selected actions) ──
        Route::resource('customers', CustomerController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        // ── Reading Lounge Manager API ──
        Route::prefix('api/reading/sessions')->group(function () {
            Route::get('/active', [ReadingSessionController::class , 'activeSessions'])->name('reading.sessions.active');
            Route::get('/summary/today', [ReadingSessionController::class , 'dailySummary'])->name('reading.sessions.summary');
            Route::get('/', [ReadingSessionController::class , 'index'])->name('reading.sessions.index');
            Route::post('/check-in', [ReadingSessionController::class , 'checkIn'])->name('reading.sessions.checkin');
            Route::post('/{id}/check-out', [ReadingSessionController::class , 'checkOut'])->name('reading.sessions.checkout');
            Route::post('/{id}/cancel', [ReadingSessionController::class , 'cancel'])->name('reading.sessions.cancel');
            Route::get('/{id}/live', [ReadingSessionController::class , 'liveAmount'])->name('reading.sessions.live');
        }
        );

        Route::prefix('api/reading/settings')->group(function () {
            Route::get('/layout', [ReadingSessionController::class , 'getLayout'])->name('reading.settings.layout.get');
            Route::post('/layout', [ReadingSessionController::class , 'saveLayout'])->name('reading.settings.layout.save');
        }
        );

        // ── Reading Lounge Manager UI ──
        Route::get('/lounge', function () {
            return Inertia::render('LoungeManager/Index');
        }
        )->name('lounge.manager');

        // ── Staff / Employee Management ──
        Route::prefix('staff')->group(function () {
            Route::get('/', [EmployeeController::class , 'index'])->name('staff.index');
            Route::post('/', [EmployeeController::class , 'store'])->name('staff.store');
            Route::put('/{id}', [EmployeeController::class , 'update'])->name('staff.update');
            Route::delete('/{id}', [EmployeeController::class , 'destroy'])->name('staff.destroy');
            Route::post('/{id}/reset-pin', [EmployeeController::class , 'resetPin'])->name('staff.resetPin');
            Route::post('/{id}/reset-password', [EmployeeController::class , 'resetPassword'])->name('staff.resetPassword');
            Route::post('/{id}/avatar', [EmployeeController::class , 'uploadAvatar'])->name('staff.uploadAvatar');
        }
        );

        // ── Settings ──
        Route::get('/settings', [SettingsController::class , 'index'])->name('settings');
        Route::post('/settings', [SettingsController::class , 'update'])->name('settings.update');
        Route::post('/settings/{section}', [SettingsController::class , 'updateSection'])->name('settings.update.section');

        // ── Reports & Analytics ──
        Route::get('/reports', [ReportController::class , 'index'])->name('reports.index');

        Route::prefix('api/reports')->group(function () {
            Route::get('/overview', [ReportController::class , 'overview']);

            Route::prefix('sales')->group(function () {
                    Route::get('/by-period', [SalesReportController::class , 'byPeriod']);
                    Route::get('/by-category', [SalesReportController::class , 'byCategory']);
                    Route::get('/by-product', [SalesReportController::class , 'byProduct']);
                    Route::get('/by-payment-method', [SalesReportController::class , 'byPaymentMethod']);
                }
                );

                Route::prefix('inventory')->group(function () {
                    Route::get('/stock-levels', [InventoryReportController::class , 'stockLevels']);
                    Route::get('/valuation', [InventoryReportController::class , 'valuation']);
                    Route::get('/stock-movements', [InventoryReportController::class , 'stockMovements']);
                }
                );

                Route::prefix('purchase-orders')->group(function () {
                    Route::get('/summary', [\App\Http\Controllers\Reports\PurchaseOrderReportController::class , 'summary']);
                }
                );

                Route::prefix('customers')->group(function () {
                    Route::get('/top', [CustomerReportController::class , 'topCustomers']);
                    Route::get('/loyalty', [CustomerReportController::class , 'loyaltyStats']);
                }
                );

                Route::prefix('employees')->group(function () {
                    Route::get('/performance', [EmployeeReportController::class , 'performance']);
                }
                );

                Route::get('/export/{format}', [ExportController::class , 'export']);
            }
            );

            // ── User Management (admin only) ──
            Route::middleware('permission:edit_settings')->group(function () {
            Route::post('/users', [UserManagementController::class , 'store'])->name('users.store');
            Route::put('/users/{id}', [UserManagementController::class , 'update'])->name('users.update');
            Route::delete('/users/{id}', [UserManagementController::class , 'destroy'])->name('users.destroy');
            Route::patch('/users/{id}/toggle-status', [UserManagementController::class , 'toggleStatus'])->name('users.toggleStatus');

            Route::get('/permissions', [PermissionController::class , 'index'])->name('permissions.index');
            Route::post('/permissions', [PermissionController::class , 'update'])->name('permissions.update');
            Route::post('/permissions/reset', [PermissionController::class , 'reset'])->name('permissions.reset');
        }
        );

        // ── Profile ──
        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileController::class , 'show'])->name('profile.show');
            Route::get('/edit', [ProfileController::class , 'edit'])->name('profile.edit');
            Route::patch('/', [ProfileController::class , 'update'])->name('profile.update');
            Route::post('/', [ProfileController::class , 'update'])->name('profile.update.post');
            Route::delete('/', [ProfileController::class , 'destroy'])->name('profile.destroy');
        }
        );    });

// ── Public auth routes (usually login, register, password reset, etc.) ──
require __DIR__ . '/auth.php';