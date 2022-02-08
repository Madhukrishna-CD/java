import { listGiftCard, getGiftCardbyGAN } from "../../service/squreup";
import { Request, Response } from "express";
import GiftCard from "./../../models/gift_card";
export default async (req: Request, res: Response) : Promise<any> => {
    try{
        const { status, limit, type, card_id} = req.query;
        const result = card_id ?  await getGiftCardbyGAN(String(card_id)) : await listGiftCard(type ?String(type) : undefined, status? String(status):undefined, limit ? Number(limit):undefined);
        const final = [];
        for(const card of result){
            const dbinfo = (await GiftCard.findOne({ where : {gift_card_id : card.id}}))?.toJSON();
            const cardInfo = { ...card, ...dbinfo};
            final.push(cardInfo);
    }
    return res.json(final);}
    catch(err){
        res.json(err.body?JSON.parse(err.body): {errors: err.message});        
    }
};