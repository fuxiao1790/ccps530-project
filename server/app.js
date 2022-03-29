const Express = require('express')
const Cors = require("cors")
const Fs = require('fs')
const Bcrypt = require('bcryptjs')
const Jwt = require('jsonwebtoken')
const fetch = require('node-fetch')

const PORT = 8080
const USER_DATA_FILE_NAME = "./users.json"
const JWT_SECRET = "cDuO8EaVdp6cQUh8oVt0$JjiQw95szbLov/dWB8q27VqrkZYU1$2aUMZBO$CGwnWtyjXqIj4Fka"
const API_KEY = "19de64c3-0f0a-4b45-a6ea-2efdf02936e1"

const app = Express()

const PrintEndpoint = (req, _, next) => {
    console.log(req.url)
    next()
}

const GetGeolocationData = async (ip = "") => {
    try {
        const res = await fetch(`https://api.ipfind.com?ip=${ip}&auth=${API_KEY}`)
        const data = await res.json()

        if (data.error) {
            return { error: data.error }
        }

        return data

    } catch(error) {
        return { error: error }
    }
}

const CreateSignedJwtWihtUsername = (username = "") => Jwt.sign({username: username}, JWT_SECRET)

const VerifyJwt = (req, res, next) => {

    if (!req.headers.authorization || 
        !req.headers.authorization instanceof String || 
        req.headers.authorization.length == 0) {

        res.status(403)
        res.json({error: "no auth info"})
        return
    }

    const token = GetTokenFromAuthHeadaer(req.headers.authorization)
    if (!Jwt.verify(token, JWT_SECRET)) {
        res.json({error: "bad token"})
        return
    }

    next()
}

const CheckUserNameAndPassword = (req, res, next) => {

    if (!req.body.password instanceof String || 
        !req.body.username instanceof String || 
        !req.body.username || 
        !req.body.password ||
        req.body.password.length == 0 ||
        req.body.username.length == 0) {

        res.status(400)
        res.json({error: "username or password empty"})
        return
    }

    next()
}

const GetUserDataByUsername = (username = "") => {
    const user_data = JSON.parse(Fs.readFileSync(USER_DATA_FILE_NAME))
    console.log(user_data)

    if (!user_data.hasOwnProperty(username)) {
        return {
            username: "",
            hash: "",
            exists: false
        }
    }

    const hash = user_data[username]

    return {
        username: username,
        hash: hash,
        exists: true
    }
}

const AddNewUser = (username = "", hash = "") => {
    const user_data = JSON.parse(Fs.readFileSync(USER_DATA_FILE_NAME))
    user_data[username] = hash
    Fs.writeFileSync(USER_DATA_FILE_NAME, JSON.stringify(user_data))
}

const GetTokenFromAuthHeadaer = (str = "") => {
    const temp = str.split(" ")
    if (temp.length == 1) {
        return temp[0]
    }

    return temp[1]
}

const LoginHandler = (req, res) => {
    const user_data = GetUserDataByUsername(req.body.username)

    if (!user_data.exists) {
        res.status(400)
        res.json({error: "username password mismatch"})
        return
    }

    if (!Bcrypt.compareSync(req.body.password, user_data.hash)) {
        res.status(400)
        res.json({error: "username password mismatch"})
        return
    }

    const token = CreateSignedJwtWihtUsername(user_data.username)
    res.status(200)
    res.json({
        token: token,
        username: user_data.username,
    })
}

const RegisterHandler = (req, res) => {
    const user_data = GetUserDataByUsername(req.body.username)

    if (user_data.exists) {
        res.status(400)
        res.json({error: "username not available"})
        return
    }

    const salt = Bcrypt.genSaltSync()
    const hash = Bcrypt.hashSync(req.body.password, salt)

    AddNewUser(req.body.username, hash)

    const token = CreateSignedJwtWihtUsername(user_data.username)
    res.status(200)
    res.json({
        token: token,
        username: user_data.username,
    })
}

const LookupHandler = async (req, res) => {
    if (!req.query.ip || !req.query.ip instanceof String || req.query.ip.length === 0) {
        res.json({error: "ip is empty"})
        return
    }

    const data = await GetGeolocationData(req.query.ip)
    if (data.error) {
        res.json({error: data.error})
        return
    }

    res.json(data)
}

const Init = () => {
    app.use(Cors())
    app.use(Express.json())
}

const Start = () => {
    app.post("/login", 
        PrintEndpoint,
        CheckUserNameAndPassword, 
        LoginHandler,
    )

    app.post("/register", 
        PrintEndpoint,
        CheckUserNameAndPassword, 
        RegisterHandler,
    )

    app.get("/lookup", 
        PrintEndpoint, 
        VerifyJwt, 
        LookupHandler,
    )

    app.get("/", (_, res) => res.sendStatus(200))
}

Init()
Start()
console.log(`STARTING SERVER AT PORT: ${PORT}`)
app.listen(PORT)