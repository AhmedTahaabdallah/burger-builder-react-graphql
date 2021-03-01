const typeDefs = `
    scalar JSON

    type CustomerAddress {
        country: String
        street: String
        zipCode: String
    }

    type Customer {
        email: String
        name: String
        address: CustomerAddress
    }

    type oneOrder {
        id: String!
        price: Float
        deliveryMethod: String
        ingredients: JSON
        customer: Customer
    }

    type oneOrderOutput {
        status: String
        msg: String
        orderId: String
    }

    type allIngredients {
        totalPrice: Float
        ingredients: JSON
    }

    type Query {
        getAllIngredients: allIngredients
        getAllOrders: [oneOrder]
    }

    type Mutation {
        createNewOrder(price: Float!, deliveryMethod: String!, email: String!, name: String!, country: String!, street: String!, zipCode: String!, ingredients: JSON): oneOrderOutput!
    }
`;

module.exports = typeDefs;