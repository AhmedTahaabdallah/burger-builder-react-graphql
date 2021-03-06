const { getUserToken } = require('../../helper/token');

exports.getAllOrdersProcess = async function getAllOrdersProcess(admin, req) {
    const userId = await getUserToken(admin, req);
    if(!userId) {
        return {
            status: 401,
            msg: 'not Auth...',
            allOrders: []
        };
    }    
    return admin.firestore().collection('orders').where('userId', '==', userId).orderBy('create_at', 'desc').get().then(snapshot => {
        let data = [];
        snapshot.forEach(doc => {
            const orderId = doc.id;
            const orderData = doc.data();
            const oneData = {
              'id': orderId,
              'price': orderData.price,
              'deliveryMethod': orderData.deliveryMethod,
              'ingredients': orderData.ingredients,
              'customer': {
                  'email': orderData.customer.email,
                  'name': orderData.customer.name,
                  'address': {
                      'street': orderData.customer.address.street,
                      'country': orderData.customer.address.country,
                      'zipCode': orderData.customer.address.zipCode,
                  },
              }
            };
            data.push(oneData);
        });
        return {
            status: 200,
            msg: 'get all orders successfull...',
            allOrders: data
        };
    });
}