<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'nullable|string|max:255',
            'description' => 'required|string|max:2000',
            'note' => 'nullable|string|max:2000',
            'package_cost' => 'nullable|numeric|min:0',
            'order_cost' => 'nullable|numeric|min:0',
            'priority' => 'required|in:low,medium,high',
            'status' => 'nullable|in:new,in_progress,completed,cancelled',
            'user_id' => 'nullable|exists:users,id',
        ];
    }
}
