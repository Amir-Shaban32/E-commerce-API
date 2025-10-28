import { Request,Response } from "express";
import {z} from 'zod';
import ordersModel from "../models/orders.model";
import cartModel from "../models/cart.model";
import { clearCartService } from "../services/cart.services";
import ApiFeatures from '../utils/apiFeatures';
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
        const {filter , sort } = getOrdersServices(req.query);
        const features = new ApiFeatures(ordersModel.find(filter).sort(sort), req.query).limitFields().paginate();
        const orders = await features.model.sort(sort);
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
        
        const order = await ordersModel.findById(orderId);
        if(!order) return res.status(404).json({message:"Order not found!"});
        // check if id comming from middleware is the same as id here
        if(!checkOwnershipOrAdmin(order , req))  return res.status(403).json({ message: "Forbidden" });
        
        const foundOrder = await getOrderService(orderId,req.role , req.id);
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
        const {shipping_address , payment_status,phone_number} = req.body;

        const user_id = req.id;
        const foundCart = await cartModel.findOne({user_id});
        if(!foundCart || foundCart.items.length < 1) 
             return res.status(404).json({ message: "Cart is empty" });

        const items = foundCart.items;
        const foundUser = await checkoutService(user_id , items);
        if(!foundUser)   return res.status(404).json({ message: "User not found!" });

        const order = await ordersModel.create({
            user_id,
            order_items:foundUser.order_items,
            shipping_address,
            payment_status,
            phone_number,
            delivery_status:"pending",
            total:foundUser.total
        });

        await clearCartService(user_id);
        res.json({
            status: "success",
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

// update existing Order
export const updateOrder = async (req:Request , res:Response) =>{
    try{        
        const {orderId} = req.params;
        if(!orderId) return res.status(400).json({message:"Missing user Id!"});

        const order = await ordersModel.findById(orderId);
        if(!checkOwnershipOrAdmin(order , req))  return res.status(403).json({ message: "Forbidden" });
        
        const validationSchema = req.role === ROLES_LIST.admin
            ?adminUpdateOrderValidation:updateOrderValidation;

        const foundOrder = await updateOrderService(orderId,req.body,validationSchema);
        if(foundOrder.status === 404) return res.status(404).json({ message: foundOrder.message });
        if(foundOrder.status === 400) return res.status(400).json({ message: foundOrder.message });
        
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
        const product_id = req.params.item_id;
        if(!product_id) return res.status(400).json({message:"Missing Product Id!"});

        const user_id = req.id;
        const foundOrder = cancellation_reason?
            await cancelItemService(user_id , product_id , cancellation_reason)
            :await cancelItemService(user_id , product_id);
        if(!foundOrder) return res.status(404).json({ message: "Order not found!" });
        if(!checkOwnershipOrAdmin(foundOrder , req))  return res.status(403).json({message: "Forbidden"});

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

        const order = await ordersModel.findOne({user_id});
        if (!order) return res.status(404).json({ message: "Order not found!" }); 
        if(!checkOwnershipOrAdmin(order , req))  return res.status(403).json({message: "Forbidden"});

        const cancelled_by = req.role === ROLES_LIST.admin ? 'admin' : "customer";
        const foundOrder = cancellation_reason?
            await cancelOrderService(user_id ,cancelled_by ,cancellation_reason):
            await cancelOrderService(user_id , cancelled_by);
        if(!foundOrder) return res.status(404).json({ message: "Order not found!" });

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
        const user_id = req.id;
        const foundOrders = await ordersModel.find({user_id});
        if(!foundOrders) return res.status(404).json({ message: "Order not found!" });
    
        res.json({
            status: "success",
            data: foundOrders.map(order => ({
              orderId: order._id,
              status: order.delivery_status
            }))
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
        const valid = updateStatusValidation.safeParse(req.body);
        if (!valid.success) {
            return res.status(400).json({
                status: "fail",
                message: z.treeifyError(valid.error) 
            });
        }

        const foundOrder = await ordersModel.findById(orderId);
        if(!foundOrder) return res.status(404).json({ message: "Order not found!" });
        if(!checkOwnershipOrAdmin(foundOrder , req))  return res.status(403).json({message: "Forbidden"});
        
        foundOrder.delivery_status = valid.data.delivery_status;
        foundOrder.delivered_at = new Date;
        foundOrder.completed_at = new Date;
        await foundOrder.save();    
        res.json({
            status: "success",
            message: `Order is ${foundOrder.delivery_status}`,
            data: foundOrder
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

        const order = await ordersModel.findById(orderId);
        if(!order) return res.status(404).json({message:"Order not found!"});
        if(!checkOwnershipOrAdmin(order, req)) return res.status(403).json({message:"Forbidden!"});

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

        const foundOrder = await ordersModel.findById(orderId);
        if(!foundOrder) return res.status(404).json({message:"Order not found"});
        if(!checkOwnershipOrAdmin(foundOrder , req)) return res.status(403).json({message:"Forbidden"});

        const order = await processReturnDecision(orderId,return_status);
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

        const foundOrder = await ordersModel.findById(orderId);
        if(!foundOrder) return res.status(404).json({message:"Order not found"});
        if(!checkOwnershipOrAdmin(foundOrder , req)) return res.status(403).json({message:"Forbidden"});

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
