const extract = require("../lib/extract");
const { assert } = require("chai");
const YAML = require("json-to-pretty-yaml");
const mocks = require("./tfx.mocks"); // import mocks
let mock = new mocks(); // initialize mocks

let exampleChildModule = {
  root_module: {
    child_modules: [
      {
        resources: [
          {
            address: "module.example_module.random_pet.random_example_1",
            mode: "managed",
            type: "random_pet",
            name: "random_example_1",
            provider_name: "registry.terraform.io/hashicorp/random",
            schema_version: 0,
            values: {
              keepers: null,
              length: 2,
              prefix: "acceptance-module",
              separator: "-",
            },
            sensitive_values: {},
          },
          {
            address: "module.example_module.random_pet.random_example",
            mode: "managed",
            type: "random_pet",
            name: "random_example_2",
            provider_name: "registry.terraform.io/hashicorp/random",
            schema_version: 0,
            values: {
              keepers: null,
              length: 2,
              prefix: "acceptance-module",
              separator: "-",
            },
            sensitive_values: {},
          },
        ],
        child_modules: [
          {
            address: 'module.example_module["test"].module.child',
            resources: [
              {
                address:
                  'module.example_module["test"].module.child.random_pet.random_example_1',
                mode: "managed",
                type: "random_pet",
                name: "random_example_1",
                provider_name: "registry.terraform.io/hashicorp/random",
                schema_version: 0,
                values: {
                  keepers: null,
                  length: 2,
                  prefix: "acceptance-module",
                  separator: "-",
                },
                sensitive_values: {},
              },
              {
                address:
                  'module.example_module["test"].module.child.random_pet.random_example',
                mode: "managed",
                type: "random_pet",
                name: "random_example_2",
                provider_name: "registry.terraform.io/hashicorp/random",
                schema_version: 0,
                values: {
                  keepers: null,
                  length: 2,
                  prefix: "acceptance-module",
                  separator: "-",
                },
                sensitive_values: {},
              },
            ],
          },
        ],
        address: 'module.example_module["test"]',
      },
    ],
  },
};

