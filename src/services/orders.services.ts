import ordersModel from "../models/orders.model";
import {IOrder} from '../types/order.types';
import userModel from "../models/users.model";
import productsModel from "../models/products.model";
import { getPrice } from "../middlewares/getPrice";
import { order_item } from "../types/order.types";
import { cartItem } from "../types/cart.types";
import { Types } from "mongoose";
import { updateOrderValidation} from "../validation/orders.validation";
import {z} from 'zod';
import Stripe from "stripe";
import { SortOrder } from "mongoose";

export const getOrdersServices = (query: any) => {
  const filter: any = { ...query };

  if (filter.completed) {
    if (filter.completed === "true") 
      filter.delivery_status = "delivered";
    else if (filter.completed === "false") 
      filter.delivery_status = { $ne: "delivered" };
    delete filter.completed;
  }

  if (filter.cancelled) {
    if (filter.cancelled === "true") 
      filter.cancelled_at = { $ne: null };
    else if (filter.cancelled === "false") 
        filter.delivery_status = { $ne: "canceled" };
    
    delete filter.cancelled;
  }

  const sort: Record<string, SortOrder> =
    filter.sort_by === "cancelled"
      ? { cancelled_at: -1 as SortOrder }
      : { created_at: -1 as SortOrder };

  delete filter.sort_by;

  return { filter, sort };
};

export const getOrderService = async (orderId:string , role:number , user_id:string) =>{

    const query:any ={_id:orderId};

    if(role !== 1188){
        query.user_id = user_id,
        query.delivery_status = {$ne:"canceled"} // to preven user get order he canceled it
    }

    const foundOrder = await ordersModel.find(query);
    if(!foundOrder) return null;

    return foundOrder;
};

export const cancelOrderService = async (
    user_id:string, 
    cancelledBy: 'customer' | 'admin' | 'system',
    cancellation_reason?:string,
    ) =>{
    const foundOrder = await ordersModel.findOne({user_id});
    if(!foundOrder) return null;

    if(foundOrder.delivery_status === 'delivered')  
        return { status: 400, message: "Cannot cancel delivered order. Please request a return instead." };

    if (foundOrder.delivery_status === 'cancelled') 
        return { status: 400, message: "Order is already cancelled" };

    if(foundOrder.return_status !== "none")
        return {status:400 , message:`Order is ${foundOrder.return_status}`};

    const items_len = foundOrder.order_items.length;
    for(let i=0;i<items_len;i++){
        const order_item = foundOrder.order_items[i];
        const product = await productsModel.findById(order_item?.product_id);
        if(!product) return {status:404 , message:"Product not found"};
        const quantity = order_item?.quantity
        if(quantity){
            product.stock_quantity+=quantity;
            await product.save();
        } 
    }

    foundOrder.delivery_status = "cancelled";
    foundOrder.payment_status = "cancelled";
    foundOrder.cancelled_at= new Date();
    foundOrder.cancellation_reason = cancellation_reason || null;
    foundOrder.cancelled_by = cancelledBy;

    const needsRefund = foundOrder.payment_status === 'paid';
    if (needsRefund && foundOrder.payment_intent_id) {
        await handleRefund(foundOrder);
    } else {
        foundOrder.payment_status = 'cancelled';
    }
    await foundOrder.save();
    return foundOrder;

};

export const cancelItemService = async ( user_id:string , product_id:string , cancellation_reason?:string)=>{
    const foundOrder = await ordersModel.findOne({user_id});
    if(!foundOrder) return null;

    const item = foundOrder.order_items.find(item => item.product_id.toString() === product_id)
    if(!item)   return null;

    const product = await productsModel.findById(item.product_id);
    if(!product) return {status:404 , message:"Product not found"};
    const quantity = item.quantity;
    if(quantity) product.stock_quantity+=quantity;

    item.status = "canceled";
    item.cancelled_at = new Date();
    item.cancellation_reason = cancellation_reason || null;

    if (foundOrder.order_items.every((i) => i.status === "cancelled")) {
        foundOrder.delivery_status = "cancelled";
        foundOrder.cancelled_at = new Date();
    }

    const needsRefund = foundOrder.payment_status === 'paid';
    if (needsRefund && foundOrder.payment_intent_id) {
        await handleRefund(foundOrder);
    } else {
        foundOrder.payment_status = 'cancelled';
    }

    await foundOrder.save();
    return foundOrder;
};

