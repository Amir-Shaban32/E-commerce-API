import { Request, Response } from "express";
import { checkOwnershipOrAdmin } from "../middlewares/checkOwner";
import ordersModel from "../models/orders.model";
import {
  getPaymentService,
  createPaymentIntent,
  savePayment,
  getPaymentByOrderIdService
} from "../services/payments.services";
import paymentsModel from '../models/payments.model';

export const getPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(400).json({ message: "Bad request: Missing data" });

    const user_id = req.id;
    const order = await ordersModel.findOne({ user_id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!checkOwnershipOrAdmin(order, req))
      return res.status(403).json({ message: "Forbidden" });

    const payment = await getPaymentService(id);
    if (payment.status === 404)
      return res.status(404).json({ message: payment.message });

    return res.json({
      status: `ok ${res.statusCode}`,
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
    const order = await ordersModel.findOne({ user_id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!checkOwnershipOrAdmin(order, req))
      return res.status(403).json({ message: "Forbidden" });

    const payment = await getPaymentByOrderIdService(order_id);
    if (payment.status === 404)
      return res.status(404).json({ message: payment.message });

    return res.json({
      status: `ok ${res.statusCode}`,
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
    const order = await ordersModel.findById(order_id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    if (!checkOwnershipOrAdmin(order, req))
      return res.status(403).json({ message: "Forbidden" });
    
    const orderAmountInCents = Math.round(order.total * 100);
    if (orderAmountInCents !== amount*100)
      return res.status(400).json({ message: "Amount does not match order total"  });
    
    if(order.payment_status !== "pending" && order.delivery_status !== 'pending'){
      const status = order.payment_status ? order.payment_status : order.delivery_status
      return res.status(409).json({message:`This order is already: ${status}`});
    }

    const existingPayment = await paymentsModel.findOne({ 
      order_id, 
      status: 'succeeded' 
    });
    if (existingPayment) {
      return res.status(409).json({ 
        message: "Payment already completed for this order" 
      });
    }

    const paymentIntent = await createPaymentIntent(
      amount*100,  
      currency
    );

    await savePayment(user_id, order_id, paymentIntent);

    return res.json({
      status: `ok ${res.statusCode}`,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};
