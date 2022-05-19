//******** Création de nos middleware ********/
//Ici nous importons le plugin bcrypt afin de crypter les mot de passes utilisateur
const bcrypt = require('bcrypt');

//Ici nous importons le plugin pour vérifier les tokens d'authentification
const jwt = require('jsonwebtoken');
//Ici ont required models User
const User = require('../models/User');

//Ici nous créons la function pour crée un nouvelle utilisateur
exports.signup = (req, res, next) => {
    //Ici ont utilise la function bcrypt.hash() afin de crypter nos mots de passe
    bcrypt.hash(req.body.password, 10) //<=== Ici nous lui passons le mot de passe et nous lui disons de faire 10 tours de hashage
        .then(hash =>{
            //Ici nous créons un nouveau User que l'ont va enregistré dans la base de donnée
            const user = new User({
                //Ont lui passe l'email fournis dans le corps de la requête
                email: req.body.email,
                //Ont lui passe le mot de passe hasher. Afin de ne pas le stocker en blanc
                password: hash
            });
            user.save()
            .then(() => res.status(201).json({message: 'Utilisateur crée !'}))
            //Ont utilise le .catch si il y a une erreur pour renvoyer un code d'erreur 400 (pour le différencier de l'erreur 500 ligne 25)
            .catch(error => res.status(400).json({error}))
        })
        //Ont utilise le .catch si il y a une erreur pour renvoyer un code d'erreur 500
        .catch(error => res.status(500).json({error}))
};

//Ici nous créons la function pour connecter des utilisateur déja existant
exports.login = (req, res, next) => {
    //Ici findOne pour trouver l'utilisateur dans la base de données.
    User.findOne({ email: req.body.email}) //<=== Ici nous voulons que l'adresse mail correspond avec l'adresse mail envoyer dans la requête
        //Ici ont vérifie si la promise a réussis a récupéré un User ou non.
        .then(user => {
            if (!user){
                //Si aucun utilisateur n'est trouver, on renvoie une erreur 404 et un json avec "Utilisateur non trouvé !"
                return res.status(401).json({error : 'Utilisateur non trouvé !'})
            }
            //Ici ont utilise bcrypt.compare pour comparer le mot de passe envoyer avec la requête, avec le hash enregistré dans notre document user
            bcrypt.compare(req.body.password, user.password)
            .then(valid =>{
                //Si valid est false ça veux dire que l'utilisateur a rentrée un mot de passe incorrect
                if (!valid){
                    //Ici si on trouve l'user mais que le mot de passe est incorrect, on renvoie une erreur 401 ainsi que 'Mot de passe incorrect !'
                    return res.status(401).json({error : 'Mot de passe incorrect !'})
                }
                //Si valid est true, on renvoie un status 200. Puis, nous renvoyer un fichier json qui contient l'identifiant de l'utilisateur ainsi que le token
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        { userId: user._id },
                        'TOKEN',
                        { expiresIn: '24H' }
                    )
                });
            })
            //Ici le catch sert seulement si il y a un problème de connexion.
            .catch(error => res.status(500).json({error}))
        })
        //Ici le catch sert seulement si il y a un problème de connexion.
        .catch(error => res.status(500).json({error}))
};