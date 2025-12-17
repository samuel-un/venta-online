<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_name',
        'quantity',
        'unit_price',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function total(): float
    {
        return $this->quantity * $this->unit_price;
    }
}
