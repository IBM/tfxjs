const tfxjs = require("tfxjs");
const tfx = new tfxjs("../", "apikey");

tfx.plan("Hashicorp Provider Example Tests", () => {
  tfx.module("Root Module", "root_module", [
    {
      name: "Count Example 0",
      address: "null_resource.count_example[0]",
      values: {
        triggers: {
          trigger_value: "this-is-a-test",
        },
      },
    },
    {
      name: "Count Example 1",
      address: "null_resource.count_example[1]",
      values: {
        triggers: {
          trigger_value: "this-is-a-test",
        },
      },
    },
    {
      name: "Count Example 2",
      address: "null_resource.count_example[2]",
      values: {
        triggers: {
          trigger_value: "this-is-a-test",
        },
      },
    },
    {
      address: 'null_resource.map_example["example"]',
      name: "Map Example Example",
      values: {
        triggers: {
          trigger_value: "this-is-a-test",
        },
      },
    },
    {
      address: 'null_resource.map_example["test"]',
      name: "Map Example Test",
      values: {
        triggers: {
          trigger_value: "this-is-a-test",
        },
      },
    },
    {
      address: 'null_resource.map_example["value"]',
      name: "Map Example Value",
      values: {
        triggers: {
          trigger_value: "this-is-a-test",
        },
      },
    },
    {
      address: "random_pet.random_example",
      name: "Random Pet Example",
      values: {
        keepers: null,
        length: 3,
        prefix: "example-acceptance",
        separator: "-",
      },
    },
    {
      name: "Shuffle Example 1",
      address: 'random_shuffle.shuffle_example["list_1"]',
      values: {
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
      },
    },
    {
      name: "Shuffle Example 2",
      address: 'random_shuffle.shuffle_example["list_2"]',
      values: {
        input: ["scout", "slinger", "warrior", "builder", "settler"],
        keepers: {
          shuffle_count: "2",
        },
        result_count: 2,
      },
    },
  ]);
  tfx.module("Example Module", "module.example_module", [
    {
      name: "Random Pet Example",
      address: "random_pet.random_example",
      values: {
        keepers: null,
        length: 2,
        prefix: "acceptance-module",
        separator: "-",
      },
    },
  ]);
});
