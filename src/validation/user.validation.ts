import { z } from "zod";
import ROLES_LIST from "../config/roles_list";

const allowedRoles = Object.values(ROLES_LIST) as number[];

const phoneValidation = z.string().regex(/^\d{11}$/, "Must be exactly 11 digits").optional();

const addressValidation = z.object({
  country: z.string().min(2, "Invalid country!"),
  city: z.string().min(2, "Invalid city!"),
  street: z.string().min(2, "Invalid street!"),
  zip: z.string().regex(/^\d{5}$/, "Must be exactly 5 digits")
});

const paymentValidation = z.object({
  type: z.enum(["cash", "card", "wallet", "paypal", "bank_transfer"]),
  last4: z.string().regex(/^\d{4}$/, "Last 4 digits of your card").optional(),
  provider: z.string().min(2, "Invalid provider!").optional()
}).refine((data) => {
  if (data.type === 'cash') {
    return !data.last4 && !data.provider;
  }
  return data.last4 !== undefined && data.provider !== undefined;
}, {
  message: "Invalid payment method: if type is cash, last4/provider must be empty; otherwise they are required.",
  path: ["payment_method"]
});

const roleValidation = z.number().refine(
  (role) => allowedRoles.includes(role),
  {
    message: "This Role doesn't exits!"
  }
);

const passwordValidation =  z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
  )

export const createUserValidation = z.object({
  username: z.string().min(3, "Username must be at least 3 characters!"),
  email: z.email("Invalid email!"),
  phone_number: phoneValidation,
  shipping_address: z.array(addressValidation).optional(), 
  payment_method: z.array(paymentValidation).optional(), 
  password: passwordValidation,
  role: roleValidation.default(ROLES_LIST.user) 
});

export const updateUserValidation = z.object({
  username: z.string().min(3, "Username must be at least 3 characters!").optional(),
  email: z.email("Invalid email!").optional(),
  phone_number: phoneValidation,
  shipping_address: z.array(addressValidation).optional(), 
  payment_method: z.array(paymentValidation).optional(), 
}).strict();


