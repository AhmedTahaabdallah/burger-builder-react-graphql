exports.getAllIngredients = function getAllIngredients(admin) {
    return admin.firestore().collection('ingredients').get().then(snapshot => {
        let data = null;
        snapshot.forEach(doc => {
            const orderData = doc.data();
            data = {
              'totalPrice': orderData.totalPrice,
              'ingredients': orderData.ingredients,
            };
        });
        return data;
    });
}