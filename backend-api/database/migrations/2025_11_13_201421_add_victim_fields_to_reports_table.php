<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            // Victim/Korban Fields
            $table->integer('usia_korban')->nullable()->after('jenis_kelamin');
            $table->string('whatsapp_korban', 15)->nullable()->after('usia_korban');
            
            // Add indexes
            $table->index('usia_korban');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn(['usia_korban', 'whatsapp_korban']);
            $table->dropIndex(['usia_korban']);
        });
    }
};
