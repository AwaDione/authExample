const jwt = require('jsonwebtoken')

exports.identifier = (req, res, next) => {
    let token
    if (req.headers.client === 'not browser') {
        token = req.headers.authorization
    } else {
        token = req.cookies['Authorization']
    }

    if (!token) {
        return res.status(403).json({ success: false, message: "Pas autorisé!" })
    }
    try {
        const userToken = token.split(' ')[1]
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET)
        if(jwtVerified){
            req.user = jwtVerified
            next()
        } else {
            throw new Error("Erreur dans le token");
            
        }
    } catch (error) {
        console.log(error);
        
    }
}

// exports.identifier = (req, res, next) => {
//     let token;

//     // Vérification de l'origine de la requête
//     if (req.headers.client === 'not browser') {
//         token = req.headers.authorization;
//     } else {
//         token = req.cookies['Authorization'];
//     }

//     // Vérifier si le token est présent
//     if (!token) {
//         return res.status(403).json({ success: false, message: "Pas autorisé !" });
//     }

//     try {
//         // Extraire le token si "Bearer " est présent
//         const userToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

//         // Vérifier le token
//         const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);

//         if (!jwtVerified) {
//             return res.status(401).json({ success: false, message: "Token invalide !" });
//         }

//         // Ajouter l'utilisateur dans req.user pour les prochaines middlewares/routes
//         req.user = jwtVerified;
//         next();
//     } catch (error) {
//         console.error("Erreur JWT :", error);
//         return res.status(401).json({ success: false, message: "Token invalide ou expiré !" });
//     }
// };
