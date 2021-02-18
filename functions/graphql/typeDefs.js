const typeDefs = `
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

    type Ingredients {
        bacon: Int
        cheese: Int
        meat: Int
        salad: Int
    }

    type oneOrder {
        id: String!
        price: Float
        deliveryMethod: String
        ingredients: Ingredients
        customer: Customer
    }

    type oneOrderOutput {
        status: String
        msg: String
    }

    type Query {
        getAllOrders: [oneOrder]
    }

    type Mutation {
        createNewOrde(price: Float!, deliveryMethod: String!, email: String!, name: String!, country: String!, street: String!, zipCode: String!, bacon: Int!, cheese: Int!, meat: Int!, salad: Int!): oneOrderOutput!
    }
`;

module.exports = typeDefs;