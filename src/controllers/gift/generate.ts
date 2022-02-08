import { Request, Response } from "express";
import GiftCard from "./../../models/gift_card";
import Order from "./../../models/order";
import { createGiftCard, createOrder, processPayment, activateGiftCard, getGiftCard } from "../../service/squreup";
import sendGiftCard from  "../../helpers/emailer/sendgiftcard";
export default async (req:Request, res:Response) => {
    interface requestBody {
        recipients?: ({
            email?: string;
            message?: string;
            first_name?: string;
            last_name?: string;
            phone?: string;
            delivery_date?: number;
            cost: number;
            type: "PHYSICAL" | "DIGITAL";
            physical_card_id?: string;
          })[] | null;
        agreements: {
            sms: boolean;
            news_letters: boolean;
          };
        purchaser?: {
            first_name?: string;
            last_name?: string;
            email?: string;
            phone?: string;
          };
        payment_source_id: string;
        total_cost: number;
      }

      const body : requestBody = req.body;
        try{
        const cards = [];
        for(const recipient of body.recipients){
            let giftCard;
            if(recipient.type === "DIGITAL"){
                giftCard = (await createGiftCard(recipient.type)).giftCard; 
            }
            if(recipient.type === "PHYSICAL"){
                giftCard = (await createGiftCard(recipient.type, recipient.physical_card_id)).giftCard;
            }

            let newInfo = giftCard as typeof giftCard & typeof recipient & { gift_card_id: string, order_id : number, order_item_uid: string };
                newInfo = { ...giftCard, ...recipient};
                newInfo.gift_card_id = newInfo.id;
                delete newInfo.id;
                delete newInfo.balanceMoney;
                newInfo.delivery_date = recipient.delivery_date ?? +new Date();
                newInfo.initial_amount = recipient.cost;
                cards.push(newInfo);
        }

        const {order} = await createOrder(body.recipients);
        const {payment} = await processPayment(body.payment_source_id, order.id, body.total_cost);
        const orderInfo = await Order.create({ 
            order_id : order.id, 
            order_amount : Number(order.totalMoney.amount), 
            purchaser_first_name: body.purchaser?.first_name, 
            purchaser_last_name : body.purchaser?.last_name, 
            purchaser_phone : body.purchaser?.phone, 
            purchaser_email: body.purchaser?.email,
            payment_id : payment.id,
            items : order.lineItems.map(item => item.uid)
        });

        const cardToStore = cards.map((c, i) => { c.order_id =  orderInfo.order_id; c.order_item_uid =  order.lineItems[i].uid; return c; });
        await GiftCard.bulkCreate(cardToStore);

        for(const card of cardToStore){
           await activateGiftCard(card.order_id, card.initial_amount, card.gift_card_id, card.order_item_uid);
            await GiftCard.update({ state : "ACTIVE"}, { where: { gift_card_id : card.gift_card_id } });
            card.state = "ACTIVE";
            if(card.email) await sendGiftCard(card.email, card.gan);
        }
        
        return res.json(cardToStore);
        }
        catch(err){
            res.json(err.body?JSON.parse(err.body): {errors: err.message});       
        }
    };

