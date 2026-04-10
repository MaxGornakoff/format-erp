<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'note',
        'package_cost',
        'order_cost',
        'priority',
        'status',
        'user_id',
        'responsible_name',
    ];

    protected $casts = [
        'package_cost' => 'decimal:2',
        'order_cost' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::deleting(function (Order $order) {
            $order->images()->get()->each->delete();
        });
    }

    /**
     * Get the user that created the order.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function responsibleUser()
    {
        return $this->hasOne(User::class, 'name', 'responsible_name');
    }

    public function images()
    {
        return $this->hasMany(OrderImage::class)
            ->orderBy('sort_order')
            ->orderBy('id');
    }
}
