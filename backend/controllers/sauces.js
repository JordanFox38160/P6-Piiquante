const Sauce = require('../models/sauces');

const fs = require('fs');

exports.createSauces = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
}

exports.modifySauces = async (req, res, next) => {
  if ((user => user === req.body.userId)){
    const imgUploaded = Boolean(req.file)
    let initialSauce;
    const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };

    if (imgUploaded) {
      //load initialSauce
      initialSauce = await Sauce.findOne({_id: req.params.id});
    }
      
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => {
        if (imgUploaded) {
          //  pdeleterevious image
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {});
        }
        res.status(200).json({ message: 'Objet modifié !' })
      })
      .catch(error => {console.log(error); res.status(400).json({error: {message: error.message}})});
  }
}

exports.deleteSauces = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then(sauce =>{
    //Ici on supprime l'image de la sauce
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
    });
  })
  .catch(error => res.status(500).json({ error }));
}

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(404).json({ error }));
}

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
}

//Gestion des likes
exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      let options = {
        $inc: {},
        _id: req.params.id
      };
      const hasLiked = sauce.usersLiked.find(userId => userId == req.body.userId);
      const hasDisliked = sauce.usersDisliked.find(userId => userId == req.body.userId);

      //Ici ont gère l'ajout de like
      switch (req.body.like) {
        case 1:
          //Si l'utilisateur a déja liker, alors on renvoie une erreur.
          if (hasLiked) {
            res.status(400).json({message: "L'utilisateur a déja liker cette sauce"});
          }
          //Ici on ajoute le like dans la priopriété $inc de notre objet options
          options.$inc.likes = 1;
          options.$push = {usersLiked: req.body.userId}

          //Si l'utilisateur a mis un dislike, alors on l'enlêve.
          if (hasDisliked) {
            options.$inc.dislikes = -1;
            options.$pull = {usersDisliked: req.body.userId}
          } 

          break;

        //Ici ont gère l'ajout de dislike
        case -1:
          //Si l'utilisateur a déja disliker, alors on renvoie une erreur.
          if (hasDisliked) {
            res.status(400).json({message: "L'utilisateur a déja disliker cette sauce"});
          }
          
          //Ici on ajoute le dislike dans la priopriété $inc de notre objet options
          options.$inc.dislikes = 1;
          options.$push = {usersDisliked: req.body.userId}
 
          //Si l'utilisateur a mis un like, alors on l'enlêve
          if (hasLiked) {
            options.$inc.likes = -1;
            options.$pull = {usersLiked: req.body.userId}
          } 
  
        break;

        //Ici ont vérifie si l'utilisateur a déja mis un like ou un dislike
        case 0:
          if (hasLiked) {
            //Ici on enleve le like dans la priopriété $inc de notre objet options
            options.$inc.likes = -1;
            options.$pull = {usersLiked: req.body.userId}
          }
 
          //Si l'utilisateur a mis un dislike, alors on l'enlêve
          if (hasDisliked) {
            options.$inc.dislikes = -1;
            options.$pull = {usersDisliked: req.body.userId}
          } 
          break;
        default:
          //generer erreur car valeur non traitée
          res.status(400).json({message: 'Unsupported like parameter value'});
      }

      Sauce.updateOne({ _id: req.params.id }, options)
        .then(() => { res.status(201).json({ message: 'Avis pris en compte' }); })
        .catch((error) => { res.status(400).json({ error: error }); });
    });
}
//   switch (req.body.like) {
//     //Ici avec case on vérifie qu'il n'y a pas déja de like
//     case 0: 
//       //Ici on trouve la sauce par rapport a son _id
//       Sauce.findOne({ _id: req.params.id })
//         .then((sauce) => {
//           // Si l'utilisateur a DEJA like, alors ont enlêve un like
//           if (sauce.usersLiked.find(user => user === req.body.userId)) {
//             Sauce.updateOne({ _id: req.params.id }, {
//               $inc: { likes: -1 }, //Ici on utilise la propriété $inc pour enlever un like
//               $pull: { usersLiked: req.body.userId }, //Ici on utilise la propriété $pull pour enlever un like du tableau
//               _id: req.params.id
//             })
//               .then(() => { res.status(201).json({ message: 'Avis pris en compte' }); })
//               .catch((error) => { res.status(400).json({ error: error }); });

//         //Ici avec case on vérifie qu'il n'y a pas déja de dislike
//           // Si l'utilisateur a DEJA dislike, alors ont enlêve un dislike
//           } if (sauce.usersDisliked.find(user => user === req.body.userId)) {
//             Sauce.updateOne({ _id: req.params.id }, {
//               $inc: { dislikes: -1 }, //Ici on utilise la propriété $inc pour enlever un dislike
//               $pull: { usersDisliked: req.body.userId }, //Ici on utilise la propriété $inc pour enlever un dislike du tableau
//               _id: req.params.id
//             })
//               .then(() => { res.status(201).json({ message: 'Avis pris en compte' }); })
//               .catch((error) => { res.status(400).json({ error: error }); });
//           }
//         })
//         .catch((error) => { res.s4tatus(404).json({ error: error }); });
//       break; //Ici on utilise break pour terminé la fonction une fois qu'elle est executer

//     // Ajout de like (+1)
//     case 1: //Ici avec case on vérifie si il y a deja un like
//       Sauce.updateOne({ _id: req.params.id }, {
//         $inc: { likes: 1 }, //Ici on utilise la propriété $inc pour ajouter un like
//         $push: { usersLiked: req.body.userId }, //Ici on utilise la propriété $push pour ajouter le like au tableau usersLiked
//         _id: req.params.id
//       })
//         .then(() => { res.status(201).json({ message: 'Ton like a été pris en compte' }); })
//         .catch((error) => { res.status(400).json({ error: error }); });
//       break;//Ici on utilise break pour terminé la fonction une fois qu'elle est executer

//     // Ajout des dislikes (+1)
//     case -1: //Ici avec case on vérifie qu'il y a bien un dislike
//       Sauce.updateOne({ _id: req.params.id }, {
//         $inc: { dislikes: 1 }, //Ici on utilise la propriété $inc pour ajouter un dislike
//         $push: { usersDisliked: req.body.userId }, //Ici on utilise la propriété $push pour ajouter le like au tableau usersDisliked
//         _id: req.params.id
//       })
//         .then(() => { res.status(201).json({ message: 'Ton dislike a été pris en compte' }); })
//         .catch((error) => { res.status(400).json({ error: error }); });
//       break;//Ici on utilise break pour terminé la fonction une fois qu'elle est executer
//   }
// }