require("dotenv").config
// Importing modules
const express = require("express");
const app = express()
const cors = require("cors")
const user = require("./models/users")
const bcrypt = require("bcryptjs")
const path = require("path")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

// Express router
// const router = express.Router()

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(cookieParser())

// Database Connection
const connection = require("./db")
connection()

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "signup.html"))
})
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"))
})
app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "home.html"))
})
// Sign up route
app.post("/signup", async (req, res) => {
    try {
        // Getting data from user body
        const { firstName, lastName, email, password } = req.body;
        // Check if all fields are filled
        if (!(firstName && lastName && email && password)) {
            return res.status(401).json({ message: "Please fill all fields" })
        }
        // Check if user already exists in database
        const ExistingUser = await user.findOne({ email })
        if (ExistingUser) {
            return res.status(401).json({ message: "User Already Exists" })
        }
        // encrypt password
        const hashedPassword = await bcrypt.hash(password, 10)
        // Add user in database
        const CurrUser = await user.create({ firstName, lastName, email, password: hashedPassword })

        // Generate a token for user
        const token = jwt.sign({ id: CurrUser._id, email }, process.env.JWTSECRET, { expiresIn: "7d" });

        CurrUser.token = token
        CurrUser.password = undefined

        res.status(201).json(user)
        console.log(CurrUser)
    } catch (err) {
        console.log(err)
    }
})

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if all fields are filled
        if (!(email && password)) {
            return res.status(401).json({ message: "Fill all details" })
        }
        // Check if User exists
        const User = await user.findOne({ email });
        if (User && (await bcrypt.compare(password, User.password))) {
            const token = jwt.sign(
                { id: User._id },
                process.env.JWTSECRET,
                {
                    expiresIn: "1d"
                }
            )
            User.token = token;
            User.password = undefined;

            // Cookies
            const options = {
                // Expires in 3 hours
                expires: new Date(Date.now() + 3 * 60 * 60 * 1000),
                httpOnly: true
            };
            // Send token in user cookies
            return res.status(200).cookie("token", token, options).json({ success: true, token })
        }
        res.status(401).json({ message: "Wrong Credentials" })


    } catch (err) {
        console.log(err)
    }
})



// Connecting to Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`)
})