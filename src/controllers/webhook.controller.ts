import { Request, Response } from "express";
import { webhookEvent ,verifyWebhookSig} from "../services/webhook.service";


export const stripeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'];
    if(!signature)  return res.status(400).json({message:"Missing stripe signature"});

    const rawBody = req.body;

    const verificationResult = verifyWebhookSig(rawBody,signature);
    if(!verificationResult.verified) {
      return res.status(400).json({
        message:'Webhook signature verification failed',
        error:verificationResult.error
      })
    } 

    const event = verificationResult.event!;
    const processingResult = await webhookEvent(event);

    if(!processingResult.success)
        console.error(processingResult.message);

    return res.json({
      status:`ok ${res.statusCode}`,
      received:true,
      message:processingResult.message
    });

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return res.status(500).json({
      status: `fail ${res.statusCode}`,
      received:false,
      message: err.message
    });
  }
};