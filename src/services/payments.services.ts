import dotenv from 'dotenv';
import Stripe from 'stripe';
import paymentsModel from '../models/payments.model';
import { IPayment } from '../types/payment.types';
dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(STRIPE_SECRET_KEY);

export const getPaymentService = async (id:string)
    :Promise<{status:number , message?: string , payment?: typeof paymentsModel.prototype}> =>{

    const payment = await paymentsModel.findById(id);
    if(!payment) return {status:404 , message:"Payment not found"};

    return {status:200 , payment:payment};

};

export const getPaymentByOrderIdService = async (order_id:string)
    :Promise<{status:number , message?: string , payment?: typeof paymentsModel.prototype}> =>{

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



