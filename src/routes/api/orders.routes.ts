import { Router } from "express";
import { authenticationMiddleware } from "../../middlewares/authentication";
import { verifyRoles } from "../../middlewares/verifyRoles";
import ROLES_LIST from "../../config/roles_list";
import { 
  getOrders, 
  getOrder, 
  checkOut, 
  updateOrder,
  cancelOrderItem, 
  cancelOrder,
  trackOrder,
  updateTrack,
  requestReturn,
  handleReturnApproval,
  completeReturn
} from "../../controllers/orders.controller";

const router: Router = Router();

router.use(authenticationMiddleware);

// ========== USER ROUTES (No role verification) ==========
router.post("/:orderId/checkout", checkOut);
router.get("/:orderId/status", trackOrder); 

// ========== ADMIN ROUTES ==========
router.get("/", verifyRoles(ROLES_LIST.admin), getOrders); 

// ========== Order detail routes (With :orderId) ==========
router.get("/:orderId", getOrder);
router.patch("/:orderId", updateOrder);
router.patch("/:orderId/cancel", cancelOrder); 
router.patch("/:orderId/status", verifyRoles(ROLES_LIST.admin), updateTrack); 

// ========== Cancel specific item in order ==========
router.patch("/:orderId/items/:item_id/cancel", cancelOrderItem); 

// ========== Return workflow ==========
router.post("/:orderId/return", requestReturn);
router.post("/:orderId/return/decision" ,verifyRoles(ROLES_LIST.admin), handleReturnApproval);
router.post("/:orderId/return/complete" ,verifyRoles(ROLES_LIST.admin), completeReturn);

export default router;