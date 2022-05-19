const mongoose = require('mongoose');

//Ici ont importe le plugin mongoose unique validator pour empecher l'utilisateur de se plusieurs compte avec la même adresse email
const uniqueValidator = require('mongoose-unique-validator');

//Ici nous créons un schema grace a moongoose
const userSchema = mongoose.Schema({
    //Ici ici required un email de type string (L'email de l'utilisateur)
    email : { type: String, required: true, unique: true},
    //Ici ici required un mot de passe de type string (Le mot de passe de l'utilisateur)
    password : { type: String, required: true},
});

//Ici ont importe le plugin mongoose unique validator a notre userSchema
userSchema.plugin(uniqueValidator);

//Ici nous exportons le model. Nous nommons le model 'User' et nous lui passons le userSchema crée précédement
module.exports = mongoose.model('User', userSchema);