//to set on .env        //require("dotenv").config();
const MY_TOKEN = "arthur"; //token, verify the webhook     //to change
const ACCESS_TOKEN = "EAAM3hNlK66kBAKYUyyN3LLzUXCwFTFop6kLgNnOFxeBg0lj7PbPYiddemcZC6QRDVWxIsfMAZAAV2SGtWEJL2sLdDqZCN52oRasd9fZB4PJZCLHdTSbhuuq7q8vBiMoEeSy2tZCke8X0NsR9TITEZBfhKyyZAZBf7B9itKm1G1dEujMsBD2WUOmTPckZBlNTdGGxCHX8q32vaySwZDZD";
//token, sending the request    //to change
const mongoDBConnectionString = 'mongodb+srv://legopart:WfHIGKcxMGsllNS4@cluster0.uwlwx.mongodb.net/' + 'webhook';

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



//mongodb
const mongoose = require("mongoose");
function makeNewConnection(uri) {
    const db = mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true, });
    db.on('error', function (error) { console.log(`MongoDB :: connection ${this.name} ${JSON.stringify(error)}`); db.close().catch(() => console.log(`MongoDB :: failed to close connection ${this.name}`)); });
    db.on('connected', function () { console.log(`MongoDB :: connected ${this.name}`); /* mongoose.set('debug', function (col, method, query, doc) { console.log(`MongoDB :: ${this.conn.name} ${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)})`); });*/ });
    db.on('disconnected', function () { console.log(`MongoDB :: disconnected ${this.name}`); });
    return db;
}

const mongoose1 = makeNewConnection(mongoDBConnectionString);


//Schemes
const MessageSchema = new mongoose.Schema({ message: { type: String, index: false }, createdAt: { type: Date, index: -1 }, }, { timestamps: true, });

//module and validator
const CommentModel = mongoose1.model("Log", MessageSchema); //logs


console.log('run');

app.route("/test").all(async (req, res) => {
    try {
        const data = { message: '~test~' };
        await CommentModel(data).save();
        return res.status(200).send('test ok');
    } catch (e) { }
});


app.route("/webhook1")
    .get(async (req, res) => {
        try {
            const mode = req.query["hub.mode"];
            const challenge = req.query["hub.challenge"];
            const token = req.query["hub.verify_token"];

            const data0 = { message: '?????' };
            await CommentModel(data0).save();

            if (mode == 'subscribe' && token == MY_TOKEN) {
                const data = { message: 'MY_TOKENMY_TOKENMY_TOKEN' };
                await CommentModel(data).save();
                return res.status(200).send(challenge);
            }
            else {
                const data = { message: 'token for webhook failed' };
                await CommentModel(data).save();
                return res.status(403).send('webhook issue')
            };

        } catch (e) {
            try {
                const data = { message: 'catch get webhook' + JSON.stringify(e) };
                await CommentModel(data).save();
                return res.sendStatus(400);
            } catch (e) { }
        }
    })
    .post(async (req, res) => {
        try {
            const body_param = req.body;
            console.log(JSON.stringify(body_param, null, 2));

            const data1 = { message: JSON.stringify(body_param, null, 2) };
            await CommentModel(data1).save();

            const data0 = { message: 'is:' + body_param.entry[0].changes[0].value.messages[0] ? 'true' : 'false' };
            await CommentModel(data0).save();


            if (
                //body_param?.object
                body_param?.entry[0]?.changes[0]?.value?.messages
                && body_param.entry[0].changes[0].value.messages[0]
            ) {

                const { phone_number_id } = body_param.entry[0].changes[0].value.metadata;
                const { from } = body_param.entry[0].changes[0].value.messages[0];
                const msg_body = body_param.entry[0].changes[0].value.messages[0].text?.body;
                //^ take care!


                const data2 = { message: JSON.stringify('webhook, axios ok!!! ' + 'phone_number_id (' + JSON.stringify(phone_number_id) + ') ' + 'from (' + JSON.stringify(from) + ')' + 'msg_body (' + JSON.stringify(msg_body) + ')') };
                await CommentModel(data2).save();


                await axios({
                    method: 'POST'
                    , url: 'https://graph.facebook.com/v15.0/' + phone_number_id + '/messages?access_toke=' + ACCESS_TOKEN //116346754706966
                    , headers: {
                     //   Authorization: 'Bearer ' + ACCESS_TOKEN
                        /*,*/ 'Content-Type': 'application/json'
                    }
                    , data: JSON.stringify({
                        messaging_product: "whatsapp"
                        , to: from
                        , text: {
                            body: "hi, this is Arthur Response"
                        }
                    })
                });


                console.log(''); //to delete
                return res.sendStatus(200);
            } else {
                console.log('webhook, failed'); //to delete
                const data3 = { message: 'webhook, axios fail' };
                await CommentModel(data3).save();
                return res.sendStatus(404);
            }

        } catch (e) {
            try {
                const data = { message: 'catch post webhook' + JSON.stringify(e) };
                await CommentModel(data).save();
                return res.sendStatus(400);
            } catch (e) { }
        }
    });

app.route("/*").all(async (req, res) => {
    try {
        const data = { message: '~empty~' };
        await CommentModel(data).save();
        return res.status(404).send('page not found');
    } catch (e) { }
});



const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`Listening on port ${PORT}, Express`));