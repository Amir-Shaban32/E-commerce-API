import { Request,Response } from "express";
import {z} from 'zod';
import { clearCartService } from "../services/cart.services";
import { checkOwnershipOrAdmin } from "../middlewares/checkOwner";
import {
    updateOrderValidation,
    updateStatusValidation, 
    adminUpdateOrderValidation
} from "../validation/orders.validation";
import { 
    getOrdersServices,
    cancelItemService,
    cancelOrderService, 
    checkoutService,
    requestReturnService,
    getOrderService,
    updateOrderService, 
    processReturnDecision, 
    completeReturnRequest
} from "../services/orders.services";
import ROLES_LIST from "../config/roles_list";

//get all orders
export const getOrders = async (req:Request , res:Response)=>{
    try{
        const features = getOrdersServices(req.query);
        const orders = await features.model;
        res.json({
            status: "success",
            length: orders.length,
            data: orders
        });
    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
}

// get specific order
export const getOrder = async (req:Request , res:Response)=>{
    try{
        const orderId = req.params.orderId;
        if(!orderId) return res.status(400).json({message:"Missing Order Id!"});
        
        const foundOrder = await getOrderService(orderId,req.role , req.id);
        if(!foundOrder) return res.status(404).json({message:"Order not found!"});
        // check if id comming from middleware is the same as id here
        if(!checkOwnershipOrAdmin(foundOrder , req))  return res.status(403).json({ message: "Forbidden" });
        
        res.json({
            status: "success",
            data: foundOrder
        });        

    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
}

// add order
export const checkOut = async (req:Request , res:Response) =>{
    try{

        const user_id = req.id;
        const orderId = req.params.orderId;
        if(!orderId) return res.status(400).json({message:"Bad request: Missing order id"});

        const foundOrder = await getOrderService(orderId,req.role , req.id);
        if(!foundOrder) return res.status(404).json({message:"Order not found!"});
        if(!checkOwnershipOrAdmin(foundOrder , req))  return res.status(403).json({ message: "Forbidden" });

        const order = await checkoutService(user_id , req.body);
        if(order.status !==200) 
            return res.status(order.status).json({ message: order.message });

        await clearCartService(user_id);
        res.json({
            status: "success",
            data: order.order
        });
    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

// update existing Order
export const updateOrder = async (req:Request , res:Response) =>{
    try{        
        const {orderId} = req.params;
        if(!orderId) return res.status(400).json({message:"Missing user Id!"});
        
        const validationSchema = req.role === ROLES_LIST.admin
            ?adminUpdateOrderValidation:updateOrderValidation;

        const foundOrder = await updateOrderService(orderId,req.body,validationSchema);
        if(foundOrder.status === 404) return res.status(404).json({ message: foundOrder.message });
        if(foundOrder.status === 400) return res.status(400).json({ message: foundOrder.message });
        if(!checkOwnershipOrAdmin(foundOrder.order , req))  return res.status(403).json({ message: "Forbidden" });
        
        res.json({
            status: "success",
            message:foundOrder.message,
            data: foundOrder.order
        });

    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

//delete one Order
export const cancelOrderItem = async (req:Request , res:Response) =>{
    try{
        const {cancellation_reason = null} = req.body || {};
        const {orderId,product_id} = req.params;
        if(!product_id || !orderId) 
            return res.status(400).json({message:"Bad request: Missing Data!"});

        const user_id = req.id;

        const order = await getOrderService(orderId , req.role , user_id);
        if (!order) return res.status(404).json({ message: "Order not found!" }); 
        if(!checkOwnershipOrAdmin(order , req))  return res.status(403).json({message: "Forbidden"});

        await cancelItemService(user_id , product_id , cancellation_reason)

        res.json({
            status: "success",
            message: "Item canceled successfully"
        });    
    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

//delete existing Order
// we are not deleting any thing(soft delete) just cancel order to use data in analysis
export const cancelOrder = async (req:Request , res:Response) =>{
    try{
        const {orderId} = req.params;
        if(!orderId) return res.status(400).json({message:"Missing order id"});

        const {cancellation_reason = null} = req.body || {};
        const user_id = req.id;

        const order = await getOrderService(orderId , req.role , user_id);
        if (!order) return res.status(404).json({ message: "Order not found!" }); 
        if(!checkOwnershipOrAdmin(order , req))  return res.status(403).json({message: "Forbidden"});

        const cancelled_by = req.role === ROLES_LIST.admin ? 'admin' : "customer";
        
        await cancelOrderService(user_id ,cancelled_by ,cancellation_reason);

        res.json({
            status: "success",
            message: "Order canceled successfully"
        });    
    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

export const trackOrder = async (req:Request , res:Response) =>{
    try{
        const {orderId} = req.params;
        if(!orderId) return res.status(400).json({message:"Bad request: Missing order id!"});
        
        const order = await getOrderService(orderId , req.role , req.id);
        if (!order) return res.status(404).json({ message: "Order not found!" }); 
        if(!checkOwnershipOrAdmin(order , req))  return res.status(403).json({message: "Forbidden"});
    
        res.json({
            status: "success",
            data:order.delivery_status
        }); 

    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

export const updateTrack = async (req:Request , res:Response)=>{
    try{

        const orderId = req.params.orderId;
        if(!orderId) return res.status(400).json({message:"Bad request : Missing order id!"});

        const valid = updateStatusValidation.safeParse(req.body);
        if (!valid.success) {
            return res.status(400).json({
                status: "fail",
                message: z.treeifyError(valid.error) 
            });
        }

        const order = await getOrderService(orderId , req.role , req.id);
        if (!order) return res.status(404).json({ message: "Order not found!" }); 
        if(!checkOwnershipOrAdmin(order , req))  return res.status(403).json({message: "Forbidden"});
        
        order.delivery_status = valid.data.delivery_status;
        order.delivered_at = new Date;
        order.completed_at = new Date;
        await order.save();    
        res.json({
            status: "success",
            message: `Order is ${order.delivery_status}`,
            data: order
        }); 
    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };  
};

export const requestReturn = async (req:Request , res:Response)=>{
    try{
        const orderId = req.params.orderId;
        const {return_reason = null} = req.body || {};
        if(!orderId) return res.status(400).json({message:"Missing Order Id!"});

        const order = await getOrderService(orderId , req.role , req.id);
        if (!order) return res.status(404).json({ message: "Order not found!" }); 
        if(!checkOwnershipOrAdmin(order , req))  return res.status(403).json({message: "Forbidden"});

        const returnedOrder = await requestReturnService(orderId ,return_reason);
        if(returnedOrder.status !== 200) return res.status(returnedOrder.status)
            .json({message:returnedOrder.message});

        res.json({
            status: "success",
            message:returnedOrder.message,
            data:returnedOrder.order
        })

    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

export const handleReturnApproval = async(req:Request , res:Response)=>{
    try{
        const {orderId} = req.params;
        const {return_status , rejection_reason = null} = req.body
        if(!orderId) return res.status(400).json({message:"Missing order id"});

        const foundOrder = await getOrderService(orderId , req.role , req.id);
        if (!foundOrder) return res.status(404).json({ message: "Order not found!" }); 
        if(!checkOwnershipOrAdmin(foundOrder , req))  return res.status(403).json({message: "Forbidden"});

        const order = await processReturnDecision(orderId,return_status , rejection_reason);
        if(order.status !== 200){
            return res.json({
                status: order.status,
                message:order.message
            });
        }

        return res.json({
            status: "success",
            message:order.message,
            data:order.order
        });

    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};

export const completeReturn = async(req:Request , res:Response)=>{
    try{
        const {orderId} = req.params;
        if(!orderId) return res.status(400).json({message:"Missing order id"});

        const foundOrder = await getOrderService(orderId , req.role , req.id);
        if (!foundOrder) return res.status(404).json({ message: "Order not found!" }); 
        if(!checkOwnershipOrAdmin(foundOrder , req))  return res.status(403).json({message: "Forbidden"});

        const order = await completeReturnRequest(orderId);
        if(order.status !== 200){
            return res.json({
                status: order.status,
                message:order.message
            });
        }

        return res.json({
            status: "success",
            message:order.message,
            order:order.order
        });

    }catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            status: "fail",
            message: err.message
        })
    };
};
