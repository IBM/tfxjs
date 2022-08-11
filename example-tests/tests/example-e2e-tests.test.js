const tfxjs = require("tfxjs");
const tfx = new tfxjs("../", {
  trigger_value: "example-e2e-tests",
  shuffle_count: 3,
});

tfx.apply("Hashicorp Provider Example Tests", () => {
  tfx.state(
    "Data Resources",
    tfx.address("data.external.example", {
      id: "-",
      program: ["sh", "./test-output.sh", "example", "test"],
      result: {
        data: "example-test-value",
      },
    })
  );
  tfx.state(
    "Local Files",
    tfx.address(
      "data.local_file.lists",
      {
        index_key: "list_1",
        content: "ponder,consider,opt,preordain,brainstorm,portent",
        content_base64:
          "cG9uZGVyLGNvbnNpZGVyLG9wdCxwcmVvcmRhaW4sYnJhaW5zdG9ybSxwb3J0ZW50",
        filename: "./local-files/shuffle_list_1.txt",
      },
      {
        index_key: "list_2",
        content: "scout,slinger,warrior,builder,settler",
        content_base64: "c2NvdXQsc2xpbmdlcix3YXJyaW9yLGJ1aWxkZXIsc2V0dGxlcg==",
        filename: "./local-files/shuffle_list_2.txt",
      }
    )
  );
  tfx.state(
    "Count Null Resource",
    tfx.address(
      "null_resource.count_example",

      {
        id: tfx.expect("to match the regex ^d+$", (id) => {
          // Make sure the id matches the string
          return id.match(/^\d+$/g)[0] === id;
        }),
        triggers: {
          trigger_value: "example-e2e-tests",
        },
      },
      {
        id: tfx.expect("to match the regex ^d+$", (id) => {
          // Make sure the id matches the string
          return id.match(/^\d+$/g)[0] === id;
        }),
        triggers: {
          trigger_value: "example-e2e-tests",
        },
      },
      {
        id: tfx.expect("to match the regex ^d+$", (id) => {
          // Make sure the id matches the string
          return id.match(/^\d+$/g)[0] === id;
        }),
        triggers: {
          trigger_value: "example-e2e-tests",
        },
      }
    )
  );
  tfx.state(
    "For Each Resource",
    tfx.address(
      "null_resource.map_example",
      {
        index_key: "example",
        id: tfx.expect("to match the regex ^d+$", (id) => {
          // Make sure the id matches the string
          return id.match(/^\d+$/g)[0] === id;
        }),
        triggers: {
          trigger_value: "example-e2e-tests",
        },
      },
      {
        index_key: "test",
        id: tfx.expect("to match the regex ^d+$", (id) => {
          // Make sure the id matches the string
          return id.match(/^\d+$/g)[0] === id;
        }),
        triggers: {
          trigger_value: "example-e2e-tests",
        },
      },
      {
        index_key: "value",
        id: tfx.expect("to match the regex ^d+$", (id) => {
          // Make sure the id matches the string
          return id.match(/^\d+$/g)[0] === id;
        }),
        triggers: {
          trigger_value: "example-e2e-tests",
        },
      }
    )
  );
  tfx.state(
    "Random Pet Resource",
    tfx.address("random_pet.random_example", {
      id: tfx.expect("to have 5 total segments seperated by hyphens.", (id) => {
        return id.split("-").length === 5;
      }),
      length: 3,
      prefix: "example-acceptance",
      separator: "-",
    })
  );
  tfx.state(
    "Random Shuffle",
    tfx.address(
      "random_shuffle.shuffle_example",
      {
        index_key: "list_1",
        keepers: {
          shuffle_count: "3",
        },
        result_count: 3,
        input: [
          "ponder",
          "consider",
          "opt",
          "preordain",
          "brainstorm",
          "portent",
        ],
        result: tfx.expect("to contain 3 entries from the list.", (inputs) => {
          let foundCount = 0;
          inputs.forEach((resource) => {
            if (
              [
                "ponder",
                "consider",
                "opt",
                "preordain",
                "brainstorm",
                "portent",
              ].indexOf(resource) !== -1
            )
              foundCount++;
          });
          return foundCount === 3;
        }),
      },
      {
        index_key: "list_2",
        keepers: {
          shuffle_count: "3",
        },
        result_count: 3,
        input: ["scout", "slinger", "warrior", "builder", "settler"],
        result: tfx.expect("to contain 3 entries from the list.", (inputs) => {
          let foundCount = 0;
          inputs.forEach((resource) => {
            if (
              ["scout", "slinger", "warrior", "builder", "settler"].indexOf(
                resource
              ) !== -1
            )
              foundCount++;
          });
          return foundCount === 3;
        }),
      }
    )
  );
  tfx.state(
    "Example Module",
    tfx.address("module.example_module.random_pet.random_example", {
      id: tfx.expect("to have 4 total segments seperated by hyphens.", (id) => {
        return id.split("-").length === 4;
      }),
      length: 2,
      prefix: "acceptance-module",
      separator: "-",
    })
  );
  tfx.state(
    "Ping Test",
    tfx.address("module.ping_module.random_shuffle.ping_test", {
      keepers: {
        shuffle_count: "1",
      },
      result_count: 1,
      input: ["8.8.8.8"],
      result: tfx.tfutils.connectionTest((address) => {
        return tfx.connect.ping.doesConnect("ping test", address);
      }),
    })
  );
});
