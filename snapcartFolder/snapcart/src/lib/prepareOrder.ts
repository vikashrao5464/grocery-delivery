import Grocery from "@/models/grocery.model";

type RequestedItem={grocery:string;quantity:number};

export async function prepareOrderItems(items:unknown){
  if(!Array.isArray(items) || items.length===0){
    throw new Error("Cart is empty");
  }

  const requested:RequestedItem[]=items.map((item)=>{
    const value=item as Partial<RequestedItem>;
    const quantity=Number(value.quantity);
    if(!value.grocery || !Number.isInteger(quantity) || quantity<1 || quantity>50){
      throw new Error("Invalid cart item");
    }
    return {grocery:String(value.grocery),quantity};
  });

  const groceries=await Grocery.find({_id:{$in:requested.map((item)=>item.grocery)}}).lean();
  const groceryMap=new Map(groceries.map((item)=>[String(item._id),item]));

  const orderItems=requested.map((requestedItem)=>{
    const grocery=groceryMap.get(requestedItem.grocery);
    if(!grocery) throw new Error("A grocery item is no longer available");
    return {
      grocery:grocery._id,
      name:grocery.name,
      price:Number(grocery.price),
      unit:grocery.unit,
      image:grocery.image,
      quantity:requestedItem.quantity
    };
  });

  const subTotal=orderItems.reduce((sum,item)=>sum+item.price*item.quantity,0);
  const deliveryFee=subTotal>100?0:40;
  return {orderItems,totalAmount:subTotal+deliveryFee};
}
