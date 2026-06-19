<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
      public function boot()
    {
        Schema::defaultStringLength(191); // Add this line
    }
    public function register(): void
    {
        //
    }

}
