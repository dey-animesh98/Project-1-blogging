const authorModel = require("../Models/authorModel")
const jwt = require("jsonwebtoken")


const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;                                 //email validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/    //password validation                                             

const validTitle = function (title) {                                                             //enum validation
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidRequest = function (request) {
    return (Object.keys(request).length > 0)
}

// Author Creation
const createAuthor = async function (req, res) {
    try {
        const authData = req.body
        const { fname, lname, title, email, password } = authData  //****Destructuring method

        if (!isValidRequest(authData)) return res.status(400).send({ status: false, message: "No input by user." })

        if (!isValid(fname)) return res.status(400).send({ status: false, msg: "Please enter the required field fName" }) //required filled can't be blank

        if (!isValid(lname)) return res.status(400).send({ status: false, msg: "Please enter the required field lName" })

        if (!validTitle(title)) return res.status(400).send({ status: false, msg: "Please enter the required field title" })

        if (!isValid(email)) return res.status(400).send({ status: false, msg: "Please enter the required field email" })

        if (!isValid(password)) return res.status(400).send({ status: false, msg: "Please enter the required field password" })

        // Email Validation
        if (!emailRegex.test(email)) return res.status(400).send({ status: false, msg: "Please provide valid email" })

        // Unique Email
        const usedEmail = await authorModel.findOne({ email: email })
        if (usedEmail) return res.status(400).send({ status: false, msg: "Email Id already exists." })

        // Password Validation
        if (!passwordRegex.test(password))
            return res.status(400).send({ status: false, msg: "Your password must contain atleast one number,uppercase,lowercase and special character[ @ $ ! % * ? & ] and length should be min of 6-15 charachaters" })

        const authValidData = { fname, lname, title, email, password }
        const newAuthor = await authorModel.create(authValidData);
        return res.status(201).send({ status: true, data: newAuthor });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}


// Author Login
const loginAuthor = async function (req, res) {
    try {
        const credentials = req.body
        const { email, password } = credentials
        if (!isValidRequest(credentials)) return res.status(400).send({ status: false, message: "No input by user for login." })

        if (!isValid(email)) return res.status(400).send({ status: false, msg: "email is required." })
       
        if (!isValid(password)) return res.status(400).send({ status: false, msg: "Password is required." })
       
        if(!emailRegex.test(email)) return res.status(400).send({ status: false, msg: "Please provide valid email" })
       
        const getAuthor = await authorModel.findOne({ email })//.select({ password: 1 })
        if (!getAuthor) return res.status(404).send({ status: false, msg: "Author not found with this email" })

        const providedPassword =  getAuthor.password
        if (password != providedPassword) return res.status(401).send({ status: false, msg: "Password is incorrect." })
        //To create token
        const token = await jwt.sign({
            authorId: getAuthor._id,
            iat: Math.floor(Date.now()/1000),
            exp: Math.floor(Date.now()/1000)+ 20*60*60
        }, "GKjdk@Xp2");

        res.header("x-api-key", token);
        res.status(200).send({ status: true, msg: "Author login successful", data: { token } })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}


module.exports.createAuthor = createAuthor;
module.exports.loginAuthor =loginAuthor;


