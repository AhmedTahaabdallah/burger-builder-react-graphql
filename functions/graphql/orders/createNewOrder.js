const { getUserToken } = require('../../helper/token');

exports.createNewOrder = async function createNewOrder(admin, req, price, deliveryMethod, email, name, country, street, zipCode, ingredients) {
    const userId = await getUserToken(admin, req);
    if(!userId) {
        return {
            'status': 401,
            'msg': 'not Auth..',
            'orderId': null
        };
    }
    const ordersCollection = admin.firestore().collection('orders');
    const FieldValue = admin.firestore.FieldValue;
    const newOrder = await ordersCollection.add({
        userId: userId,
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
            'status': 200,
            'msg': 'Order Created..',
            'orderId': newOrder.id
        };
    } else {
        return {
            'status': 201,
            'msg': 'Order not Created..',
            'orderId': null
        };
    }    
}