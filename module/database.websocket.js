console.log("Loaded Module: lucsoft.database.websocket 2019 by lucsoft");
var database = [];
database.apiurl = "";
database.loggedIn = false;
database.profile = {};
database.type = "websocket";

database.login = (email, password, error2, callback) => {
    database.socket = new WebSocket(database.apiurl);
    database.socket.onmessage = (x) => {
        try {
            var response = JSON.parse(x.data);
            if (response.login == "require authentication") {
                database.socket.send(JSON.stringify({
                    "action": "login",
                    "type": "client",
                    "email": email,
                    "password": password
                }));
            } else if (response.login == false) {
                error2();
            } else if (response.login == true) {
                database.account = { client: response.client, email: email };
                database.function.getUser();
            } else if (response["type"] == "sync") {
                database.message(response, database.socket);
            } else if (response["client"]["id"] == database.account.client.id) {
                database.profile = response;
                callback();
            }
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    };
};
database.function = {};
database.message = (e, socket) => { console.log(e) };
database.function.getUser = (user = "@me") => {
    database.socket.send(JSON.stringify({
        "action": "account",
        "target": {
            "user": user,
            "data": "all"
        },
        "auth": database.account.client
    }))
}
database.function.setvDevice = (address, state) => {
    database.socket.send(JSON.stringify({
        "action": "trigger",
        "type": "vdevices",
        "data": {
            "address": address,
            "state": state
        },
        "auth": database.account.client
    }))
}