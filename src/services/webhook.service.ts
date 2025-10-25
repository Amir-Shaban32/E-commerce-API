import Stripe from 'stripe';
import paymentsModel from '../models/payments.model';
import ordersModel from '../models/orders.model';
import dotenv from 'dotenv';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const WEBHOOK_SECRET_KEY = process.env.WEBHOOK_SECRET_KEY!;
const stripe = new Stripe(STRIPE_SECRET_KEY);

export const verifyWebhookSig = (
    rawBody: Buffer | string,
    signature: string | string[]
):{verified:boolean , event?: Stripe.Event, error?:string} =>{

    try{

        const event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            WEBHOOK_SECRET_KEY
        );
        return {verified:true , event};
    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        return {verified:false , error:err.message};
    }

};

export const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent)
    :Promise<{ success: boolean; message: string }> => {
    
    try{

        const payment = await paymentsModel.findOne({payment_intent_id:paymentIntent.id});
        if(!payment) return {success:false , message:"Payment not found"};

        if(payment.status === "successed")
            return {success:true , message:"Payment already processed"};

        const method =typeof paymentIntent.payment_method === "string"
            ? null
            : paymentIntent.payment_method?.type;
    
        await paymentsModel.findOneAndUpdate(
            {payment_intent_id:paymentIntent.id},
            {
                status:"successed",
                method
            }
        );

        const order = await ordersModel.findById(payment.order_id);
        if(!order) return {success:false , message:"order not found"};

        await ordersModel.findByIdAndUpdate(payment.order_id,{
            payment_status:"processing",
            completed_at: new Date()
        });
        
        return {success:true, message:"payment processed successfully"};
    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        return {success:false , message:err.message};
    }
};

export const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent)
    :Promise<{ success: boolean; message: string }> =>{

    try{
        const payment = await paymentsModel.findOne({payment_intent_id:paymentIntent.id});
        if(!payment) return {success:false , message:"Payment not found"};
    
        const failure_reason = paymentIntent.last_payment_error?.message || null;
    
        await paymentsModel.findOneAndUpdate(
            {payment_intent_id:paymentIntent.id},
            {
                status:"failed",
                failure_reason
            }
        )
    
        return {success: true,message: 'Failed payment recorded'};

    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        return {success:false , message:err.message};
    }
};

export const handleChargeRefunded = async(charge:Stripe.Charge)
    :Promise<{success:boolean , message:string}> =>{

    try{

        const payment_intent_id = charge.payment_intent as string;
        const payment = await paymentsModel.findOne({payment_intent_id});
        if(!payment) return {success:false , message:"Payment not found"};

        await paymentsModel.findOneAndUpdate(
            {payment_intent_id},
            {
                status:"refunded"
            }
        );

        const order = await ordersModel.findById(payment.order_id);
        if(!order) return {success:false , message:"Order not found"};

        let refund_amount = 0;
        if (charge.refunds && charge.refunds.data.length > 0) 
            refund_amount = charge.refunds.data.reduce((sum, r) => sum + r.amount, 0) / 100;

        await ordersModel.findByIdAndUpdate(payment.order_id,{
            payment_status:"refunded",
            refund_id:charge.refunds?.data[0]?.id || order.refund_id,
            refund_amount,
            refunded_at: new Date(),
            completed_at: new Date()
        });

        return {success:true , message:"Refund processed successfully"};
    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        return {success:false , message:err.message};
    }

};

export const webhookEvent = async (event:Stripe.Event) 
    :Promise<{success:boolean , message:string}>=>{

  try {
    switch (event.type) {
        case "payment_intent.succeeded":{
            const payment_intent = event.data.object as Stripe.PaymentIntent;
            return await handlePaymentIntentSucceeded(payment_intent);
        }
        case "payment_intent.payment_failed":{
            const payment_intent = event.data.object as Stripe.PaymentIntent;
            return await handlePaymentIntentFailed(payment_intent);
        }
        case "charge.refunded":{
            const charge = event.data.object as Stripe.Charge;
            return await handleChargeRefunded(charge);
        }
      default:
            return { success: true, message: 'Event type not handled' };
    }

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {success:false , message:err.message};
  }

}