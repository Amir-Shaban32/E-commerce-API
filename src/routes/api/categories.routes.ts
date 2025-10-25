import { Router } from "express";
import { authenticationMiddleware } from "../../middlewares/authentication";
import { verifyRoles } from "../../middlewares/verifyRoles";
import ROLES_LIST from "../../config/roles_list";
import { 
    getCategories, 
    getCategory, 
    addCategory, 
    updateCategory, 
    deleteCategory 
} from "../../controllers/categories.controller";

const router: Router = Router();

// ========== CATEGORY ROUTES (Public) ==========
// Anyone can access these routes without authentication.

// Get all categories
router.get("/", getCategories);

// Get a single category by ID
router.get("/:id", getCategory);


// ========== CATEGORY ROUTES (Protected - Admin Only) ==========
// Authentication is required. Only Admins can access these routes.

router.use(authenticationMiddleware);

// Add a new category
router.post("/", verifyRoles(ROLES_LIST.admin), addCategory);

// Update an existing category by ID
router.patch("/:id", verifyRoles(ROLES_LIST.admin), updateCategory);

// Delete a category by ID
router.delete("/:id", verifyRoles(ROLES_LIST.admin), deleteCategory);

export default router;
