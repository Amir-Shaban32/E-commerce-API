import { Router } from "express";
import { createPayment , getPayment , getPaymentByOrderId} from "../../controllers/payments.controller";
import { authenticationMiddleware } from "../../middlewares/authentication";

const router: Router = Router();

router.use(authenticationMiddleware);

router.post('/create-intent' , createPayment);
router.get('/:id' , getPayment);
router.get('/order/:order_id' , getPaymentByOrderId);

export default router;