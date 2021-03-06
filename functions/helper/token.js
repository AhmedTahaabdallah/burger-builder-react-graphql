const jwt = require('jsonwebtoken');

const secretKey = "somesupersecretsecret";

exports.createUserToken = async function(id, email) {
    const token = jwt.sign({
            userId: id,
            email: email
        },
        secretKey,
        { expiresIn: '8760h'}
    );
    return token;
};

exports.getUserToken = async function(admin, req) {
    const authHeader = req.headers['authorization'];
    if(!authHeader){
        return null;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, secretKey);
        if(!decodedToken){
            return null;
        }  
        const usersCollection = admin.firestore().collection('users');
        const snapshot = await usersCollection.where('id', '==', decodedToken.userId).get();
        if (snapshot.empty) { 
            return null;
        } else {
            return decodedToken.userId;
        }
    } catch (err) {
        console.log('getUserToken err : ', err);
        return null;
    }      
};