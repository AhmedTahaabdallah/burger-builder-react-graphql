
exports.createNewOrder = async function createNewOrder(admin, price, deliveryMethod, email, name, country, street, zipCode, ingredients) {
    console.log(deliveryMethod);
    const ordersCollection = admin.firestore().collection('orders');
    const FieldValue = admin.firestore.FieldValue;
    const newOrder = await ordersCollection.add({
        price: price,
        deliveryMethod: deliveryMethod,
        customer: {
            email: email,
            name: name,
            address: {
                country: country,
                street: street,
                zipCode: zipCode,
            }
        },
        ingredients: ingredients,
        'create_at': FieldValue.serverTimestamp(),
    });
    if(newOrder) {
        return {
            'status': 'done',
            'msg': 'Order Created..',
            'orderId': newOrder.id
        };
    } else {
        return {
            'status': 'notdone',
            'msg': 'Order not Created..',
            'orderId': null
        };
    }    
}