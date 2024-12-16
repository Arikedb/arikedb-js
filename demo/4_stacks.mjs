import { Arikedb, ValueType, VarEvent, Event } from "@arikedb/core";


async function main() {
    new Arikedb({host: "localhost", port: 6923, username: "admin", password: "password"}).connect()
    .then(async client => {
        console.log("Connected");

        let collection1 = await client.collection("collection1");

        await collection1.stacks()
        .then((stacks) => {
            console.log("Stacks:", stacks.map((s) => [s.name, s.vtype]));
        });

        await collection1.createStacks(
            [
                ["stack1", ValueType.Int, 3],
                ["stack2", ValueType.Float],
                ["stack3", ValueType.String, 5]
            ]
        )

        await collection1.stacks()
        .then((stacks) => {
            console.log("Stacks:", stacks.map((s) => [s.name, s.vtype]));
        });

        await collection1.deleteStacks(["stack3"])
        .then(() => {
            console.log("Stacks deleted.");
        });

        await collection1.stacks()
        .then((stacks) => {
            console.log("Stacks:", stacks.map((s) => [s.name, s.type, s.size]));
        });

        await collection1.stacksPut(
            [
                { name: "stack1", int: [1, -2, 4] },
                { name: "stack2", float: [1.3, -2.23, 4.789] },
            ]
        );

        await collection1.stacksPop([
            { name: "stack1", n: 2 },
            { name: "stack2", n: 4 }
        ])
        .then((values) => {
            console.log("Values:", values);
        });

        let stack1 = await collection1.stack("stack1");

        await stack1.put([90, 120, 2]);

        await stack1.pop(2)
        .then((values) => {
            console.log("Values:", values);
        });
    });
}

await main();
