const jwt = require("jsonwebtoken");

//Authentication
const authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if (!token) 
        token= req.headers["X-Api-Key"]
        if (!token) return res.status(400).send({ status: false, msg: "You are not logged in. Token is Missing." })
        try {
            decodeToken =  await jwt.verify(token, "GKjdk@Xp2")
            if(!decodeToken) return res.status(401).send({status:false, message:"Invalid authentication"})
        } catch (err) {
            return res.status(401).send({ status: false, msg: "Invalid Token", error: err.message })
        }

        req.authorId = decodeToken.authorId
        next()
    } catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}

module.exports.authentication = authentication

