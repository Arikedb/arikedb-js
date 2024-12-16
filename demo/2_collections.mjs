import { Arikedb } from "@arikedb/core";


async function main() {
    new Arikedb({host: "localhost", port: 6923, username: "admin", password: "password"}).connect()
    .then(async client => {
        console.log("Connected");

        await client.collections()
        .then((collections) => {
            console.log("Collections:", collections.map((c) => c.name));
        });

        await client.createCollections(["collection1", "collection2"])
        .then((result) => {
            console.log("Collections created:", result);
        });

        await client.collections()
        .then((collections) => {
            console.log("Collections:", collections.map((c) => c.name));
        });

        await client.deleteCollections(["collection2"])
        .then(() => {
            console.log("Collections deleted.");
        });

        await client.collections()
        .then((collections) => {
            console.log("Collections:", collections.map((c) => c.name));
        });

        client.disconnect()
        .then(() => {
            console.log("Disconnected");
        })
    });
}

await main();
