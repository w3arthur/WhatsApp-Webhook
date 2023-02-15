const PORT = process.env.PORT || 3500;
//to set on .env        //require("dotenv").config();
const MY_TOKEN = "arthur"; //token, verify the webhook     //to change
const ACCESS_TOKEN = "EAAM3hNlK66kBAFpDp46Sm96wRMVdMV2GIjZAcH46weO46U9104jHBD4bjcaJNXjaGSNVzlburD7TKeo7iFqXqTvT83wIVICZCuNu7460KmjX63HwzQzKnvKQX8KIoLUeLZAaP6ykuWHkjFy3WShCaR9AHEb1bPyZBcH4ElZCwykdSGZCpDIEDmfRlhXS1YDhkZCCpCriPjbIwZDZD"; //token, sending the request    //to change
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log('hi');

app.route("/test").all(async (req, res) => {
    return res.status(200).send('test ok');
});


app.route("/webhook")
    .get(async (req, res) => {
        const mode = req.query["hub.mode"];
        const challenge = req.query["hub.challenge"];
        const token = req.query["hub.verify_token"];

        if (mode == 'subscribe' && token == MY_TOKEN)
            return res.status(200).send(challenge);
        else return res.status(403).send('webhook issue');
    })
    .post(async (req, res) => {
        const body_param = req.body;
        console.log(JSON.stringify(body_param, null, 2));
        if (
            ody_param.object
            && body_param.entry
            && body_param.entry[0]?.changes[0]?.value?.messages
            && body_param.entry[0].changes[0].value.messages[0]
        ) {
            const { phone_number_id } = body_param.entry[0].changes[0].value.metadata;
            const { from } = body_param.entry[0].changes[0].value.messages[0];
            const msg_body = body_param.entry[0].changes[0].value.messages[0].text?.body;
            // ^ take care!
            axios({
                method: 'POST'
                , url: 'https://graph.facebook.com/v15.0/' + phone_number_id + '/messages?access_toke=' + ACCESS_TOKEN //116346754706966
                , headers: {
                    Authorization: 'Bearer ' + ACCESS_TOKEN
                    , 'Content-Type': 'application/json'
                }
                , data: JSON.stringify({
                    messaging_product: "whatsapp"
                    , to: from
                    , text: {
                        body: "hi, this is Arthur Response"
                    }
                })
            });
            console.log('webhook, ok!!!'); //to delete
            return res.sendStatus(200);
        } else {
            console.log('webhook, failed'); //to delete
            return res.sendStatus(404);
        }
    })
    ;

app.route("/**").all(async (req, res) => {
    return res.status(404).send('page not found');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}, Express`));