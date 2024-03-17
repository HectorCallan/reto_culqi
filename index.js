const express = require('express');
const redis = require('redis');

const client = redis.createClient();

client.on('connect', () => {
    console.log('Connected to Redis12345');
})

const app = express();
const jwt = require('jsonwebtoken');

// const validate = require("validate.js");
require('dotenv').config();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

var validation = {
    isEmailAddress:function(str) {
        var pattern =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return pattern.test(str);  // returns a boolean
    },
    isNotEmpty:function (str) {
        var pattern =/\S+/;
        return pattern.test(str);  // returns a boolean
    },
    isNumber:function(str) {
        var pattern = /^\d+\.?\d*$/;
        return pattern.test(str);  // returns a boolean
    },
    isSame:function(str1,str2){
        return str1 === str2;
    }
};  

app.get('/', (req, res) => {
    res.send('Hola mundo');
});

app.get('/getUserInformation', validateToken, (req, res) => {
    client.get('user', (err, reply) => {
        if(err) res.json({status: -1, message: "Error connect value"})
        reply = JSON.parse(reply);
        reply = {
            "status": 0,
            "email": reply.email,
            "cardNumber": reply.cardNumber,
            "expYear": reply.expYear,
            "expMonth": reply.expMonth,
        }
        res.json(reply);
    });
});

app.get('/login', (req, res) => {
    res.send(`<html>
                    <head>
                        <title>Acceder POS</title>
                    </head>
                    <body>
                        <form method="POST" action="/auth">
                            Email: <input type="text" name="txtEmail"> <br/>
                            Card Number: <input type="text" name="txtCardNumber"> <br/>
                            CVV: <input type="text" name="txtCvv"> <br/>
                            Expiration Year: <input type="text" name="txtExpYear"> <br/>
                            Expiration Mont: <input type="text" name="txtExpMonth"> <br/>
                            <input type="submit" value="Iniciar sesion" />
                        </form>
                    </body>
                </html>
    `);
});

app.post('/auth', (req, res) => {
    let message             = "";
    let status              = 0;
    let numberExpression    = /^[0-9]$/;
    var today               = new Date();
    var yearToday           = today.getFullYear();
    let validMaxYear        = yearToday + 5;

    // -----------------------------------
    console.log("Send params body");
    const {txtEmail, txtCardNumber, txtCvv, txtExpYear, txtExpMonth} = req.body;
    console.log(req.body);
    // ------------------------------------

    // Validation params
    var validateNumberCard = validationNumberCard(txtCardNumber);

    if( validateNumberCard.status != 0 ){
        status = -1;
        return res.json({
            message: validateNumberCard.message,
            status: -1
        });
    }

    if( !validation.isNumber(txtCvv) ){
        status = -1;
        return res.json({
            message: "CVV is not numeric",
            status: -1
        });
    }

    if( txtCvv.length < 3 || txtCvv.length > 4 ){
        status = -1;
        return res.json({
            message: "CVV incorrect number characters",
            status: -1
        });
    }

    if( !validation.isNumber(txtExpYear) ){
        status = -1;
        return res.json({
            message: "Expiration Year is not numeric",
            status: -1
        });
    }

    if( txtExpYear > validMaxYear ){
        status = -1;
        return res.json({
            message: "Expiration Year not valid",
            status: -1
        });
    }

    if( !validation.isNumber(txtExpMonth) ){
        status = -1;
        return res.json({
            message: "Expiration Month is not numeric",
            status: -1
        });
    }

    if( txtExpMonth < 1 || txtExpMonth > 12 ){
        status = -1;
        return res.json({
            message: "Expiration Month not valid",
            status: -1
        });
    }

    // consultar BD y validar que existe usuario
    // username como password
    const peticionPos = {email: txtEmail, cardNumber: txtCardNumber, cvv: txtCvv, expYear: txtExpYear, expMonth: txtExpMonth };
    const accessToken = generateAccessToken(peticionPos);
    const userPeticionPos = {email: txtEmail, cardNumber: txtCardNumber, expYear: txtExpYear, expMonth: txtExpMonth, token: accessToken };

    // --------------------------------------------------------------------
    // Redis client save user
    client.set('user', JSON.stringify(userPeticionPos), (err, reply) => {
        if( err ) console.log( err );
        console.log(reply);

        // Response authorization
        res.header('authorization', accessToken).json({
            message: 'Usuario autenticado',
            token: accessToken
        });
    });
});

function generateAccessToken(peticionPos){
    return jwt.sign(peticionPos, process.env.SECRET, {expiresIn: '1m'});
}

function validateToken(req, res, next){
    const accessToken = req.headers['authorization'] || req.query.accessToken;
    if( !accessToken ) res.send('Access denied');

    jwt.verify(accessToken, process.env.SECRET, (err, user) => {
        if(err){
            res.send('Access denied, token expired o incorrect');
        }else{
            req.user = user;
            next();
        }
    });
}

function validationNumberCard(cardNumber){
    let status = 0;
    let tipoTarjeta = "";
    let message = "Card Number incorrect";
    VISA = /^4[0-9]{3}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}$/;
    MASTERCARD = /^5[1-5][0-9]{2}-?[0-9]{4}-?[0-9]{4}-?[0-9]   {4}$/;
    AMEX = /^3[47][0-9-]{16}$/;
    CABAL = /^(6042|6043|6044|6045|6046|5896){4}[0-9]{12}$/;
    NARANJA =   /^(589562|402917|402918|527571|527572|0377798|0377799)[0-9]*$/;

    if(luhn(cardNumber)){
        if(cardNumber.match(VISA)){
            tipoTarjeta = "VISA";
        }
        if(cardNumber.match(MASTERCARD)){
            tipoTarjeta = "MASTERCARD";
        }
        if(cardNumber.match(NARANJA)){
            tipoTarjeta = "NARANJA";
        }
        if(cardNumber.match(AMEX)){
            tipoTarjeta = "AMEX";
        }
        message = "Card Number correct";
    } else {
        status = -1;
    }

    return {
        message : message,
        status : status,
        data: {
            tipoTarjeta: tipoTarjeta
        }
    }
}

function luhn(value) {
    // Accept only digits, dashes or spaces
    if (/[^0-9-\s]+/.test(value)) return false;
    // The Luhn Algorithm. It's so pretty.
    let nCheck = 0, bEven = false;
    value = value.replace(/\D/g, "");
    for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n),
        nDigit = parseInt(cDigit, 10);
        if (bEven && (nDigit *= 2) > 9) nDigit -= 9; nCheck +=  nDigit; bEven = !bEven;
    }
    return (nCheck % 10) == 0;
}
app.listen(3000, () => {
    console.log('servidor iniciado...');
});