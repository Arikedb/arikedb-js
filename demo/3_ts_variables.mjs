import { Arikedb, ValueType, VarEvent, Event } from "@arikedb/core";


async function main() {
    new Arikedb({host: "localhost", port: 6923, username: "admin", password: "password"}).connect()
    .then(async client => {
        console.log("Connected");

        let collection1 = await client.collection("collection1");

        await collection1.tsVariables()
        .then((variables) => {
            console.log("Variables:", variables.map((v) => [v.name, v.type]));
        });

        await collection1.createTsVariables(
            [
                ["var1", ValueType.Int],
                ["var2", ValueType.Float],
                ["var3", ValueType.String],
                ["var4", ValueType.Bool]
            ]
        )

        await collection1.tsVariables()
        .then((variables) => {
            console.log("Variables:", variables.map((v) => [v.name, v.vtype]));
        });

        await collection1.deleteTsVariables(["var3", "var4"])
        .then(() => {
            console.log("Variables deleted.");
        });

        await collection1.tsVariables()
        .then((variables) => {
            console.log("Variables:", variables.map((v) => [v.name, v.vtype]));
        });

        await collection1.tsVariablesSet(
            [
                { name: "var1", int: 12 },
                { name: "var2", float: 42.5 }
            ]
        );

        await collection1.tsVariablesGet(["var1", "var2"])
        .then((values) => {
            console.log("Values:", values);
        });

        let sub = collection1.tsVariablesSubscribe(
            ["var1", "var2"],
            [
                new VarEvent(Event.OnValueInRange, undefined, 0, 80, ValueType.Int),
                new VarEvent(Event.OnValueLeaveRange, undefined, 0.0, 10.0, ValueType.Float)
            ]
        ).subscribe((value) => {
            console.log(value.name, value.timestamp, value.name === "var1" ? value.int : value.float);
        });

        let count = 0;
        const id = setInterval(() => {
            if (count++ > 1000) {
                clearInterval(id);
                return;
            }
            collection1.tsVariablesSet(
                [
                    { name: "var1", int: Math.floor(Math.random() * 100) },
                    { name: "var2", float: Math.random() * 100.0 }
                ]
            );
        }, 10);

        setTimeout(() => {
            sub.unsubscribe();
            client.disconnect()
            .then(() => {
                console.log("Disconnected");
            })
        }, 12000);
    });
}

await main();
