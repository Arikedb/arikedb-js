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
