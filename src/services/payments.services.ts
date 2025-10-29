import dotenv from 'dotenv';
import Stripe from 'stripe';
import paymentsModel from '../models/payments.model';
import ordersModel from '../models/orders.model';
import { IPayment } from '../types/payment.types';
dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(STRIPE_SECRET_KEY);

export const getPaymentService = async (id:string , user_id:string)
    :Promise<{status:number , message?: string , payment?: typeof paymentsModel.prototype}> =>{

    const order = await ordersModel.findOne({ user_id });
    if (!order) return {status:404,message: "Order not found" };

    const payment = await paymentsModel.findById(id);
    if(!payment) return {status:404 , message:"Payment not found"};

    return {status:200 , payment};

};

export const getPaymentByOrderIdService = async (order_id:string , user_id:string)
    :Promise<{status:number , message?: string , payment?: typeof paymentsModel.prototype}> =>{

    const order = await ordersModel.findOne({ user_id });
    if (!order) return {status:404,message: "Order not found" };
    const payment = await paymentsModel.findOne({order_id});
    if(!payment) return {status:404 , message:"Payment not found"};

    return {status:200 , payment:payment};
}

export const createPaymentIntent = async (amount:number , currency:string)
    :Promise<Stripe.PaymentIntent> =>{

    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency
    });

    return paymentIntent;
};

export const createPaymentService  = async (
    order_id:string,
    user_id:string, 
    amount:number, 
    currency:string
) :Promise<{status:number , message?:string , paymentIntent?:Stripe.PaymentIntent}>=>{

    const order = await ordersModel.findById(order_id);
    if (!order) return {status:404, message: "Order not found" };

    const orderAmountInCents = Math.round(order.total * 100);
    if (orderAmountInCents !== amount*100)
      return {status:400,message: "Amount does not match order total"  };


    if(order.payment_status !== "pending" && order.delivery_status !== 'pending'){
        const status = order.payment_status ? order.payment_status : order.delivery_status
        return {status:409,message:`This order is already: ${status}`};
    }

    const existingPayment = await paymentsModel.findOne({ 
      order_id, 
      status: 'succeeded' 
    });
    if (existingPayment) 
      return {status:409,message: "Payment already completed for this order" };

    const paymentIntent = await createPaymentIntent(
      amount*100,  
      currency
    );

    await savePayment(user_id, order_id, paymentIntent);

    return {
        status:200,
        paymentIntent
    }
}

export const savePayment = async (user_id:string , order_id:string , paymentIntent:Stripe.PaymentIntent)
    :Promise<IPayment> =>{
    const newPayment = await paymentsModel.create({
        user_id,
        order_id,
        method:null,
        payment_intent_id:paymentIntent.id,
        amount:paymentIntent.amount,
        currency:paymentIntent.currency,
        status:paymentIntent.status
    });
    return newPayment;
};



