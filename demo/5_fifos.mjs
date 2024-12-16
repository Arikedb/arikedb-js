import { Arikedb, ValueType, VarEvent, Event } from "@arikedb/core";


async function main() {
    new Arikedb({host: "localhost", port: 6923, username: "admin", password: "password"}).connect()
    .then(async client => {
        console.log("Connected");

        let collection1 = await client.collection("collection1");

        await collection1.fifos()
        .then((fifos) => {
            console.log("Fifos:", fifos.map((s) => [s.name, s.vtype]));
        });

        await collection1.createFifos(
            [
                ["fifo1", ValueType.Int, 3],
                ["fifo2", ValueType.Float],
                ["fifo3", ValueType.String, 5]
            ]
        )

        await collection1.fifos()
        .then((fifos) => {
            console.log("Fifos:", fifos.map((s) => [s.name, s.vtype]));
        });

        await collection1.deleteFifos(["fifo3"])
        .then(() => {
            console.log("Fifos deleted.");
        });

        await collection1.fifos()
        .then((fifos) => {
            console.log("Fifos:", fifos.map((s) => [s.name, s.type, s.size]));
        });

        await collection1.fifosPush(
            [
                { name: "fifo1", int: [1, -2, 4] },
                { name: "fifo2", float: [1.3, -2.23, 4.789] },
            ]
        );

        await collection1.fifosPull([
            { name: "fifo1", n: 2 },
            { name: "fifo2", n: 4 }
        ])
        .then((values) => {
            console.log("Values:", values);
        });

        let fifo1 = await collection1.fifo("fifo1");

        await fifo1.push([90, 120, 2]);

        await fifo1.pull(2)
        .then((values) => {
            console.log("Values:", values);
        });
    });
}

await main();
