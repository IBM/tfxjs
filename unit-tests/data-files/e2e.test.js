const tfxjs = require("../../lib/index");
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
        id: "2896328915849982980",
        triggers: {
          trigger_value: "example-e2e-tests",
        },
      },
      {
        id: "3935907870916963842",
        triggers: {
          trigger_value: "example-e2e-tests",
        },
      },
      {
        id: "5150844839615547579",
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
        id: "1620629581596704678",
        triggers: {
          trigger_value: "example-e2e-tests",
        },
      },
      {
        index_key: "test",
        id: "3242962864108601982",
        triggers: {
          trigger_value: "example-e2e-tests",
        },
      },
      {
        index_key: "value",
        id: "5042942514776818409",
        triggers: {
          trigger_value: "example-e2e-tests",
        },
      }
    )
  );
  tfx.state(
    "Random Pet Resource",
    tfx.address("random_pet.random_example", {
      id: "example-acceptance-friendly-liberal-coral",
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
        result: ["opt", "portent", "ponder"],
      },
      {
        index_key: "list_2",
        keepers: {
          shuffle_count: "3",
        },
        result_count: 3,
        input: ["scout", "slinger", "warrior", "builder", "settler"],
        result: ["slinger", "scout", "warrior"],
      }
    )
  );
  tfx.state(
    "Example Module",
    tfx.address("module.example_module.random_pet.random_example", {
      id: "acceptance-module-arriving-pheasant",
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
      result: ["8.8.8.8"],
    })
  );
});
