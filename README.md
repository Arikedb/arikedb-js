# arikedb-js

Arikedb-js is a JavaScript client for interacting with the Arikedb database. It provides a set of APIs to manage collections, stacks, FIFOs, sorted lists, and time-series variables.

## Installation

To install the package, use npm:

```bash
npm install @arikedb/core
```

## Connecting to the Database

```js
import { Arikedb } from "@arikedb/core";

new Arikedb({host: "localhost", port: 6923}).connect()
.then(client => {
    console.log("Connected");
    client.disconnect()
    .then(() => {
        console.log("Disconnected");
    })
});
```

## Managing Collections

```js
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
```

## Using Time Series Variables

```js
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
```

## Using Stacks

```js
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
```

## Using FIFOs

```js
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
```

## Using Sorted Lists

```js
import { Arikedb, ValueType, VarEvent, Event } from "@arikedb/core";

async function main() {
    new Arikedb({host: "localhost", port: 6923}).connect()
    .then(async client => {
        console.log("Connected");

        let collection1 = await client.collection("collection1");

        await collection1.sortedLists()
        .then((slists) => {
            console.log("Sorted Lists:", slists.map((s) => [s.name, s.vtype]));
        });

        await collection1.createSortedLists(
            [
                ["slist1", ValueType.Int, 30],
                ["slist2", ValueType.Float],
                ["slist3", ValueType.Bool, 5]
            ]
        )

        await collection1.sortedLists()
        .then((slists) => {
            console.log("Sorted Lists:", slists.map((s) => [s.name, s.vtype]));
        });

        await collection1.deleteSortedLists(["slist3"])
        .then(() => {
            console.log("Sorted Lists deleted.");
        });

        await collection1.sortedLists()
        .then((slists) => {
            console.log("Sorted Lists:", slists.map((s) => [s.name, s.vtype]));
        });

        await collection1.sortedListsInsert(
            [
                { name: "slist1", int: [5, 0, 9, -10, -3, -90, 87, 5, -93, 12] },
                { name: "slist2", float: [1.3, -2.23, 4.789, -0.123] },
            ]
        );

        await collection1.sortedListsBiggest([
            { name: "slist1", n: 2 },
            { name: "slist2", n: 4 }
        ])
        .then((values) => {
            console.log("Big Values:", values);
        });

        await collection1.sortedListsSmallest([
            { name: "slist1", n: 2 },
            { name: "slist2", n: 4 }
        ])
        .then((values) => {
            console.log("Small Values:", values);
        });

        let slist1 = await collection1.sortedList("slist1");

        // await slist1.insert([5, -93, 12])

        await slist1.biggest(200)
        .then((values) => {
            console.log("Big Values:", values);
        });

        await slist1.smallest(3)
        .then((values) => {
            console.log("Small Values:", values);
        });
    });
}

await main();
```

## API Documentation
### Classes
 - [Arikedb](https://github.com/Arikedb/arikedb-js/blob/main/src/core.ts#L1159)
 - [Collection](https://github.com/Arikedb/arikedb-js/blob/main/src/core.ts#L224)
 - [Stack](https://github.com/Arikedb/arikedb-js/blob/main/src/core.ts#L93)
 - [Fifo](https://github.com/Arikedb/arikedb-js/blob/main/src/core.ts#L131)
 - [SortedList](https://github.com/Arikedb/arikedb-js/blob/main/src/core.ts#L169)
 - [TsVariable](https://github.com/Arikedb/arikedb-js/blob/main/src/core.ts#L58)
