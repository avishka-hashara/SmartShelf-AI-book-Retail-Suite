<?php

// app/Http/Controllers/SettingsController.php

namespace App\Http\Controllers;

use App\Models\StoreSettings;
use App\Models\RolePermission;
use App\Http\Controllers\UserManagementController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /* ─────────────────────────────────────────────────
       INDEX — Render the Settings page
       ───────────────────────────────────────────────── */
    public function index(): Response
    {
        $settings = StoreSettings::instance();

        return Inertia::render('Settings/Settings', [
            'settings'        => $settings,
            'users'           => UserManagementController::getUsersForSettings(),
            'rolePermissions' => RolePermission::all()
                ->groupBy('role')
                ->map(fn ($perms) => $perms->pluck('is_enabled', 'permission_key')),
        ]);
    }

    /* ─────────────────────────────────────────────────
       UPDATE — Full update of all settings
       ───────────────────────────────────────────────── */
    public function update(Request $request): RedirectResponse
    {
        $settings = StoreSettings::instance();

        $validated = $request->validate([
            // Profile
            'shop_name'      => 'required|string|max:255',
            'tagline'        => 'nullable|string|max:255',
            'brand_color'    => 'nullable|string|max:20',
            'address_line1'  => 'nullable|string|max:255',
            'address_line2'  => 'nullable|string|max:255',
            'city'           => 'nullable|string|max:255',
            'postal_code'    => 'nullable|string|max:20',
            'phone'          => 'nullable|string|max:50',
            'email'          => 'nullable|email|max:255',
            'website'        => 'nullable|string|max:255',
            'facebook'       => 'nullable|string|max:255',
            'instagram'      => 'nullable|string|max:255',
            'whatsapp'       => 'nullable|string|max:50',

            // Tax & Business
            'tax_id'              => 'nullable|string|max:100',
            'business_reg_number' => 'nullable|string|max:100',
            'currency'            => 'nullable|string|max:10',
            'timezone'            => 'nullable|string|max:50',

            // Receipt
            'receipt_footer' => 'nullable|string|max:1000',

            // Stock & Loyalty
            'low_stock_threshold'    => 'nullable|integer|min:0',
            'enable_loyalty'         => 'nullable|boolean',
            'loyalty_points_per_rupee' => 'nullable|numeric|min:0',

            // Files
            'logo'    => 'nullable|image|mimes:jpeg,jpg,png,webp,svg|max:5120',
            'favicon' => 'nullable|image|mimes:jpeg,jpg,png,webp,ico,svg|max:2048',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $this->deleteOldFile($settings->logo_path);
            $validated['logo_path'] = $request->file('logo')->store('logos', 'public');
        }

        // Handle favicon upload
        if ($request->hasFile('favicon')) {
            $this->deleteOldFile($settings->favicon_path);
            $validated['favicon_path'] = $request->file('favicon')->store('logos', 'public');
        }

        // Remove file inputs from validated data (they're handled above)
        unset($validated['logo'], $validated['favicon']);

        $settings->update($validated);

        return redirect()->back()->with('success', 'Settings updated.');
    }

    /* ─────────────────────────────────────────────────
       UPDATE SECTION — Partial update per card/section
       ───────────────────────────────────────────────── */
    public function updateSection(Request $request, string $section): RedirectResponse
    {
        $settings = StoreSettings::instance();

        $rules = match ($section) {
            'profile' => [
                'shop_name'     => 'required|string|max:255',
                'tagline'       => 'nullable|string|max:255',
                'brand_color'   => 'nullable|string|max:20',
                'address_line1' => 'nullable|string|max:255',
                'address_line2' => 'nullable|string|max:255',
                'city'          => 'nullable|string|max:255',
                'postal_code'   => 'nullable|string|max:20',
                'phone'         => 'nullable|string|max:50',
                'email'         => 'nullable|email|max:255',
                'website'       => 'nullable|string|max:255',
                'facebook'      => 'nullable|string|max:255',
                'instagram'     => 'nullable|string|max:255',
                'whatsapp'      => 'nullable|string|max:50',
                'logo'          => 'nullable|image|mimes:jpeg,jpg,png,webp,svg|max:5120',
                'favicon'       => 'nullable|image|mimes:jpeg,jpg,png,webp,ico,svg|max:2048',
            ],
            'tax' => [
                'tax_id'              => 'nullable|string|max:100',
                'business_reg_number' => 'nullable|string|max:100',
                'currency'            => 'nullable|string|max:10',
                'timezone'            => 'nullable|string|max:50',
            ],
            'loyalty' => [
                'low_stock_threshold'      => 'nullable|integer|min:0',
                'enable_loyalty'           => 'nullable|boolean',
                'loyalty_points_per_rupee' => 'nullable|numeric|min:0',
            ],
            'receipt' => [
                'receipt_header'         => 'nullable|string|max:255',
                'receipt_footer'         => 'nullable|string|max:1000',
                'invoice_prefix'         => 'nullable|string|max:20',
                'website'                => 'nullable|string|max:255',
                'receipt_show_website'   => 'nullable|boolean',
                'facebook'               => 'nullable|string|max:255',
                'receipt_show_facebook'  => 'nullable|boolean',
                'instagram'              => 'nullable|string|max:255',
                'receipt_show_instagram' => 'nullable|boolean',
                'whatsapp'               => 'nullable|string|max:50',
                'receipt_show_whatsapp'  => 'nullable|boolean',
            ],
            default => abort(404, 'Unknown settings section.'),
        };

        $validated = $request->validate($rules);

        // Handle file uploads for the profile section
        if ($section === 'profile') {
            if ($request->hasFile('logo')) {
                $this->deleteOldFile($settings->logo_path);
                $validated['logo_path'] = $request->file('logo')->store('logos', 'public');
            }

            if ($request->hasFile('favicon')) {
                $this->deleteOldFile($settings->favicon_path);
                $validated['favicon_path'] = $request->file('favicon')->store('logos', 'public');
            }

            unset($validated['logo'], $validated['favicon']);
        }

        // Receipt section: use explicit assignment to guarantee all new fields
        // save regardless of the model's $fillable definition.
        if ($section === 'receipt') {
            $settings->receipt_header         = $validated['receipt_header']         ?? null;
            $settings->receipt_footer         = $validated['receipt_footer']         ?? null;
            $settings->invoice_prefix         = $validated['invoice_prefix']         ?? 'INV-';
            $settings->website                = $validated['website']                ?? null;
            $settings->receipt_show_website   = (bool) ($validated['receipt_show_website']   ?? false);
            $settings->facebook               = $validated['facebook']               ?? null;
            $settings->receipt_show_facebook  = (bool) ($validated['receipt_show_facebook']  ?? false);
            $settings->instagram              = $validated['instagram']              ?? null;
            $settings->receipt_show_instagram = (bool) ($validated['receipt_show_instagram'] ?? false);
            $settings->whatsapp               = $validated['whatsapp']              ?? null;
            $settings->receipt_show_whatsapp  = (bool) ($validated['receipt_show_whatsapp']  ?? false);
            $settings->save();

            return redirect()->back()->with('success', 'Receipt settings updated.');
        }

        $settings->update($validated);

        $label = ucfirst($section);

        return redirect()->back()->with('success', "{$label} settings updated.");
    }

    /* ─────────────────────────────────────────────────
       PRIVATE — Delete old file from storage
       ───────────────────────────────────────────────── */
    private function deleteOldFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}