const bcrypt = require('bcryptjs');
const validator = require('validator');
const {createUserToken} = require('../../helper/token');

exports.userLogin =  async function userLogin(admin, email, password) {  
    const errors = [];
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
    const snapshot = await usersCollection.where('email', '==', email).get();
    if (!snapshot.empty) {    
        let userData;
        snapshot.forEach((doc) => {
            userData = doc.data();   
        });    
        const isEqual = await bcrypt.compare(password, userData.password);
        if(!isEqual){
            return {
                'status': 201,
                'msg': 'The email or password you entered is incorrect...',
                'id': null,
                'tokken': null,
                'username': null
            };
        }      
        const token = await createUserToken(userData.id, email);
        return {
            'status': 200,
            'msg': 'successfully login...',
            'id': userData.id,
            'tokken': token,
            'username': userData.username
        };
    } else {
        return {
            'status': 201,
            'msg': 'The email or password you entered is incorrect..',
            'id': null,
            'tokken': null,
            'username': null
        };
    }
  }