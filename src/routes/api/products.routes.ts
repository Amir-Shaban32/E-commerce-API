import { Router } from "express";
import { authenticationMiddleware } from "../../middlewares/authentication";
import { verifyRoles } from "../../middlewares/verifyRoles";
import ROLES_LIST from "../../config/roles_list";
import { 
    getProducts, 
    getProduct, 
    addProduct, 
    updateProduct, 
    deleteProduct 
} from "../../controllers/products.controller";

const router: Router = Router();

// ========== PRODUCT ROUTES (Public) ==========
// Anyone can access these routes without authentication.

// Get all products
router.get("/", getProducts);

// Get a single product by ID
router.get("/:id", getProduct);


// ========== PRODUCT ROUTES (Protected - Admin Only) ==========
// Authentication is required. Only Admins can access these routes.

router.use(authenticationMiddleware);

// Add a new product
router.post("/", verifyRoles(ROLES_LIST.admin), addProduct);

// Update an existing product by ID
router.patch("/:id", verifyRoles(ROLES_LIST.admin), updateProduct);

// Delete a product by ID
router.delete("/:id", verifyRoles(ROLES_LIST.admin), deleteProduct);

export default router;
