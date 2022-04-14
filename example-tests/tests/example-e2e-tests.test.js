const tfxjs = require("tfxjs");
const tfx = new tfxjs("../", "apikey");

tfx.apply("Hashicorp Provider Example Tests", () => {
  tfx.state("Data Resources", [
    {
      address: "data.external.example",
      instances: [
        {
          id: "-",
          program: ["sh", "./test-output.sh", "example", "test"],
          result: {
            data: "example-test-value",
          },
        },
      ],
    },
  ]);
  tfx.state("Local Files", [
    {
      address: "data.local_file.lists",
      instances: [
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
          content_base64:
            "c2NvdXQsc2xpbmdlcix3YXJyaW9yLGJ1aWxkZXIsc2V0dGxlcg==",
          filename: "./local-files/shuffle_list_2.txt",
        },
      ],
    },
  ]);
  tfx.state("Count Null Resource", [
    {
      address: "null_resource.count_example",
      instances: [
        {
          id: function (value) {
            return {
              appendMessage: "to match the regex ^d+$",
              // Test to make sure the entire string is covered nu regex
              expectedData: value.match(/^\d+$/g)[0] === value,
            };
          },
          triggers: {
            trigger_value: "this-is-a-test",
          },
        },
        {
          id: function (value) {
            return {
              appendMessage: "to match the regex ^\\d+$",
              // Test to make sure the entire string is covered nu regex
              expectedData: value.match(/^\d+$/g)[0] === value,
            };
          },
          triggers: {
            trigger_value: "this-is-a-test",
          },
        },
        {
          id: function (value) {
            return {
              appendMessage: "to match the regex ^\\d+$",
              // Test to make sure the entire string is covered nu regex
              expectedData: value.match(/^\d+$/g)[0] === value,
            };
          },
          triggers: {
            trigger_value: "this-is-a-test",
          },
        },
      ],
    },
  ]);
  tfx.state("For Each Resource", [
    {
      address: "null_resource.map_example",
      instances: [
        {
          index_key: "example",
          id: function (value) {
            return {
              appendMessage: "to match the regex ^\\d+$",
              // Test to make sure the entire string is covered nu regex
              expectedData: value.match(/^\d+$/g)[0] === value,
            };
          },
          triggers: {
            trigger_value: "this-is-a-test",
          },
        },
        {
          index_key: "test",
          id: function (value) {
            return {
              appendMessage: "to match the regex ^\\d+$",
              // Test to make sure the entire string is covered nu regex
              expectedData: value.match(/^\d+$/g)[0] === value,
            };
          },
          triggers: {
            trigger_value: "this-is-a-test",
          },
        },
        {
          index_key: "value",
          id: function (value) {
            return {
              appendMessage: "to match the regex ^\\d+$",
              // Test to make sure the entire string is covered nu regex
              expectedData: value.match(/^\d+$/g)[0] === value,
            };
          },
          triggers: {
            trigger_value: "this-is-a-test",
          },
        },
      ],
    },
  ]);
  tfx.state("Random Pet Resource", [
    {
      address: "random_pet.random_example",
      instances: [
        {
          id: function (value) {
            return {
              appendMessage: "to have 5 total segments seperated by hyphens.",
              // Checking since this generates 3 random names with a known prefix
              expectedData: value.split("-").length === 5,
            };
          },
          length: 3,
          prefix: "example-acceptance",
          separator: "-",
        },
      ],
    },
  ]);
  tfx.state("Random Shuffle", [
    {
      address: "random_shuffle.shuffle_example",
      instances: [
        {
          index_key: "list_1",
          keepers: {
            shuffle_count: "2",
          },
          result_count: 2,
          input: [
            "ponder",
            "consider",
            "opt",
            "preordain",
            "brainstorm",
            "portent",
          ],
          result: function (value) {
            let foundCount = 0;
            value.forEach((resource) => {
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
            return {
              appendMessage: "to contain 2 entries from the list.",
              expectedData: foundCount === 2,
            };
          },
        },
        {
          index_key: "list_2",
          keepers: {
            shuffle_count: "2",
          },
          result_count: 2,
          input: ["scout", "slinger", "warrior", "builder", "settler"],
          result: function (value) {
            let foundCount = 0;
            value.forEach((resource) => {
              if (
                ["scout", "slinger", "warrior", "builder", "settler"].indexOf(
                  resource
                ) !== -1
              )
                foundCount++;
            });
            return {
              appendMessage: "to contain 2 entries from the list.",
              expectedData: foundCount === 2,
            };
          },
        },
      ],
    },
  ]);
  tfx.state("Example Module", [
    {
      address: "module.example_module.random_pet.random_example",
      instances: [
        {
          id: function (value) {
            return {
              appendMessage: "to have 4 total segments seperated by hyphens.",
              // Checking since this generates 3 random names with a known prefix
              expectedData: value.split("-").length === 4,
            };
          },
          length: 2,
          prefix: "acceptance-module",
          separator: "-",
        },
      ],
    },
  ]);
});
