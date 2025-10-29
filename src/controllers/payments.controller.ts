import { Request, Response } from "express";
import { checkOwnershipOrAdmin } from "../middlewares/checkOwner";
import {
  getPaymentService,
  createPaymentService,
  getPaymentByOrderIdService
} from "../services/payments.services";
import { getOrderService } from "../services/orders.services";

export const getPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(400).json({ message: "Bad request: Missing data" });

    const user_id = req.id;
    const payment = await getPaymentService(id , user_id);
    
    if (payment.status === 404)
      return res.status(404).json({ message: payment.message });

    if (!checkOwnershipOrAdmin(payment.payment, req))
      return res.status(403).json({ message: "Forbidden" });

    return res.json({
      status: "success",
      payment,
    });
  } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

export const getPaymentByOrderId = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;
    if (!order_id)
      return res.status(400).json({ message: "Bad request: Missing data" });

    const user_id = req.id;
    const payment = await getPaymentByOrderIdService(order_id , user_id);
    
    if (payment.status === 404)
      return res.status(404).json({ message: payment.message });

    if (!checkOwnershipOrAdmin(payment.payment, req))
      return res.status(403).json({ message: "Forbidden" });

    return res.json({
      status: "success",
      payment,
    });
  } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { order_id, amount, currency } = req.body;
    if (!order_id || !amount || !currency)
      return res.status(400).json({ message: "Bad request: Missing data" });

    const user_id = req.id;
    const order = await getOrderService(order_id , req.role , user_id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    if (!checkOwnershipOrAdmin(order, req))
      return res.status(403).json({ message: "Forbidden" });
    
    const paymentIntent = await createPaymentService(order_id , user_id , amount ,currency);

    if(paymentIntent.status!==200)
        return res.status(paymentIntent.status).json({message:paymentIntent.message});
      
    return res.json({
        status: "success",
        paymentIntentId: paymentIntent.paymentIntent?.id,
        clientSecret: paymentIntent.paymentIntent?.client_secret,
    });

  } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};
