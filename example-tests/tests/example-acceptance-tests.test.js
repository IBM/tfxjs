const tfxjs = require("../../lib/index");
const tfx = new tfxjs("../", "apikey");

tfx.plan("Hashicorp Provider Example Tests", () => {
  tfx.module(
    "Root Module",
    "root_module",
    tfx.resource("Count Example 0", "null_resource.count_example[0]", {
      triggers: {
        trigger_value: "this-is-a-test",
      },
    }),
    tfx.resource("Count Example 1", "null_resource.count_example[1]", {
      triggers: {
        trigger_value: "this-is-a-test",
      },
    }),
    tfx.resource("Count Example 2", "null_resource.count_example[2]", {
      triggers: {
        trigger_value: "this-is-a-test",
      },
    }),
    tfx.resource(
      "Map Example Example",
      'null_resource.map_example["example"]',
      {
        triggers: {
          trigger_value: "this-is-a-test",
        },
      }
    ),
    tfx.resource("Map Example Test", 'null_resource.map_example["test"]', {
      triggers: {
        trigger_value: "this-is-a-test",
      },
    }),
    tfx.resource("Map Example Value", 'null_resource.map_example["value"]', {
      triggers: {
        trigger_value: "this-is-a-test",
      },
    }),
    tfx.resource("Random Pet Example", "random_pet.random_example", {
      keepers: null,
      length: 3,
      prefix: "example-acceptance",
      separator: "-",
    }),
    tfx.resource(
      "Shuffle Example 1",
      'random_shuffle.shuffle_example["list_1"]',
      {
        input: [
          "ponder",
          "consider",
          "opt",
          "preordain",
          "brainstorm",
          "portent",
        ],
        keepers: {
          shuffle_count: "2",
        },
        result_count: 2,
      }
    ),
    tfx.resource(
      "Shuffle Example 2",
      'random_shuffle.shuffle_example["list_2"]',
      {
        input: ["scout", "slinger", "warrior", "builder", "settler"],
        keepers: {
          shuffle_count: "2",
        },
        result_count: 2,
      }
    )
  );
  tfx.module(
    "Example Module",
    "module.example_module",
    tfx.resource("Random Pet Example", "random_pet.random_example", {
      keepers: null,
      length: 2,
      prefix: "acceptance-module",
      separator: "-",
    })
  );
});
