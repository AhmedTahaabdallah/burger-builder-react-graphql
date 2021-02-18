
exports.getAllOrdersProcess = function getAllOrdersProcess(admin) {
    return admin.firestore().collection('orders').orderBy('create_at', 'desc').get().then(snapshot => {
        let data = [];
        snapshot.forEach(doc => {
            const orderId = doc.id;
            const orderData = doc.data();
            const oneData = {
              'id': orderId,
              'price': orderData.price,
              'deliveryMethod': orderData.deliveryMethod,
              'ingredients': {
                'bacon': orderData.ingredients.bacon,
                'cheese': orderData.ingredients.cheese,
                'meat': orderData.ingredients.meat,
                'salad': orderData.ingredients.salad,
              },
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
        return data;
    });
}