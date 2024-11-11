import { Arikedb, ValueType, VarEvent, Event } from "@arikedb/core";


new Arikedb({
    username: "ale",
    password: "ale",
}).connect()
.then(client => {
    client.createCollections(["jsColl1"])
    .then((res) => {
        console.log(res);
    })
    .then(() => {
        client.collection("jsColl1")
        .then(collection => {
            collection.createTsVariables(
                [
                    ["var1", ValueType.Int],
                    ["var2", ValueType.String]
                ]
            )
            .then(variables => {
                collection.tsVariablesSubscribe(
                    ["var2"],
                    [
                        {
                            event: Event.OnKeep,
                        },
                        {
                            event: Event.OnValueLeaveVal,
                            str_value: "Alejandro"
                        }
                    ]
                ).subscribe((data) => {
                    console.log(data);
                })
            }).catch(err => {
                console.log(err);
            })
        }).catch(err => {
            console.log(err);
        })
    }).catch(err => {
        console.log(err);
    })
    
}).catch(err => {
    console.log(err);
});

console.log("Start");