describe("extract", () => {
  describe("planResourceTest", () => {
    let planResourceTest = extract.planResourceTest;
    it("should return correct data for tfx", () => {
      let resource = {
        address: "null_resource.count_example[0]",
        mode: "managed",
        type: "null_resource",
        name: "count_example",
        index: 0,
        provider_name: "registry.terraform.io/hashicorp/null",
        schema_version: 0,
        values: {
          triggers: {
            trigger_value: "example-acceptance",
            "null-value": null,
          },
        },
        sensitive_values: {
          triggers: {},
        },
      };
      let actualData = planResourceTest(resource, "tfx");
      let expectedData = `tfx.resource(
  "Count Example 0",
  'null_resource.count_example[0]',
  {
    "triggers": {
      "trigger_value": "example-acceptance"
    }
  }
),`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct string"
      );
    });
    it("should return correct data for tfx when including null values", () => {
      let resource = {
        address: "null_resource.count_example[0]",
        mode: "managed",
        type: "null_resource",
        name: "count_example",
        index: 0,
        provider_name: "registry.terraform.io/hashicorp/null",
        schema_version: 0,
        values: {
          triggers: {
            trigger_value: "example-acceptance",
            "null-value": null,
          },
        },
        sensitive_values: {
          triggers: {},
        },
      };
      let actualData = planResourceTest(resource, "tfx", true);
      let expectedData = `tfx.resource(
  "Count Example 0",
  'null_resource.count_example[0]',
  {
    "triggers": {
      "trigger_value": "example-acceptance",
      "null-value": null
    }
  }
),`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct string"
      );
    });
    it("should return correct data for yaml", () => {
      let resource = {
        address: "null_resource.count_example[0]",
        mode: "managed",
        type: "null_resource",
        name: "count_example",
        index: 0,
        provider_name: "registry.terraform.io/hashicorp/null",
        schema_version: 0,
        values: {
          triggers: {
            trigger_value: "example-acceptance",
            "null-value": null,
          },
        },
        sensitive_values: {
          triggers: {},
        },
      };
      let actualData = YAML.stringify(
        planResourceTest(resource, "yaml")
      );
      let expectedData = `Count Example 0:\n  address: "null_resource.count_example[0]"\n  values:\n    - triggers:\n        trigger_value: "example-acceptance"\n`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct string"
      );
    });
  });
  describe("moduleTest", () => {
    let moduleTest = extract.moduleTest;

    it("should correctly return a terraform module from plan for tfx", () => {
      let actualData = moduleTest(exampleChildModule, "tfx");
      let expectedData = `
tfx.module(
  "Example Module Test",
  'module.example_module["test"]',
  tfx.resource(
    "Random Example 1",
    'random_pet.random_example_1',
    {
      "length": 2,
      "prefix": "acceptance-module",
      "separator": "-"
    }
  ),
  tfx.resource(
    "Random Example 2",
    'random_pet.random_example',
    {
      "length": 2,
      "prefix": "acceptance-module",
      "separator": "-"
    }
  ),
);

tfx.module(
  "Child",
  'module.example_module["test"].module.child',
  tfx.resource(
    "Random Example 1",
    'random_pet.random_example_1',
    {
      "length": 2,
      "prefix": "acceptance-module",
      "separator": "-"
    }
  ),
  tfx.resource(
    "Random Example 2",
    'random_pet.random_example',
    {
      "length": 2,
      "prefix": "acceptance-module",
      "separator": "-"
    }
  ),
);`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should produce module data"
      );
    });
    it("should correctly return a terraform module from plan for yaml", () => {
      let actualData = moduleTest(exampleChildModule, "yaml");
      let expectedData = `
Example Module Test:
  address: "module.example_module[\\\"test\\\"]"
  resources:
    - Random Example 1:
        address: "random_pet.random_example_1"
        values:
          - length: 2
          - prefix: "acceptance-module"
          - separator: "-"
    - Random Example 2:
        address: "random_pet.random_example"
        values:
          - length: 2
          - prefix: "acceptance-module"
          - separator: "-"
Child:
  address: "module.example_module[\\\"test\\\"].module.child"
  resources:
    - Random Example 1:
        address: "random_pet.random_example_1"
        values:
          - length: 2
          - prefix: "acceptance-module"
          - separator: "-"
    - Random Example 2:
        address: "random_pet.random_example"
        values:
          - length: 2
          - prefix: "acceptance-module"
          - separator: "-"
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should produce module data"
      );
    });
  });
  describe("planTfx", () => {
    it("it should return data in callback when done", () => {
      let expectedFile = `// This file was generated by tfxjs
const tfxjs = require("tfxjs");
const tfx = new tfxjs(
  "path",
  {}
);

tfx.plan("Template Name", () => {
  
  tfx.module(
    "Example Module Test",
    'module.example_module["test"]',
    tfx.resource(
      "Random Example 1",
      'random_pet.random_example_1',
      {
        "length": 2,
        "prefix": "acceptance-module",
        "separator": "-"
      }
    ),
    tfx.resource(
      "Random Example 2",
      'random_pet.random_example',
      {
        "length": 2,
        "prefix": "acceptance-module",
        "separator": "-"
      }
    ),
  );
  
  tfx.module(
    "Child",
    'module.example_module["test"].module.child',
    tfx.resource(
      "Random Example 1",
      'random_pet.random_example_1',
      {
        "length": 2,
        "prefix": "acceptance-module",
        "separator": "-"
      }
    ),
    tfx.resource(
      "Random Example 2",
      'random_pet.random_example',
      {
        "length": 2,
        "prefix": "acceptance-module",
        "separator": "-"
      }
    ),
  );
});
`
      let mockExec = new mock.mockExec({
        stdout: JSON.stringify({ "planned_values": exampleChildModule }),
      })
      let overrideExec = mockExec.promise;
      return extract.planTfx("Template Name", "path", "tfx", {}, overrideExec, (data) => {
        assert.deepEqual(data, expectedFile, "should return data")
      })
    });
    it("should return correct yaml", () => {
      let expectedFile = `
Example Module Test:
  address: "module.example_module[\\\"test\\\"]"
  resources:
    - Random Example 1:
        address: "random_pet.random_example_1"
        values:
          - length: 2
          - prefix: "acceptance-module"
          - separator: "-"
    - Random Example 2:
        address: "random_pet.random_example"
        values:
          - length: 2
          - prefix: "acceptance-module"
          - separator: "-"
Child:
  address: "module.example_module[\\\"test\\\"].module.child"
  resources:
    - Random Example 1:
        address: "random_pet.random_example_1"
        values:
          - length: 2
          - prefix: "acceptance-module"
          - separator: "-"
    - Random Example 2:
        address: "random_pet.random_example"
        values:
          - length: 2
          - prefix: "acceptance-module"
          - separator: "-"
`
      let mockExec = new mock.mockExec({
        stdout: JSON.stringify({ "planned_values": exampleChildModule }),
      })
      let overrideExec = mockExec.promise;
      return extract.planTfx("Template Name", "path", "yaml", {}, overrideExec, (data) => {
        assert.deepEqual(data, expectedFile, "should return data")
      })
    })
  })

  describe("deyamilfy", () => {
    let moduleTest = extract.moduleTest;
    it("should convert from yaml to tfx", () => {
      let expectedData = moduleTest(exampleChildModule, "tfx");
      let testData = moduleTest(exampleChildModule, "yaml");
      let actualData = extract.deyamilfy(testData)
      assert.deepEqual(actualData, expectedData, "it should create tfx fileData")
    })
  })
});