export const checkoutService = async (user_id:string , items:cartItem[]) =>{
    const foundUser = await userModel.findById(user_id);
    if(!foundUser || !items) return null;

    const order_items = [] as order_item[];
    let total = 0;

    for(const {product_id , quantity} of items)
    {
        const price =  await getPrice(new Types.ObjectId(product_id));
        const item:order_item = {
            product_id: new Types.ObjectId(product_id),
            quantity,
            price_at_purchase:price,
            status:"active"
        };

        order_items.push(item);

        total+=price * quantity;
    }

    return {
        order_items,
        total};
}

export const updateOrderService = async(
    orderId:string,
    order:any,
    validationSchema: any = updateOrderValidation,
    )
    :Promise<{status:number , message:any , order?:typeof ordersModel.prototype}>=>{
    const foundOrder = await ordersModel.findById(orderId);
    if(!foundOrder) return {status:404, message: "Order not found!" };

    const valid = validationSchema.safeParse(order);
    if (!valid.success)
        return {status: 400,message: z.treeifyError(valid.error) };
    foundOrder.set(valid.data);
    await foundOrder.save();

    return {status: 200,message: "Order updated successfully" , order:foundOrder }
};

export const completeOrderService = async (orderId: string)
    :Promise<{status:number , message:any , order?:typeof ordersModel.prototype}> => {

    const order = await ordersModel.findById(orderId);
    if (!order) return { status: 404, message: "Order not found" };
    
    if (order.delivery_status !== 'delivered') {
      return { status: 400, message: "Order must be delivered first" };
    }
    
    order.delivery_status = 'delivered';
    order.completed_at = new Date();
    order.delivered_at = new Date();
    
    await order.save();
    
    return { status: 200, message: "Order completed successfully", order };
};

export const requestReturnService = async (orderId: string, reason?: string) => {
    const order = await ordersModel.findById(orderId);
    if (!order) return { status: 404, message: "Order not found" };
    
    // Can only return delivered orders
    if (order.delivery_status !== 'delivered'|| !order.delivered_at) {
      return { status: 400, message: "Can only return delivered orders" };
    }

    const deliveryDate = order.delivered_at || order.completed_at;
    const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceDelivery > 10) {
      return { status: 400, message: "Return window has expired (10 days)" };
    }
    
    // Already requested
    if (order.return_status !== 'none') {
      return { status: 400, message: "Return already requested" };
    };
    
    order.return_status = 'requested';
    order.return_requested_at = new Date();
    order.return_reason = reason || null;

    await order.save();
    
    return { status: 200, message: "Return request submitted successfully", order };
};

export const processReturnDecision = async(order_id:string, return_status:string|null , rejection_reason?:string)
    :Promise<{status:number , message:string , order?:typeof ordersModel.prototype}>=>{
    const order = await ordersModel.findById(order_id);
    if(!order) return {status:404 , message:"Order not found"}

    if(order.return_status !== 'requested') return {status:400 , message:"No return request to approve"};

    if (return_status === "approved") 
        order.return_status = "approved";
    else if (return_status === "rejected"){
        order.return_status = "rejected";
        order.return_reason = rejection_reason|| null;
    }else 
        return { status: 400, message: "Invalid return status" };
  
    order.save();
    return {status:200 , message:`Return request ${order.return_status}` , order};
}

export const completeReturnRequest = async(order_id:string )
    :Promise<{status:number , message:string , order?:typeof ordersModel.prototype}>=>{
    const order = await ordersModel.findById(order_id);
    if(!order) return {status:404 , message:"Order not found"}

    if(order.return_status !== 'approved') return {status:400 , message:"Return request must be approved first"};

    const needsRefund = order.payment_status === 'paid';
    if (needsRefund && order.payment_intent_id) {
        await handleRefund(order);
    } else {
        order.payment_status = 'cancelled';
    }
    
    order.return_status = "completed";
    order.save();
    return {status:200 , message:"Return completed and refund processed" , order};
};

const handleRefund = async (order: IOrder)
  : Promise<{ status: number; message: string }> => {
  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
    const stripe = new Stripe(STRIPE_SECRET_KEY);

    if (!order.payment_intent_id) return {status:404 , message:"payment_intent_id not found!"};

    const refund = await stripe.refunds.create({
      payment_intent: order.payment_intent_id,
    });

    order.refund_id = refund.id;
    order.payment_status = 'refunded';
    await order.save();

    return {
      status: 200,
      message: "Order refunded successfully"
    };
  } catch (error: any) {    
    return {
      status: 500,
      message: `Refund failed: ${error.message}`
    };
  }
};