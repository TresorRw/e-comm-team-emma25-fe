 interface orderproduct {
    orderid: number;
    price: number;
    productName: string;
    productId: string;
}

export interface OrderItem {
    Orderid: 35,
    expectedDeliveryDate: Date;
    amountPaid: number,
    userId: number,
    paymentid: string,
    status: string,
    createdAt: string,
    updatedAt: string,
    orderProducts: orderproduct | null
}