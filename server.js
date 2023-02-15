const PORT = process.env.PORT || 3500;
const MY_TOKEN = "arthur";      //to change
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log('hi');

app.route("/test").all(async (req, res) => {
    return res.status(200).send('test ok');
});


app.route("/webhook").all(async (req, res) => {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];

    if (mode == 'subscribe' && token == MY_TOKEN)
        return res.status(200).send(callenge);
    else return res.status(403).send(challenge);
});

app.route("/**").all(async (req, res) => {
    return res.status(404).send('page not found');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}, Express`));