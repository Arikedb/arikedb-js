import { Arikedb } from "@arikedb/core";


new Arikedb({host: "localhost", port: 6923}).connect()
.then(client => {
    console.log("Connected");
    client.disconnect()
    .then(() => {
        console.log("Disconnected");
    })
});
