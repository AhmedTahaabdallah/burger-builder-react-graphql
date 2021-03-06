const bcrypt = require('bcryptjs');
const validator = require('validator');
const {createUserToken} = require('../../helper/token');

exports.createNewUser =  async function createNewUser(admin, username, email, password) {
    const errors = [];
    if(validator.isEmpty(username)
    || !validator.isLength(username, { min: 5 })){
        errors.push({ message: 'username too short'});
    }
    if(!validator.isEmail(email)){
        errors.push({ message: 'Email is invalid'});
    }
    if(validator.isEmpty(password)
    || !validator.isLength(password, { min: 5 })){
        errors.push({ message: 'password too short'});
    }
    if(errors.length > 0){
        let msg = '';
        errors.forEach((err, index) => {
            msg += err.message;
            if(index < errors.length - 1) {
                msg += ' and ';
            }
        });
        return {
            'status': 422,
            'msg': msg,
            'id': null,
            'tokken': null,
            'username': null            
        };
    }
    const usersCollection = admin.firestore().collection('users');
    const doc = await usersCollection.where('email', '==', email).get();
    if (doc.empty) {
        const hashedPw = await bcrypt.hash(password.trim(), 12);
        const FieldValue = admin.firestore.FieldValue;
        const newUser = await usersCollection.add({
            'create_at': FieldValue.serverTimestamp(),
            'username': username.trim(),
            'type': 'user',
            'email': email.trim(),
            'password': hashedPw,
        });
        const newUserId = newUser.id;
        if(newUserId){
            await usersCollection.doc(newUserId).update({
            'id': newUserId
            });
            const token = await createUserToken(newUserId, email);
            return {
                'status': 200,
                'msg': 'successfully registered...',
                'id': newUserId,
                'tokken': token,
                'username': username
            };
        } else{
            return {
                'status': 201,
                'msg': 'No registration completed...',
                'id': null,
                'tokken': null,
                'username': null            
            };
        }
    } else {
        return {
            'status': 201,
            'msg': 'email exists..',
            'id': null,
            'tokken': null,
            'username': null
        };
    }
}