const extract = require("../lib/extract");
const { assert } = require("chai");
const YAML = require("json-to-pretty-yaml");
const mocks = require("./tfx.mocks"); // import mocks
const fs = require("fs");
let mock = new mocks(); // initialize mocks
const sinon = require("sinon");
const { planTfx, fileDataCallback } = require("../lib/extract");

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
});
