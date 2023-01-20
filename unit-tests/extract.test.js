const extract = require("../lib/extract");
const { assert } = require("chai");
const YAML = require("json-to-pretty-yaml");
const mocks = require("./tfx.mocks"); // import mocks
const fs = require("fs");
let mock = new mocks(); // initialize mocks
const sinon = require("sinon");
const {
  applyResourceTest,
  stateResourceTest,
  applyTfx,
} = require("../lib/extract");

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
              timeouts: {
                update: null,
              },
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
    it("should return correct data for tfx", () => {
      let resource = {
        timeouts: null,
      };
      let actualData = planResourceTest(resource, "tfx");
      let expectedData = "";
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
      let actualData = YAML.stringify(planResourceTest(resource, "yaml"));
      let expectedData = `Count Example 0:\n  address: "null_resource.count_example[0]"\n  values:\n    - triggers:\n        trigger_value: "example-acceptance"\n`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct string"
      );
    });
    it("should return correct data for a data resource", () => {
      let expectedData = `tfx.resource(
  "Cloud Init",
  'data.template_cloudinit_config.cloud_init',
  {
    "base64_encode": false,
    "gzip": false,
    "part": [
      {
        "content_type": null,
        "filename": null,
        "merge_type": null
      }
    ]
  }
),`;
      let testData = {
        address:
          "module.acceptance_tests.module.landing-zone.module.teleport_config[0].data.template_cloudinit_config.cloud_init",
        mode: "data",
        type: "template_cloudinit_config",
        name: "cloud_init",
        provider_name: "registry.terraform.io/hashicorp/template",
        schema_version: 0,
        values: {
          base64_encode: false,
          gzip: false,
          part: [
            {
              content_type: null,
              filename: null,
              merge_type: null,
            },
          ],
        },
      };
      let actualData = planResourceTest(testData, "tfx");
      assert.deepEqual(actualData, expectedData, "should print expected data");
    });
    it("should return the correct data when shallow", () => {
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
      let actualData = planResourceTest(resource, "tfx", false, 0, true);
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
    it("should correctly return a terraform module from plan for yaml with program", () => {
      let testData = {
        root_module: {
          child_modules: [
            {
              address: 'module.example_module["test"]',
              resources: [
                {
                  address: "data.external.format_output",
                  mode: "data",
                  type: "external",
                  name: "format_output",
                  provider_name: "registry.terraform.io/hashicorp/external",
                  schema_version: 0,
                  values: {
                    program: [
                      "python3",
                      ".terraform/modules/icse_vpc_network.vpc/scripts/output.py",
                      null,
                    ],
                    query: null,
                    working_dir: null,
                  },
                  sensitive_values: {
                    program: [false, false, false],
                    result: {},
                  },
                },
              ],
            },
          ],
        },
      };
      let expectedData = `
Example Module Test:
  address: module.example_module["test"]
  resources:
    - Format Output:
        address: data.external.format_output
        values:
          - program:
              - python3
              - .terraform/modules/icse_vpc_network.vpc/scripts/output.py
              - null
`;
      let actualData = moduleTest(testData, "yaml");
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });

    it("should correctly return a terraform module from plan for yaml", () => {
      let actualData = moduleTest(exampleChildModule, "yaml");
      let expectedData = `
Example Module Test:
  address: module.example_module["test"]
  resources:
    - Random Example 1:
        address: random_pet.random_example_1
        values:
          - length: 2
          - prefix: acceptance-module
          - separator: "-"
    - Random Example 2:
        address: random_pet.random_example
        values:
          - length: 2
          - prefix: acceptance-module
          - separator: "-"
Child:
  address: module.example_module["test"].module.child
  resources:
    - Random Example 1:
        address: random_pet.random_example_1
        values:
          - length: 2
          - prefix: acceptance-module
          - separator: "-"
    - Random Example 2:
        address: random_pet.random_example
        values:
          - length: 2
          - prefix: acceptance-module
          - separator: "-"
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should produce module data"
      );
    });
  });

  describe("deyamilfy", () => {
    let moduleTest = extract.moduleTest;
    it("should convert from yaml to tfx", () => {
      let expectedData = `// This file was generated by tfxjs
const tfxjs = require("tfxjs");
const tfx = new tfxjs(
  "$TEMPLATE_PATH",
  $TF_VARS
);

tfx.plan("$TEMPLATE_NAME", () => {
  
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
`;
      let testData = moduleTest(exampleChildModule, "yaml");
      let actualData = extract.deyamilfy(testData);
      assert.deepEqual(
        actualData,
        expectedData,
        "it should create tfx fileData"
      );
    });
    it("should fill in the template with values", () => {
      let yamlData = fs.readFileSync("./unit-tests/extract.test.yaml");
      let expectedData = `// This file was generated by tfxjs
const tfxjs = require("tfxjs");
const tfx = new tfxjs(
  ".path-to-file",
  {
    "frog": true
  }
);

tfx.plan("Template Name", () => {
  
  tfx.module(
    "Landing Zone",
    'module.acceptance_tests.module.landing-zone',
    tfx.resource(
      "Urls 0",
      'ibm_appid_redirect_urls.urls[0]',
      {
        "urls": [
          "https://at-test-bastion-1.domain.com:3080/v1/webapi/oidc/callback",
          "https://at-test-bastion-2.domain.com:3080/v1/webapi/oidc/callback",
          "https://at-test-bastion-3.domain.com:3080/v1/webapi/oidc/callback"
        ]
      }
    ),
  );
});
`;
      let actualData = extract.deyamilfy(yamlData);
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should fill in the template with only tfvar values", () => {
      let yamlData = `tfxPlan:
  tfvars:
    frog: true
Landing Zone:
  address: module.acceptance_tests.module.landing-zone
  resources:
    - Urls 0:
        address: ibm_appid_redirect_urls.urls[0]
        values:
          - urls:
              - https://at-test-bastion-1.domain.com:3080/v1/webapi/oidc/callback
              - https://at-test-bastion-2.domain.com:3080/v1/webapi/oidc/callback
              - https://at-test-bastion-3.domain.com:3080/v1/webapi/oidc/callback`;
      let expectedData = `// This file was generated by tfxjs
const tfxjs = require("tfxjs");
const tfx = new tfxjs(
  "<template path>",
  {
    "frog": true
  }
);

tfx.plan("<template name>", () => {
  
  tfx.module(
    "Landing Zone",
    'module.acceptance_tests.module.landing-zone',
    tfx.resource(
      "Urls 0",
      'ibm_appid_redirect_urls.urls[0]',
      {
        "urls": [
          "https://at-test-bastion-1.domain.com:3080/v1/webapi/oidc/callback",
          "https://at-test-bastion-2.domain.com:3080/v1/webapi/oidc/callback",
          "https://at-test-bastion-3.domain.com:3080/v1/webapi/oidc/callback"
        ]
      }
    ),
  );
});
`;
      let actualData = extract.deyamilfy(yamlData);
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should fill in the template without tfvar values", () => {
      let yamlData = `tfxPlan:
  template-name: todd
Landing Zone:
  address: module.acceptance_tests.module.landing-zone
  resources:
    - Urls 0:
        address: ibm_appid_redirect_urls.urls[0]
        values:
          - urls:
              - https://at-test-bastion-1.domain.com:3080/v1/webapi/oidc/callback
              - https://at-test-bastion-2.domain.com:3080/v1/webapi/oidc/callback
              - https://at-test-bastion-3.domain.com:3080/v1/webapi/oidc/callback`;
      let expectedData = `// This file was generated by tfxjs
const tfxjs = require("tfxjs");
const tfx = new tfxjs(
  "<template path>",
  {}
);

tfx.plan("todd", () => {
  
  tfx.module(
    "Landing Zone",
    'module.acceptance_tests.module.landing-zone',
    tfx.resource(
      "Urls 0",
      'ibm_appid_redirect_urls.urls[0]',
      {
        "urls": [
          "https://at-test-bastion-1.domain.com:3080/v1/webapi/oidc/callback",
          "https://at-test-bastion-2.domain.com:3080/v1/webapi/oidc/callback",
          "https://at-test-bastion-3.domain.com:3080/v1/webapi/oidc/callback"
        ]
      }
    ),
  );
});
`;
      let actualData = extract.deyamilfy(yamlData);
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should not overwrite passed variables", () => {
      let yamlData = fs.readFileSync("./unit-tests/extract.test.yaml");
      let expectedData = `// This file was generated by tfxjs
const tfxjs = require("tfxjs");
const tfx = new tfxjs(
  ".path-to-file",
  {
    "frog": false
  }
);

tfx.plan("Template Name", () => {
  
  tfx.module(
    "Landing Zone",
    'module.acceptance_tests.module.landing-zone',
    tfx.resource(
      "Urls 0",
      'ibm_appid_redirect_urls.urls[0]',
      {
        "urls": [
          "https://at-test-bastion-1.domain.com:3080/v1/webapi/oidc/callback",
          "https://at-test-bastion-2.domain.com:3080/v1/webapi/oidc/callback",
          "https://at-test-bastion-3.domain.com:3080/v1/webapi/oidc/callback"
        ]
      }
    ),
  );
});
`;
      let actualData = extract.deyamilfy(yamlData, { frog: false });
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
  });

  describe("cliPlanCallback", () => {
    it("it should return data in callback when done", () => {
      let expectedFile =
        "// This file was generated by tfxjs\n" +
        'const tfxjs = require("tfxjs");\n' +
        "const tfx = new tfxjs(\n" +
        '  "path",\n' +
        "  {}\n" +
        ");\n" +
        "\n" +
        'tfx.plan("Template Name", () => {\n' +
        "  \n" +
        "  tfx.module(\n" +
        '    "Example Module Test",\n' +
        `    'module.example_module["test"]',\n` +
        "    tfx.resource(\n" +
        '      "Random Example 1",\n' +
        "      'random_pet.random_example_1',\n" +
        "      {\n" +
        '        "length": 2,\n' +
        '        "prefix": "acceptance-module",\n' +
        '        "separator": "-"\n' +
        "      }\n" +
        "    ),\n" +
        "    tfx.resource(\n" +
        '      "Random Example 2",\n' +
        "      'random_pet.random_example',\n" +
        "      {\n" +
        '        "length": 2,\n' +
        '        "prefix": "acceptance-module",\n' +
        '        "separator": "-"\n' +
        "      }\n" +
        "    ),\n" +
        "  );\n" +
        "  \n" +
        "  tfx.module(\n" +
        '    "Child",\n' +
        `    'module.example_module["test"].module.child',\n` +
        "    tfx.resource(\n" +
        '      "Random Example 1",\n' +
        "      'random_pet.random_example_1',\n" +
        "      {\n" +
        '        "length": 2,\n' +
        '        "prefix": "acceptance-module",\n' +
        '        "separator": "-"\n' +
        "      }\n" +
        "    ),\n" +
        "    tfx.resource(\n" +
        '      "Random Example 2",\n' +
        "      'random_pet.random_example',\n" +
        "      {\n" +
        '        "length": 2,\n' +
        '        "prefix": "acceptance-module",\n' +
        '        "separator": "-"\n' +
        "      }\n" +
        "    ),\n" +
        "  );\n" +
        "});\n";
      let callbackSpy = new sinon.spy();
      let planDataCallback = extract.fileDataCallback(
        "tfx",
        false,
        "path",
        "Template Name",
        {},
        callbackSpy
      );
      planDataCallback(exampleChildModule);
      assert.isTrue(
        callbackSpy.calledOnceWith(expectedFile),
        "should return expected file"
      );
    });
    it("it should return data in callback when done and shallow is true", () => {
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
        "separator": "-",
        "timeouts": {
          "update": null
        }
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
`;
      let callbackSpy = new sinon.spy();
      let planDataCallback = extract.fileDataCallback(
        "tfx",
        true,
        "path",
        "Template Name",
        {},
        callbackSpy
      );
      planDataCallback(exampleChildModule);
      assert.isTrue(
        callbackSpy.calledOnceWith(expectedFile),
        "should return expected file"
      );
    });
    it("should return correct yaml", () => {
      let expectedFile =
        "tfxPlan:\n" +
        '  template-path: "path"\n' +
        '  template-name: "Template Name"\n' +
        "  tfvars: {}\n" +
        "\n" +
        "Example Module Test:\n" +
        '  address: module.example_module["test"]\n' +
        "  resources:\n" +
        "    - Random Example 1:\n" +
        "        address: random_pet.random_example_1\n" +
        "        values:\n" +
        "          - length: 2\n" +
        "          - prefix: acceptance-module\n" +
        '          - separator: "-"\n' +
        "    - Random Example 2:\n" +
        "        address: random_pet.random_example\n" +
        "        values:\n" +
        "          - length: 2\n" +
        "          - prefix: acceptance-module\n" +
        '          - separator: "-"\n' +
        "Child:\n" +
        '  address: module.example_module["test"].module.child\n' +
        "  resources:\n" +
        "    - Random Example 1:\n" +
        "        address: random_pet.random_example_1\n" +
        "        values:\n" +
        "          - length: 2\n" +
        "          - prefix: acceptance-module\n" +
        '          - separator: "-"\n' +
        "    - Random Example 2:\n" +
        "        address: random_pet.random_example\n" +
        "        values:\n" +
        "          - length: 2\n" +
        "          - prefix: acceptance-module\n" +
        '          - separator: "-"\n';

      let callbackSpy = new sinon.spy();
      let planDataCallback = extract.fileDataCallback(
        "yaml",
        false,
        "path",
        "Template Name",
        {},
        callbackSpy
      );
      planDataCallback(exampleChildModule);

      assert.isTrue(
        callbackSpy.calledOnceWith(expectedFile),
        "should return expected file"
      );
    });
  });
  describe("planTfx", () => {
    it("should call plantfx", () => {
      let fileDataCallbackSpy = new sinon.spy();
      let mockExec = new mock.mockExec({
        stdout: JSON.stringify({ planned_values: exampleChildModule }),
      });
      let overrideExec = mockExec.promise;
      let tempExtract = require("../lib/extract");
      tempExtract.fileDataCallback = fileDataCallbackSpy;
      tempExtract
        .planTfx(
          "Template Name",
          "path",
          "tfx",
          {},
          overrideExec,
          false,
          true,
          () => {}
        )
        .then(() => {
          assert.isTrue(
            fileDataCallbackSpy.calledOnceWith(
              "tfx",
              "path",
              "Template Name",
              {},
              () => {}
            ),
            "should have been called with expected args"
          );
        });
    });
  });
  describe("applyResourceTest", () => {
    it("should return a data source", () => {
      let expectedData = `tfx.address("data.external.example", {
  id: "-",
  program: [
    "sh",
    "./test-output.sh",
    "example",
    "test"
  ],
  query: null,
  result: {
    data: "example-test-value"
  },
  working_dir: null
});
`;
      let actualData = applyResourceTest({
        mode: "data",
        type: "external",
        name: "example",
        provider: 'provider["registry.terraform.io/hashicorp/external"]',
        instances: [
          {
            schema_version: 0,
            attributes: {
              id: "-",
              program: ["sh", "./test-output.sh", "example", "test"],
              query: null,
              result: {
                data: "example-test-value",
              },
              working_dir: null,
            },
            sensitive_attributes: [],
          },
        ],
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return a state resource"
      );
    });
    it("should return a data source", () => {
      let expectedData = `tfx.address("data.external.example", {
  action: "allow",
  destination: "0.0.0.0/0",
  direction: "inbound",
  icmp: [],
  id: "b5235705-fd20-4792-acb4-caeff0475257",
  ip_version: "ipv4",
  name: "allow-inbound-ez-multizone-allow-all",
  source: "0.0.0.0/0",
  subnets: 0,
  tcp: [],
  udp: []
});
`;
      let actualData = applyResourceTest({
        mode: "data",
        type: "external",
        name: "example",
        provider: 'provider["registry.terraform.io/hashicorp/external"]',
        instances: [
          {
            schema_version: 0,
            attributes: {
              "action": "allow",
              "destination": "0.0.0.0/0",
              "direction": "inbound",
              "icmp": [],
              "id": "b5235705-fd20-4792-acb4-caeff0475257",
              "ip_version": "ipv4",
              "name": "allow-inbound-ez-multizone-allow-all",
              "source": "0.0.0.0/0",
              "subnets": 0,
              "tcp": [],
              "udp": []
            }
          }
        ],
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return a state resource"
      );
    });
    it("should return a data source from raw json", () => {
      let actualData = applyResourceTest(
        JSON.parse(`{
          "module": "module.ez_vpc",
          "mode": "data",
          "type": "ibm_resource_group",
          "name": "resource_group",
          "provider":  "provider['registry.terraform.io/ibm-cloud/ibm']",
          "instances": [
            {
              "schema_version": 0,
              "attributes": {
                "account_id": "1234",
                "created_at": "2019-05-23T19:21:47.795Z",
                "crn": "crn:v1:bluemix:public:resource-controller::a/1234::resource-group:5679",
                "id": "5679",
                "is_default": false,
                "name": "asset-development",
                "payment_methods_url": null,
                "quota_id": "1234",
                "quota_url": "/v2/quota_definitions/1234",
                "resource_linkages": [],
                "state": "ACTIVE",
                "teams_url": null,
                "updated_at": "2019-05-23T19:21:47.795Z"
              },
              "sensitive_attributes": []
            }
          ]
        }`)
      );
      let expectedData = `tfx.address("data.module.ez_vpc.ibm_resource_group.resource_group", {
  account_id: "1234",
  created_at: "2019-05-23T19:21:47.795Z",
  crn: "crn:v1:bluemix:public:resource-controller::a/1234::resource-group:5679",
  id: "5679",
  is_default: false,
  name: "asset-development",
  payment_methods_url: null,
  quota_id: "1234",
  quota_url: "/v2/quota_definitions/1234",
  resource_linkages: [],
  state: "ACTIVE",
  teams_url: null,
  updated_at: "2019-05-23T19:21:47.795Z"
});
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return a state resource"
      );
    });
    it("should return a data source with multiple instances", () => {
      let expectedData = `tfx.address(
  "data.local_file.lists",
  {
    content: "ponder,consider,opt,preordain,brainstorm,portent",
    content_base64: "cG9uZGVyLGNvbnNpZGVyLG9wdCxwcmVvcmRhaW4sYnJhaW5zdG9ybSxwb3J0ZW50",
    filename: "./local-files/shuffle_list_1.txt",
    id: "a48eb33e75d9fddbd716a126fb3fb52f0ca07613",
    index_key: "list_1"
  },
  {
    content: "scout,slinger,warrior,builder,settler",
    content_base64: "c2NvdXQsc2xpbmdlcix3YXJyaW9yLGJ1aWxkZXIsc2V0dGxlcg==",
    filename: "./local-files/shuffle_list_2.txt",
    id: "a994e19704ace6b7540ce5a2ce8842cdcdd815dd",
    index_key: "list_2"
  }
)
`;
      let actualData = applyResourceTest({
        mode: "data",
        type: "local_file",
        name: "lists",
        provider: 'provider["registry.terraform.io/hashicorp/local"]',
        instances: [
          {
            index_key: "list_1",
            schema_version: 0,
            attributes: {
              content: "ponder,consider,opt,preordain,brainstorm,portent",
              content_base64:
                "cG9uZGVyLGNvbnNpZGVyLG9wdCxwcmVvcmRhaW4sYnJhaW5zdG9ybSxwb3J0ZW50",
              filename: "./local-files/shuffle_list_1.txt",
              id: "a48eb33e75d9fddbd716a126fb3fb52f0ca07613",
            },
            sensitive_attributes: [],
          },
          {
            index_key: "list_2",
            schema_version: 0,
            attributes: {
              content: "scout,slinger,warrior,builder,settler",
              content_base64:
                "c2NvdXQsc2xpbmdlcix3YXJyaW9yLGJ1aWxkZXIsc2V0dGxlcg==",
              filename: "./local-files/shuffle_list_2.txt",
              id: "a994e19704ace6b7540ce5a2ce8842cdcdd815dd",
            },
            sensitive_attributes: [],
          },
        ],
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return a state resource"
      );
    });
    it("should return a managed resource with multiple instances", () => {
      let expectedData = `tfx.address(
  "null_resource.count_example",
  {
    id: "2896328915849982980",
    triggers: {
      trigger_value: "example-e2e-tests"
    }
  },
  {
    id: "3935907870916963842",
    triggers: {
      trigger_value: "example-e2e-tests"
    }
  },
  {
    id: "5150844839615547579",
    triggers: {
      trigger_value: "example-e2e-tests"
    }
  }
)
`;
      let actualData = applyResourceTest({
        mode: "managed",
        type: "null_resource",
        name: "count_example",
        provider: 'provider["registry.terraform.io/hashicorp/null"]',
        instances: [
          {
            index_key: 0,
            schema_version: 0,
            attributes: {
              id: "2896328915849982980",
              triggers: {
                trigger_value: "example-e2e-tests",
              },
            },
            sensitive_attributes: [],
            dependencies: ["data.external.example"],
          },
          {
            index_key: 1,
            schema_version: 0,
            attributes: {
              id: "3935907870916963842",
              triggers: {
                trigger_value: "example-e2e-tests",
              },
            },
            sensitive_attributes: [],
            dependencies: ["data.external.example"],
          },
          {
            index_key: 2,
            schema_version: 0,
            attributes: {
              id: "5150844839615547579",
              triggers: {
                trigger_value: "example-e2e-tests",
              },
            },
            sensitive_attributes: [],
            dependencies: ["data.external.example"],
          },
        ],
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return a state resource"
      );
    });
    it("should return a managed resource with multiple instances using a map", () => {
      let expectedData = `tfx.address(
  "null_resource.map_example",
  {
    id: "1620629581596704678",
    triggers: {
      trigger_value: "example-e2e-tests"
    },
    index_key: "example"
  },
  {
    id: "3242962864108601982",
    triggers: {
      trigger_value: "example-e2e-tests"
    },
    index_key: "test"
  },
  {
    id: "5042942514776818409",
    triggers: {
      trigger_value: "example-e2e-tests"
    },
    index_key: "value"
  }
)
`;
      let actualData = applyResourceTest({
        mode: "managed",
        type: "null_resource",
        name: "map_example",
        provider: 'provider["registry.terraform.io/hashicorp/null"]',
        instances: [
          {
            index_key: "example",
            schema_version: 0,
            attributes: {
              id: "1620629581596704678",
              triggers: {
                trigger_value: "example-e2e-tests",
              },
            },
            sensitive_attributes: [],
            dependencies: ["data.external.example"],
          },
          {
            index_key: "test",
            schema_version: 0,
            attributes: {
              id: "3242962864108601982",
              triggers: {
                trigger_value: "example-e2e-tests",
              },
            },
            sensitive_attributes: [],
            dependencies: ["data.external.example"],
          },
          {
            index_key: "value",
            schema_version: 0,
            attributes: {
              id: "5042942514776818409",
              triggers: {
                trigger_value: "example-e2e-tests",
              },
            },
            sensitive_attributes: [],
            dependencies: ["data.external.example"],
          },
        ],
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return a state resource"
      );
    });
  });
  describe("stateResourceTest", () => {
    it("should return text for tfx.state with address resources inside", () => {
      let expectedData = `tfx.state("root_module",
  tfx.address(
    "data.local_file.lists",
    {
      content: "ponder,consider,opt,preordain,brainstorm,portent",
      content_base64: "cG9uZGVyLGNvbnNpZGVyLG9wdCxwcmVvcmRhaW4sYnJhaW5zdG9ybSxwb3J0ZW50",
      filename: "./local-files/shuffle_list_1.txt",
      id: "a48eb33e75d9fddbd716a126fb3fb52f0ca07613",
      index_key: "list_1"
    },
    {
      content: "scout,slinger,warrior,builder,settler",
      content_base64: "c2NvdXQsc2xpbmdlcix3YXJyaW9yLGJ1aWxkZXIsc2V0dGxlcg==",
      filename: "./local-files/shuffle_list_2.txt",
      id: "a994e19704ace6b7540ce5a2ce8842cdcdd815dd",
      index_key: "list_2"
    }
  )
);
`;
      let actualData = stateResourceTest("root_module", [
        {
          mode: "data",
          type: "local_file",
          name: "lists",
          provider: 'provider["registry.terraform.io/hashicorp/local"]',
          instances: [
            {
              index_key: "list_1",
              schema_version: 0,
              attributes: {
                content: "ponder,consider,opt,preordain,brainstorm,portent",
                content_base64:
                  "cG9uZGVyLGNvbnNpZGVyLG9wdCxwcmVvcmRhaW4sYnJhaW5zdG9ybSxwb3J0ZW50",
                filename: "./local-files/shuffle_list_1.txt",
                id: "a48eb33e75d9fddbd716a126fb3fb52f0ca07613",
              },
              sensitive_attributes: [],
            },
            {
              index_key: "list_2",
              schema_version: 0,
              attributes: {
                content: "scout,slinger,warrior,builder,settler",
                content_base64:
                  "c2NvdXQsc2xpbmdlcix3YXJyaW9yLGJ1aWxkZXIsc2V0dGxlcg==",
                filename: "./local-files/shuffle_list_2.txt",
                id: "a994e19704ace6b7540ce5a2ce8842cdcdd815dd",
              },
              sensitive_attributes: [],
            },
          ],
        },
      ]);
      assert.deepEqual(
        actualData,
        expectedData,
        "it should contain the address"
      );
    });
    it("should return text for tfx.state with multiple address resources inside", () => {
      let expectedData = `tfx.state("root_module",
  tfx.address("data.external.example", {
    id: "-",
    program: [
      "sh",
      "./test-output.sh",
      "example",
      "test"
    ],
    query: null,
    result: {
      data: "example-test-value"
    },
    working_dir: null
  }),
  tfx.address(
    "data.local_file.lists",
    {
      content: "ponder,consider,opt,preordain,brainstorm,portent",
      content_base64: "cG9uZGVyLGNvbnNpZGVyLG9wdCxwcmVvcmRhaW4sYnJhaW5zdG9ybSxwb3J0ZW50",
      filename: "./local-files/shuffle_list_1.txt",
      id: "a48eb33e75d9fddbd716a126fb3fb52f0ca07613",
      index_key: "list_1"
    },
    {
      content: "scout,slinger,warrior,builder,settler",
      content_base64: "c2NvdXQsc2xpbmdlcix3YXJyaW9yLGJ1aWxkZXIsc2V0dGxlcg==",
      filename: "./local-files/shuffle_list_2.txt",
      id: "a994e19704ace6b7540ce5a2ce8842cdcdd815dd",
      index_key: "list_2"
    }
  )
);
`;
      let actualData = stateResourceTest("root_module", [
        {
          mode: "data",
          type: "external",
          name: "example",
          provider: 'provider["registry.terraform.io/hashicorp/external"]',
          instances: [
            {
              schema_version: 0,
              attributes: {
                id: "-",
                program: ["sh", "./test-output.sh", "example", "test"],
                query: null,
                result: {
                  data: "example-test-value",
                },
                working_dir: null,
              },
              sensitive_attributes: [],
            },
          ],
        },
        {
          mode: "data",
          type: "local_file",
          name: "lists",
          provider: 'provider["registry.terraform.io/hashicorp/local"]',
          instances: [
            {
              index_key: "list_1",
              schema_version: 0,
              attributes: {
                content: "ponder,consider,opt,preordain,brainstorm,portent",
                content_base64:
                  "cG9uZGVyLGNvbnNpZGVyLG9wdCxwcmVvcmRhaW4sYnJhaW5zdG9ybSxwb3J0ZW50",
                filename: "./local-files/shuffle_list_1.txt",
                id: "a48eb33e75d9fddbd716a126fb3fb52f0ca07613",
              },
              sensitive_attributes: [],
            },
            {
              index_key: "list_2",
              schema_version: 0,
              attributes: {
                content: "scout,slinger,warrior,builder,settler",
                content_base64:
                  "c2NvdXQsc2xpbmdlcix3YXJyaW9yLGJ1aWxkZXIsc2V0dGxlcg==",
                filename: "./local-files/shuffle_list_2.txt",
                id: "a994e19704ace6b7540ce5a2ce8842cdcdd815dd",
              },
              sensitive_attributes: [],
            },
          ],
        },
      ]);
      assert.deepEqual(
        actualData,
        expectedData,
        "it should contain the address"
      );
    });
  });
  describe("applyTfx", () => {
    it("should return one address for each module and composed constructor", () => {
      let actualData = applyTfx(
        {
          resources: [
            {
              mode: "managed",
              type: "null_resource",
              name: "count_example",
              provider: 'provider["registry.terraform.io/hashicorp/null"]',
              instances: [
                {
                  index_key: 0,
                  schema_version: 0,
                  attributes: {
                    id: "2896328915849982980",
                    triggers: {
                      trigger_value: "example-e2e-tests",
                    },
                  },
                  sensitive_attributes: [],
                  dependencies: ["data.external.example"],
                },
                {
                  index_key: 1,
                  schema_version: 0,
                  attributes: {
                    id: "3935907870916963842",
                    triggers: {
                      trigger_value: "example-e2e-tests",
                    },
                  },
                  sensitive_attributes: [],
                  dependencies: ["data.external.example"],
                },
                {
                  index_key: 2,
                  schema_version: 0,
                  attributes: {
                    id: "5150844839615547579",
                    triggers: {
                      trigger_value: "example-e2e-tests",
                    },
                  },
                  sensitive_attributes: [],
                  dependencies: ["data.external.example"],
                },
              ],
            },
            {
              module: "module.icse_vpc_network.module.activity_tracker",
              mode: "managed",
              type: "ibm_resource_key",
              name: "atracker_cos_key",
              provider: 'provider["registry.terraform.io/ibm-cloud/ibm"]',
              instances: [
                {
                  index_key: 0,
                  schema_version: 0,
                  attributes: {
                    account_id: "1234",
                    created_by: "1234",
                    created_at: "2022-08-18T14:38:31.845Z",
                    credentials: {
                      apikey: "1234",
                      endpoints:
                        "https://control.cloud-object-storage.cloud.ibm.com/v2/endpoints",
                      iam_apikey_description: "1234",
                      iam_apikey_name: "icse-lz-demo-atracker-cos-bind-key",
                      iam_role_crn: "1234",
                      iam_serviceid_crn: "1234",
                      resource_instance_id: "1234",
                    },
                    crn: "1234",
                    deleted_at: "",
                    deleted_by: "",
                    guid: "1234",
                    iam_compatible: true,
                    id: "1234",
                    name: "icse-lz-demo-atracker-cos-bind-key",
                    parameters: null,
                    resource_alias_id: null,
                    resource_group_id: "1234",
                    resource_instance_id: "1234",
                    resource_instance_url: "1234",
                    role: "Writer",
                    source_crn: "1234",
                    state: "active",
                    status: "active",
                    tags: ["icse", "landing-zone"],
                    timeouts: null,
                    updated_at: "2022-08-18T14:38:31.845Z",
                    updated_by: "",
                    url: "1234",
                  },
                },
              ],
            },
            {
              module: "module.icse_vpc_network.module.flow_logs[0]",
              mode: "managed",
              type: "ibm_iam_authorization_policy",
              name: "flow_logs_policy",
              provider: 'provider["registry.terraform.io/ibm-cloud/ibm"]',
              instances: [
                {
                  index_key: "cos",
                  schema_version: 0,
                  attributes: {
                    description:
                      "Allow flow logs write access cloud object storage instance",
                    id: "1234",
                    resource_attributes: [
                      {
                        name: "accountId",
                        operator: "stringEquals",
                        value: "1234",
                      },
                      {
                        name: "serviceInstance",
                        operator: "stringEquals",
                        value: "1234",
                      },
                      {
                        name: "serviceName",
                        operator: "stringEquals",
                        value: "cloud-object-storage",
                      },
                    ],
                    roles: ["Writer"],
                    source_resource_group_id: "",
                    source_resource_instance_id: "",
                    source_resource_type: "flow-log-collector",
                    source_service_account: "1234",
                    source_service_name: "is",
                    subject_attributes: [
                      {
                        name: "accountId",
                        value: "1234",
                      },
                      {
                        name: "resourceType",
                        value: "flow-log-collector",
                      },
                      {
                        name: "serviceName",
                        value: "is",
                      },
                    ],
                    target_resource_group_id: "",
                    target_resource_instance_id: "1234",
                    target_resource_type: "",
                    target_service_name: "cloud-object-storage",
                    transaction_id: "1234",
                    version: null,
                  },
                },
              ],
            },
            {
              module: "module.icse_vpc_network.module.flow_logs[0]",
              mode: "managed",
              type: "ibm_is_flow_log",
              name: "flow_logs",
              provider: 'provider["registry.terraform.io/ibm-cloud/ibm"]',
              instances: [
                {
                  index_key: "management",
                  schema_version: 0,
                  attributes: {
                    active: true,
                    auto_delete: null,
                    created_at: "2022-08-18T14:44:22.000Z",
                    crn: "1234",
                    href: "1234",
                    id: "1234",
                    lifecycle_state: "stable",
                    name: "icse-lz-demo-management-flow-logs",
                    resource_controller_url:
                      "https://cloud.ibm.com/vpc-ext/network/flowLogs",
                    resource_crn: "1234",
                    resource_group: "1234",
                    resource_group_name: "1234",
                    resource_name: "icse-lz-demo-management-flow-logs",
                    resource_status: "stable",
                    storage_bucket:
                      "icse-lz-demo-management-flow-logs-bucket-ejnvxsz4",
                    tags: [],
                    target: "1234",
                    timeouts: null,
                    vpc: "1234",
                  },
                },
              ],
            },
          ],
        },
        "./state/path/terraform.tfstate"
      );
      let expectedData = `// This file was generated by tfxjs
const tfxjs = require("tfxjs");
const tfx = new tfxjs("./state/path/terraform.tfstate");

tfx.apply("tfxjs generated tests", () => {
  tfx.state("root_module",
    tfx.address(
      "null_resource.count_example",
      {
        id: "2896328915849982980",
        triggers: {
          trigger_value: "example-e2e-tests"
        }
      },
      {
        id: "3935907870916963842",
        triggers: {
          trigger_value: "example-e2e-tests"
        }
      },
      {
        id: "5150844839615547579",
        triggers: {
          trigger_value: "example-e2e-tests"
        }
      }
    )
  );
  tfx.state("module.icse_vpc_network.module.activity_tracker",
    tfx.address("module.icse_vpc_network.module.activity_tracker.ibm_resource_key.atracker_cos_key", {
      account_id: "1234",
      created_by: "1234",
      created_at: "2022-08-18T14:38:31.845Z",
      credentials: {
        apikey: "1234",
        endpoints: "https://control.cloud-object-storage.cloud.ibm.com/v2/endpoints",
        iam_apikey_description: "1234",
        iam_apikey_name: "icse-lz-demo-atracker-cos-bind-key",
        iam_role_crn: "1234",
        iam_serviceid_crn: "1234",
        resource_instance_id: "1234"
      },
      crn: "1234",
      deleted_at: "",
      deleted_by: "",
      guid: "1234",
      iam_compatible: true,
      id: "1234",
      name: "icse-lz-demo-atracker-cos-bind-key",
      parameters: null,
      resource_alias_id: null,
      resource_group_id: "1234",
      resource_instance_id: "1234",
      resource_instance_url: "1234",
      role: "Writer",
      source_crn: "1234",
      state: "active",
      status: "active",
      tags: [
        "icse",
        "landing-zone"
      ],
      timeouts: null,
      updated_at: "2022-08-18T14:38:31.845Z",
      updated_by: "",
      url: "1234"
    }),
  );
  tfx.state("module.icse_vpc_network.module.flow_logs[0]",
    tfx.address("module.icse_vpc_network.module.flow_logs[0].ibm_iam_authorization_policy.flow_logs_policy", {
      description: "Allow flow logs write access cloud object storage instance",
      id: "1234",
      resource_attributes: [
    {
          name: "accountId",
          operator: "stringEquals",
          value: "1234"
        },
        {
          name: "serviceInstance",
          operator: "stringEquals",
          value: "1234"
        },
        {
          name: "serviceName",
          operator: "stringEquals",
          value: "cloud-object-storage"
        }
      ],
      roles: [
        "Writer"
      ],
      source_resource_group_id: "",
      source_resource_instance_id: "",
      source_resource_type: "flow-log-collector",
      source_service_account: "1234",
      source_service_name: "is",
      subject_attributes: [
        {
          name: "accountId",
          value: "1234"
        },
        {
          name: "resourceType",
          value: "flow-log-collector"
        },
        {
          name: "serviceName",
          value: "is"
        }
      ],
      target_resource_group_id: "",
      target_resource_instance_id: "1234",
      target_resource_type: "",
      target_service_name: "cloud-object-storage",
      transaction_id: "1234",
      version: null,
      index_key: "cos"
    }),
    tfx.address("module.icse_vpc_network.module.flow_logs[0].ibm_is_flow_log.flow_logs", {
      active: true,
      auto_delete: null,
      created_at: "2022-08-18T14:44:22.000Z",
      crn: "1234",
      href: "1234",
      id: "1234",
      lifecycle_state: "stable",
      name: "icse-lz-demo-management-flow-logs",
      resource_controller_url: "https://cloud.ibm.com/vpc-ext/network/flowLogs",
      resource_crn: "1234",
      resource_group: "1234",
      resource_group_name: "1234",
      resource_name: "icse-lz-demo-management-flow-logs",
      resource_status: "stable",
      storage_bucket: "icse-lz-demo-management-flow-logs-bucket-ejnvxsz4",
      tags: [],
      target: "1234",
      timeouts: null,
      vpc: "1234",
      index_key: "management"
    }),
  );
});
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return apply tests"
      );
    });
    it("should return one address for each module and composed  with writefilecallback", () => {
      let writeFileSpy = new sinon.spy();

      applyTfx(
        {
          resources: [
            {
              mode: "managed",
              type: "null_resource",
              name: "count_example",
              provider: 'provider["registry.terraform.io/hashicorp/null"]',
              instances: [
                {
                  index_key: 0,
                  schema_version: 0,
                  attributes: {
                    id: "2896328915849982980",
                    triggers: {
                      trigger_value: "example-e2e-tests",
                    },
                  },
                  sensitive_attributes: [],
                  dependencies: ["data.external.example"],
                },
                {
                  index_key: 1,
                  schema_version: 0,
                  attributes: {
                    id: "3935907870916963842",
                    triggers: {
                      trigger_value: "example-e2e-tests",
                    },
                  },
                  sensitive_attributes: [],
                  dependencies: ["data.external.example"],
                },
                {
                  index_key: 2,
                  schema_version: 0,
                  attributes: {
                    id: "5150844839615547579",
                    triggers: {
                      trigger_value: "example-e2e-tests",
                    },
                  },
                  sensitive_attributes: [],
                  dependencies: ["data.external.example"],
                },
              ],
            },
            {
              module: "module.icse_vpc_network.module.activity_tracker",
              mode: "managed",
              type: "ibm_resource_key",
              name: "atracker_cos_key",
              provider: 'provider["registry.terraform.io/ibm-cloud/ibm"]',
              instances: [
                {
                  index_key: 0,
                  schema_version: 0,
                  attributes: {
                    account_id: "1234",
                    created_by: "1234",
                    created_at: "2022-08-18T14:38:31.845Z",
                    credentials: {
                      apikey: "1234",
                      endpoints:
                        "https://control.cloud-object-storage.cloud.ibm.com/v2/endpoints",
                      iam_apikey_description: "1234",
                      iam_apikey_name: "icse-lz-demo-atracker-cos-bind-key",
                      iam_role_crn: "1234",
                      iam_serviceid_crn: "1234",
                      resource_instance_id: "1234",
                    },
                    crn: "1234",
                    deleted_at: "",
                    deleted_by: "",
                    guid: "1234",
                    iam_compatible: true,
                    id: "1234",
                    name: "icse-lz-demo-atracker-cos-bind-key",
                    parameters: null,
                    resource_alias_id: null,
                    resource_group_id: "1234",
                    resource_instance_id: "1234",
                    resource_instance_url: "1234",
                    role: "Writer",
                    source_crn: "1234",
                    state: "active",
                    status: "active",
                    tags: ["icse", "landing-zone"],
                    timeouts: null,
                    updated_at: "2022-08-18T14:38:31.845Z",
                    updated_by: "",
                    url: "1234",
                  },
                },
              ],
            },
            {
              module: "module.icse_vpc_network.module.flow_logs[0]",
              mode: "managed",
              type: "ibm_iam_authorization_policy",
              name: "flow_logs_policy",
              provider: 'provider["registry.terraform.io/ibm-cloud/ibm"]',
              instances: [
                {
                  index_key: "cos",
                  schema_version: 0,
                  attributes: {
                    description:
                      "Allow flow logs write access cloud object storage instance",
                    id: "1234",
                    resource_attributes: [
                      {
                        name: "accountId",
                        operator: "stringEquals",
                        value: "1234",
                      },
                      {
                        name: "serviceInstance",
                        operator: "stringEquals",
                        value: "1234",
                      },
                      {
                        name: "serviceName",
                        operator: "stringEquals",
                        value: "cloud-object-storage",
                      },
                    ],
                    roles: ["Writer"],
                    source_resource_group_id: "",
                    source_resource_instance_id: "",
                    source_resource_type: "flow-log-collector",
                    source_service_account: "1234",
                    source_service_name: "is",
                    subject_attributes: [
                      {
                        name: "accountId",
                        value: "1234",
                      },
                      {
                        name: "resourceType",
                        value: "flow-log-collector",
                      },
                      {
                        name: "serviceName",
                        value: "is",
                      },
                    ],
                    target_resource_group_id: "",
                    target_resource_instance_id: "1234",
                    target_resource_type: "",
                    target_service_name: "cloud-object-storage",
                    transaction_id: "1234",
                    version: null,
                  },
                },
              ],
            },
            {
              module: "module.icse_vpc_network.module.flow_logs[0]",
              mode: "managed",
              type: "ibm_is_flow_log",
              name: "flow_logs",
              provider: 'provider["registry.terraform.io/ibm-cloud/ibm"]',
              instances: [
                {
                  index_key: "management",
                  schema_version: 0,
                  attributes: {
                    active: true,
                    auto_delete: null,
                    created_at: "2022-08-18T14:44:22.000Z",
                    crn: "1234",
                    href: "1234",
                    id: "1234",
                    lifecycle_state: "stable",
                    name: "icse-lz-demo-management-flow-logs",
                    resource_controller_url:
                      "https://cloud.ibm.com/vpc-ext/network/flowLogs",
                    resource_crn: "1234",
                    resource_group: "1234",
                    resource_group_name: "1234",
                    resource_name: "icse-lz-demo-management-flow-logs",
                    resource_status: "stable",
                    storage_bucket:
                      "icse-lz-demo-management-flow-logs-bucket-ejnvxsz4",
                    tags: [],
                    target: "1234",
                    timeouts: null,
                    vpc: "1234",
                  },
                },
              ],
            },
          ],
        },
        "./state/path/terraform.tfstate",
        writeFileSpy
      );
      let expectedData = `// This file was generated by tfxjs
const tfxjs = require("tfxjs");
const tfx = new tfxjs("./state/path/terraform.tfstate");

tfx.apply("tfxjs generated tests", () => {
  tfx.state("root_module",
    tfx.address(
      "null_resource.count_example",
      {
        id: "2896328915849982980",
        triggers: {
          trigger_value: "example-e2e-tests"
        }
      },
      {
        id: "3935907870916963842",
        triggers: {
          trigger_value: "example-e2e-tests"
        }
      },
      {
        id: "5150844839615547579",
        triggers: {
          trigger_value: "example-e2e-tests"
        }
      }
    )
  );
  tfx.state("module.icse_vpc_network.module.activity_tracker",
    tfx.address("module.icse_vpc_network.module.activity_tracker.ibm_resource_key.atracker_cos_key", {
      account_id: "1234",
      created_by: "1234",
      created_at: "2022-08-18T14:38:31.845Z",
      credentials: {
        apikey: "1234",
        endpoints: "https://control.cloud-object-storage.cloud.ibm.com/v2/endpoints",
        iam_apikey_description: "1234",
        iam_apikey_name: "icse-lz-demo-atracker-cos-bind-key",
        iam_role_crn: "1234",
        iam_serviceid_crn: "1234",
        resource_instance_id: "1234"
      },
      crn: "1234",
      deleted_at: "",
      deleted_by: "",
      guid: "1234",
      iam_compatible: true,
      id: "1234",
      name: "icse-lz-demo-atracker-cos-bind-key",
      parameters: null,
      resource_alias_id: null,
      resource_group_id: "1234",
      resource_instance_id: "1234",
      resource_instance_url: "1234",
      role: "Writer",
      source_crn: "1234",
      state: "active",
      status: "active",
      tags: [
        "icse",
        "landing-zone"
      ],
      timeouts: null,
      updated_at: "2022-08-18T14:38:31.845Z",
      updated_by: "",
      url: "1234"
    }),
  );
  tfx.state("module.icse_vpc_network.module.flow_logs[0]",
    tfx.address("module.icse_vpc_network.module.flow_logs[0].ibm_iam_authorization_policy.flow_logs_policy", {
      description: "Allow flow logs write access cloud object storage instance",
      id: "1234",
      resource_attributes: [
    {
          name: "accountId",
          operator: "stringEquals",
          value: "1234"
        },
        {
          name: "serviceInstance",
          operator: "stringEquals",
          value: "1234"
        },
        {
          name: "serviceName",
          operator: "stringEquals",
          value: "cloud-object-storage"
        }
      ],
      roles: [
        "Writer"
      ],
      source_resource_group_id: "",
      source_resource_instance_id: "",
      source_resource_type: "flow-log-collector",
      source_service_account: "1234",
      source_service_name: "is",
      subject_attributes: [
        {
          name: "accountId",
          value: "1234"
        },
        {
          name: "resourceType",
          value: "flow-log-collector"
        },
        {
          name: "serviceName",
          value: "is"
        }
      ],
      target_resource_group_id: "",
      target_resource_instance_id: "1234",
      target_resource_type: "",
      target_service_name: "cloud-object-storage",
      transaction_id: "1234",
      version: null,
      index_key: "cos"
    }),
    tfx.address("module.icse_vpc_network.module.flow_logs[0].ibm_is_flow_log.flow_logs", {
      active: true,
      auto_delete: null,
      created_at: "2022-08-18T14:44:22.000Z",
      crn: "1234",
      href: "1234",
      id: "1234",
      lifecycle_state: "stable",
      name: "icse-lz-demo-management-flow-logs",
      resource_controller_url: "https://cloud.ibm.com/vpc-ext/network/flowLogs",
      resource_crn: "1234",
      resource_group: "1234",
      resource_group_name: "1234",
      resource_name: "icse-lz-demo-management-flow-logs",
      resource_status: "stable",
      storage_bucket: "icse-lz-demo-management-flow-logs-bucket-ejnvxsz4",
      tags: [],
      target: "1234",
      timeouts: null,
      vpc: "1234",
      index_key: "management"
    }),
  );
});
`;
      assert.isTrue(
        writeFileSpy.calledOnceWith(expectedData),
        "it should return data"
      );
    });
  });
  it("should create the correct file data with example data", () => {
    let actualData = applyTfx(
      {
        version: 4,
        terraform_version: "1.2.9",
        serial: 38,
        lineage: "215cd0b7-d7d4-0204-9f6b-67c5f962cbd5",
        outputs: {},
        resources: [
          {
            mode: "data",
            type: "external",
            name: "example",
            provider: 'provider["registry.terraform.io/hashicorp/external"]',
            instances: [
              {
                schema_version: 0,
                attributes: {
                  id: "-",
                  program: ["sh", "./test-output.sh", "example", "test"],
                  query: null,
                  result: {
                    data: "example-test-value",
                  },
                  working_dir: null,
                },
                sensitive_attributes: [],
              },
            ],
          },
          {
            mode: "data",
            type: "local_file",
            name: "lists",
            provider: 'provider["registry.terraform.io/hashicorp/local"]',
            instances: [
              {
                index_key: "list_1",
                schema_version: 0,
                attributes: {
                  content: "ponder,consider,opt,preordain,brainstorm,portent",
                  content_base64:
                    "cG9uZGVyLGNvbnNpZGVyLG9wdCxwcmVvcmRhaW4sYnJhaW5zdG9ybSxwb3J0ZW50",
                  filename: "./local-files/shuffle_list_1.txt",
                  id: "a48eb33e75d9fddbd716a126fb3fb52f0ca07613",
                },
                sensitive_attributes: [],
              },
              {
                index_key: "list_2",
                schema_version: 0,
                attributes: {
                  content: "scout,slinger,warrior,builder,settler",
                  content_base64:
                    "c2NvdXQsc2xpbmdlcix3YXJyaW9yLGJ1aWxkZXIsc2V0dGxlcg==",
                  filename: "./local-files/shuffle_list_2.txt",
                  id: "a994e19704ace6b7540ce5a2ce8842cdcdd815dd",
                },
                sensitive_attributes: [],
              },
            ],
          },
          {
            mode: "managed",
            type: "null_resource",
            name: "count_example",
            provider: 'provider["registry.terraform.io/hashicorp/null"]',
            instances: [
              {
                index_key: 0,
                schema_version: 0,
                attributes: {
                  id: "1952074275064166601",
                  triggers: {
                    trigger_value: "this-is-a-test",
                  },
                },
                sensitive_attributes: [],
                dependencies: ["data.external.example"],
              },
              {
                index_key: 1,
                schema_version: 0,
                attributes: {
                  id: "4992914291735418274",
                  triggers: {
                    trigger_value: "this-is-a-test",
                  },
                },
                sensitive_attributes: [],
                dependencies: ["data.external.example"],
              },
              {
                index_key: 2,
                schema_version: 0,
                attributes: {
                  id: "3220052493844923998",
                  triggers: {
                    trigger_value: "this-is-a-test",
                  },
                },
                sensitive_attributes: [],
                dependencies: ["data.external.example"],
              },
            ],
          },
        ],
      },
      "./x.tfstate"
    );
    let expectedData = `// This file was generated by tfxjs
const tfxjs = require("tfxjs");
const tfx = new tfxjs("./x.tfstate");

tfx.apply("tfxjs generated tests", () => {
  tfx.state("root_module",
    tfx.address("data.external.example", {
      id: "-",
      program: [
        "sh",
        "./test-output.sh",
        "example",
        "test"
      ],
      query: null,
      result: {
        data: "example-test-value"
      },
      working_dir: null
    }),
    tfx.address(
      "data.local_file.lists",
      {
        content: "ponder,consider,opt,preordain,brainstorm,portent",
        content_base64: "cG9uZGVyLGNvbnNpZGVyLG9wdCxwcmVvcmRhaW4sYnJhaW5zdG9ybSxwb3J0ZW50",
        filename: "./local-files/shuffle_list_1.txt",
        id: "a48eb33e75d9fddbd716a126fb3fb52f0ca07613",
        index_key: "list_1"
      },
      {
        content: "scout,slinger,warrior,builder,settler",
        content_base64: "c2NvdXQsc2xpbmdlcix3YXJyaW9yLGJ1aWxkZXIsc2V0dGxlcg==",
        filename: "./local-files/shuffle_list_2.txt",
        id: "a994e19704ace6b7540ce5a2ce8842cdcdd815dd",
        index_key: "list_2"
      }
    ),
    tfx.address(
      "null_resource.count_example",
      {
        id: "1952074275064166601",
        triggers: {
          trigger_value: "this-is-a-test"
        }
      },
      {
        id: "4992914291735418274",
        triggers: {
          trigger_value: "this-is-a-test"
        }
      },
      {
        id: "3220052493844923998",
        triggers: {
          trigger_value: "this-is-a-test"
        }
      }
    )
  );
});
`;
    assert.deepEqual(actualData, expectedData, "it should return correct data");
  });
});
