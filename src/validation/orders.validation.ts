import {z} from 'zod';
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");
const phoneValidation = z.string().regex(/^\d{11}$/, "Must be exactly 11 digits");

const itemSchema = z.object({
    product_id:objectIdSchema,
    quantity:z.number().int().positive()
})
const shippingSchema = z.object({
    country: z.string().min(2, "Invalid country!"),
    city: z.string().min(2, "Invalid city!"),
    street: z.string().min(2, "Invalid street!"),
    zip: z.string().regex(/^\d{5}$/, "Must be exactly 5 digits"),
});
export const createOrderValidation = z.object({
    order_items:z.array(itemSchema).nonempty("Order must contain at least 1 item"),
    shipping_address:shippingSchema,
    payment_status:z.enum(["pending", "paid", "failed"]),
    phone_number:phoneValidation,
});

export const updateOrderValidation = z.object({
    shipping_address: z.array(shippingSchema).optional(),
    phone_number: phoneValidation.optional(),
}).strict();
  
// For admins - status management
export const adminUpdateOrderValidation = z.object({
    payment_status: z.enum(["pending", "paid", "failed"]).optional(),
    order_status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
}).strict();


export const updateStatusValidation = z.object({
    delivery_status: z.enum(["pending", "shipped", "canceled", "delivered"])
}).strict();
