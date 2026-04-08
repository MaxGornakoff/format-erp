<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
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
            'title' => 'sometimes|nullable|string|max:255',
            'description' => 'sometimes|required|string|max:2000',
            'note' => 'sometimes|nullable|string|max:2000',
            'package_cost' => 'sometimes|nullable|numeric|min:0',
            'order_cost' => 'sometimes|nullable|numeric|min:0',
            'priority' => 'sometimes|in:low,medium,high',
            'status' => 'sometimes|in:new,in_progress,completed,cancelled',
            'user_id' => 'sometimes|nullable|exists:users,id',
        ];
    }
}
