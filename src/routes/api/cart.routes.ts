import { Router } from "express";
import { authenticationMiddleware } from "../../middlewares/authentication";
import { 
    getCart, 
    addItem, 
    updateItem, 
    deleteItem, 
    clearCart 
} from "../../controllers/cart.controller";

const router: Router = Router();

// ========== CART ROUTES (Protected - Auth Required) ==========
// All routes require the user to be authenticated.

router.use(authenticationMiddleware);

// Get the current user's cart
router.get("/", getCart);

// Add an item to the cart
router.post("/add", addItem);

// Update an item in the cart (e.g., change quantity)
router.patch("/", updateItem);

// Delete a specific item from the cart by product ID
router.delete("/:product_id", deleteItem);

// Clear the entire cart
router.delete("/", clearCart);

export default router;
