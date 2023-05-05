# Creating Terraform Acceptance Tests with tfxjs

## What is tfxjs?

tfxjs is a NodeJS library built with [mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/) to allow users to quickly and easily create acceptance tests for terraform templates. tfxjs also allows users to run acceptance tests for terraform templates, allowing for end users to skip the costly provisioning price tags that can come with cloud resources.

tfxjs can be used to more than just acceptance tests, and includes the following features:

- Flexible acceptance and end-to-end (terraform state) tests
- Automated Test Generation
- Robust command line tool
- End to End Testing including executing commands against remote endpoints

## Why tfxjs?

There are many terraform test frameworks like [Terratest](https://terratest.gruntwork.io/), what sets tfxjs apart is the ability to easily create acceptance tests using human readable syntax. As Terraform uses JSON for storage, it is much easier to parse a complex object with many variable properties using JavaScript.

Most test libraries do not have the ability to test deeply within the terraform JSON files, especially using a language like Go where the data structures must be defined. This creates a pattern where the end user must either create a complex data structure for each resource or test only outputs of the terraform file.

Let's take a look at the example Terratest example:

```golang
package test

import (
	"testing"

	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/stretchr/testify/assert"
)

func TestTerraformHelloWorldExample(t *testing.T) {
	// retryable errors in terraform testing.
	terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
		TerraformDir: "../examples/terraform-hello-world-example",
	})

	defer terraform.Destroy(t, terraformOptions)

	terraform.InitAndApply(t, terraformOptions)

	output := terraform.Output(t, terraformOptions, "hello_world")
	assert.Equal(t, "Hello, World!", output)
}
```

In the above test, users can set the directory and check the output. This approach is fine if a user wants to check something simple like an output. Using tfxjs, a user is able to not only test easy to find outputs, but complex resources and modules.

Now let's look an example state test from tfxjs:

```js
const tfxjs = require("tfxjs");
const tfx = new tfxjs("../", {
  // set tfvars
  trigger_value: "example-e2e-tests",
  shuffle_count: 3,
});

tfx.apply("Hashicorp Provider Example Tests", () => {
  tfx.outputs(
    "example outputs"
    tfx.output("example", "example-output-string")
  )
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
        input: ["ponder","consider","opt","preordain","brainstorm","portent"],
        result: tfx.expect("to contain 3 entries from the list.", (inputs) => {
          let foundCount = 0;
          inputs.forEach((resource) => {
            if (["ponder","consider","opt","preordain","brainstorm","portent"].indexOf(resource) !== -1)
              foundCount++;
          });
          return foundCount === 3;
        }),
      }
    )
  );
  ...
});
```

From the tfxjs test we can set custom messages for resources within the state, test the resource defaults, and even pass a custom function to test against a randomly generated result without needing to define any data structures. In this example we are using the hashicorp provider `random_shuffle` resource, but this could easily be done with any other provider. 

## Getting Started

### Requirements

- NodeJS version `17.6.0` or greater
- NPM version `8.19.2` or greater
- Terraform CLI

### Creating an Example Test Environment With IBM Cloud

For this example, we will be using the [Easy Multizone VPC Template](https://github.com/Cloud-Schematics/easy-multizone-vpc) from the IBM Cloud Schematics Github. To follow this example, you will need an IBM Cloud Account and an [IBM Cloud API Key](https://www.ibm.com/docs/en/app-connect/container?topic=servers-creating-cloud-api-key).

#### 1. Clone the Repository

Navigate into the repository once the clone is successful

```shell
git clone https://github.com/Cloud-Schematics/easy-multizone-vpc
cd easy-multizone-vpc
```

#### 2. Initialize the Test Directory

The tfxjs command line tool `tfx` allows users to quickly setup test directories. Ensure that tfxjs is installed globally using the command:

```shell
npm i tfxjs -g
```

Once the command line tool is installed, create a test directory:

```shell
tfx init tests/
```

This command installs `mocha` globally if not already installed.

In your new test directory, you should see the following:
- `node_modules/` folder with needed packages installed
- An empty test file `tfxjs.test.js`
- `package.json` and `package-lock.json`

The automatically generated `package.json` is as follows:

```json
{
  "name": "tfxjs generated acceptance tests",
  "version": "0.0.1",
  "description": "acceptance tests for terraform directory",
  "main": "tfxjs.test.js",
  "scripts": {
    "test": "tfx .",
    "build": "npm i && npm i -g tfxjs mocha",
  },
  "author": "This file was automatically generated by tfxjs",
  "license": "ISC",
  "dependencies": {
    "tfxjs": "^1.2.2",
  },
}
```

#### 3. Generating an Acceptance Test File

Using the tfx CLI, we can automatically generate a test file from the `easy-multizone-vpc` directory. In order to ensure the IBM Cloud Terraform Provider initializes properly, we will add your IBM Cloud API Key as a terraform variable. To create our tests, we will navigate into the `tests/` directory and run the `tfx plan` command.

```shell
cd tests/
tfx plan --in ../ --out ./tests/tfxjs.test.js --type tfx --tf-var ibmcloud_api_key=<your ibm cloud api key>
```

On a successful initialization, you should see the output for a terraform plan describing the resources in the default module configuration. Test resources will automatically be created for the VPC module, and each resource within that module. Each resource test created this way will have each value that is available at the time of terraform plan. Example resource test found in `tfxjs.test.js`.

```js
  tfx.resource("Vpc", "ibm_is_vpc.vpc", {
    address_prefix_management: "manual",
    classic_access: false,
    name: "ez-multizone-vpc",
    resource_group: "<resource group>",
    tags: ["ez-vpc", "multizone-vpc"],
  }),
```

##### Remember to Replace Sensitive Values

When providing variables to generate automated tests based on a directory, the `tfx init` command will add plaintext values to the constructor. Ensure that before pushing to any code repository that those values have been replaced. These values can be stored as environment variables:

```js
const tfx = new tfxjs(".", {
  ibmcloud_api_key: process.env.API_KEY,
});
```

#### 4. Running the Acceptance Test File

From your test directory, run the following command:

```shell
npm run test
```

On a successful run, we will see the terraform output followed by the following successful tests:

```stdout
    ✔ Successfully generates a terraform plan file

  Module Vpc
    ✔ Plan should contain the module module.ez_vpc.module.vpc
    ✔ module.ez_vpc.module.vpc should not contain additional resources
    Network Acl Acl
      ✔ Module module.ez_vpc.module.vpc should contain resource ibm_is_network_acl.network_acl["acl"]
      ✔ Network Acl Acl should have the correct name value
      ✔ Network Acl Acl should have the correct resource_group value
      ✔ Network Acl Acl should have the correct rules value
    Gateway Zone 1
      ✔ Module module.ez_vpc.module.vpc should contain resource ibm_is_public_gateway.gateway["zone-1"]
      ✔ Gateway Zone 1 should have the correct name value
      ✔ Gateway Zone 1 should have the correct resource_group value
      ✔ Gateway Zone 1 should have the correct zone value
    Gateway Zone 2
      ✔ Module module.ez_vpc.module.vpc should contain resource ibm_is_public_gateway.gateway["zone-2"]
      ✔ Gateway Zone 2 should have the correct name value
      ✔ Gateway Zone 2 should have the correct resource_group value
      ✔ Gateway Zone 2 should have the correct zone value
    Gateway Zone 3
      ✔ Module module.ez_vpc.module.vpc should contain resource ibm_is_public_gateway.gateway["zone-3"]
      ✔ Gateway Zone 3 should have the correct name value
      ✔ Gateway Zone 3 should have the correct resource_group value
      ✔ Gateway Zone 3 should have the correct zone value
    Default Vpc Rule Allow All Inbound
      ✔ Module module.ez_vpc.module.vpc should contain resource ibm_is_security_group_rule.default_vpc_rule["allow-all-inbound"]
      ✔ Default Vpc Rule Allow All Inbound should have the correct direction value
      ✔ Default Vpc Rule Allow All Inbound should have the correct icmp value
      ✔ Default Vpc Rule Allow All Inbound should have the correct ip_version value
      ✔ Default Vpc Rule Allow All Inbound should have the correct remote value
      ✔ Default Vpc Rule Allow All Inbound should have the correct tcp value
      ✔ Default Vpc Rule Allow All Inbound should have the correct udp value
    Subnet Ez Multizone Subnet Zone 1
      ✔ Module module.ez_vpc.module.vpc should contain resource ibm_is_subnet.subnet["ez-multizone-subnet-zone-1"]
      ✔ Subnet Ez Multizone Subnet Zone 1 should have the correct ip_version value
      ✔ Subnet Ez Multizone Subnet Zone 1 should have the correct ipv4_cidr_block value
      ✔ Subnet Ez Multizone Subnet Zone 1 should have the correct name value
      ✔ Subnet Ez Multizone Subnet Zone 1 should have the correct resource_group value
      ✔ Subnet Ez Multizone Subnet Zone 1 should have the correct zone value
    Subnet Ez Multizone Subnet Zone 2
      ✔ Module module.ez_vpc.module.vpc should contain resource ibm_is_subnet.subnet["ez-multizone-subnet-zone-2"]
      ✔ Subnet Ez Multizone Subnet Zone 2 should have the correct ip_version value
      ✔ Subnet Ez Multizone Subnet Zone 2 should have the correct ipv4_cidr_block value
      ✔ Subnet Ez Multizone Subnet Zone 2 should have the correct name value
      ✔ Subnet Ez Multizone Subnet Zone 2 should have the correct resource_group value
      ✔ Subnet Ez Multizone Subnet Zone 2 should have the correct zone value
    Subnet Ez Multizone Subnet Zone 3
      ✔ Module module.ez_vpc.module.vpc should contain resource ibm_is_subnet.subnet["ez-multizone-subnet-zone-3"]
      ✔ Subnet Ez Multizone Subnet Zone 3 should have the correct ip_version value
      ✔ Subnet Ez Multizone Subnet Zone 3 should have the correct ipv4_cidr_block value
      ✔ Subnet Ez Multizone Subnet Zone 3 should have the correct name value
      ✔ Subnet Ez Multizone Subnet Zone 3 should have the correct resource_group value
      ✔ Subnet Ez Multizone Subnet Zone 3 should have the correct zone value
    Vpc
      ✔ Module module.ez_vpc.module.vpc should contain resource ibm_is_vpc.vpc
      ✔ Vpc should have the correct address_prefix_management value
      ✔ Vpc should have the correct classic_access value
      ✔ Vpc should have the correct name value
      ✔ Vpc should have the correct resource_group value
      ✔ Vpc should have the correct tags value
    Subnet Prefix Ez Multizone Subnet Zone 1
      ✔ Module module.ez_vpc.module.vpc should contain resource ibm_is_vpc_address_prefix.subnet_prefix["ez-multizone-subnet-zone-1"]
      ✔ Subnet Prefix Ez Multizone Subnet Zone 1 should have the correct cidr value
      ✔ Subnet Prefix Ez Multizone Subnet Zone 1 should have the correct is_default value
      ✔ Subnet Prefix Ez Multizone Subnet Zone 1 should have the correct name value
      ✔ Subnet Prefix Ez Multizone Subnet Zone 1 should have the correct zone value
    Subnet Prefix Ez Multizone Subnet Zone 2
      ✔ Module module.ez_vpc.module.vpc should contain resource ibm_is_vpc_address_prefix.subnet_prefix["ez-multizone-subnet-zone-2"]
      ✔ Subnet Prefix Ez Multizone Subnet Zone 2 should have the correct cidr value
      ✔ Subnet Prefix Ez Multizone Subnet Zone 2 should have the correct is_default value
      ✔ Subnet Prefix Ez Multizone Subnet Zone 2 should have the correct name value
      ✔ Subnet Prefix Ez Multizone Subnet Zone 2 should have the correct zone value
    Subnet Prefix Ez Multizone Subnet Zone 3
      ✔ Module module.ez_vpc.module.vpc should contain resource ibm_is_vpc_address_prefix.subnet_prefix["ez-multizone-subnet-zone-3"]
      ✔ Subnet Prefix Ez Multizone Subnet Zone 3 should have the correct cidr value
      ✔ Subnet Prefix Ez Multizone Subnet Zone 3 should have the correct is_default value
      ✔ Subnet Prefix Ez Multizone Subnet Zone 3 should have the correct name value
      ✔ Subnet Prefix Ez Multizone Subnet Zone 3 should have the correct zone value


  65 passing (12s)
```

#### 5. Generating a State Test File

We can create an state test file using the `tfx state` command. A state file can only be automatically generated using a `terraform.tfstate` file.

##### Creating the Resources

In order to generate the terraform.tfstate file, we need to create resources using `terraform apply`. To create our resources, run the following commands from the the `easy-multizone-vpc` directory:

```shell
export TF_VAR_ibmcloud_api_key=<your ibm platform api key>
terraform init
echo "yes" | terraform apply
```

#### 6. Generating the Test File

From the `easy-multizone-vpc` directory, use `tfx init state-tests/` to initialize a new test directory.

Run the following commands to generate a test file:
```shell
tfx init state_tests/
cd state_tests/
tfx state --in ../terraform.tfstate --out state.test.js
```

On a successful run, automated tests will be generated for terraform outputs as well as each resource. Example resource:
```js
  tfx.state(
    "module.ez_vpc",
    tfx.address("data.module.ez_vpc.ibm_resource_group.resource_group", {
      account_id: "...",
      created_at: "...",
      crn: "crn:v1:bluemix:public:resource-controller::a/...",
      id: "...",
      is_default: false,
      name: "...",
      payment_methods_url: null,
      quota_id: "...",
      quota_url: "...",
      resource_linkages: [],
      state: "ACTIVE",
      teams_url: null,
      updated_at: "...",
    })
  );
```

#### 7. Running the Test File

To run your tests, use the command `tfx state.test.js`

A successful run will run 230 tests, including tests the logs will show similar text:
```
* tfxjs testing

##############################################################################
# 
#  Running `terraform apply`
#  Template File:
#     ../terraform.tfstate
# 
##############################################################################



  tfxjs generated tests
    ✔ Runs `terraform apply` in the target directory

  template outputs Outputs
    subnet_detail_list
      ✔ Output subnet_detail_list should be in tfstate
      ✔ Output subnet_detail_list should have the correct output value
    subnet_ids
      ✔ Output subnet_ids should be in tfstate
      ✔ Output subnet_ids should have the correct output value
    subnet_zone_list
      ✔ Output subnet_zone_list should be in tfstate
      ✔ Output subnet_zone_list should have the correct output value
    vpc_crn
      ✔ Output vpc_crn should be in tfstate
      ✔ Output vpc_crn should have the correct output value
    vpc_id
      ✔ Output vpc_id should be in tfstate
      ✔ Output vpc_id should have the correct output value
    vpn_gateway_public_ips
      ✔ Output vpn_gateway_public_ips should be in tfstate
      ✔ Output vpn_gateway_public_ips should have the correct output value

  module.ez_vpc
    module.ez_vpc.data.ibm_resource_group.resource_group
      ✔ Resource module.ez_vpc.data.ibm_resource_group.resource_group should be in tfstate
      ✔ Expected resource module.ez_vpc.data.ibm_resource_group.resource_group[0] to have correct value for account_id.
      ✔ Expected resource module.ez_vpc.data.ibm_resource_group.resource_group[0] to have correct value for created_at.
      ✔ Expected resource module.ez_vpc.data.ibm_resource_group.resource_group[0] to have correct value for crn.
      ✔ Expected resource module.ez_vpc.data.ibm_resource_group.resource_group[0] to have correct value for id.
      ✔ Expected resource module.ez_vpc.data.ibm_resource_group.resource_group[0] to have correct value for is_default.
...
      ✔ Expected resource module.ez_vpc.module.vpc.ibm_is_vpc_address_prefix.subnet_prefix[iac-multizone-subnet-zone-3] to have correct value for related_crn.
      ✔ Expected resource module.ez_vpc.module.vpc.ibm_is_vpc_address_prefix.subnet_prefix[iac-multizone-subnet-zone-3] to have correct value for vpc.
      ✔ Expected resource module.ez_vpc.module.vpc.ibm_is_vpc_address_prefix.subnet_prefix[iac-multizone-subnet-zone-3] to have correct value for zone.
      ✔ Expected instance with key iac-multizone-subnet-zone-3 to exist at module.ez_vpc.module.vpc.ibm_is_vpc_address_prefix.subnet_prefix


  230 passing (117ms)
```

#### 8. Clean Up

Clean up your resources by using the command `terraform destroy` from the `easy-multizone-vpc` directory to destroy your resources.

#### Congratulations!

You setup tfxjs acceptance and end-to-end tests using IBM Cloud!

---

### Creating an Example Test Environment With HashiCorp Provider

For this example, we will be using the [HashiCorp Provider Template](https://github.com/Cloud-Schematics/hashicorp-provider-example) from the IBM Cloud Schematics Github. This example uses only HashiCorp resources, these resources are only created on your local environment and does not require the use or creation of any cloud resources.

#### 1. Clone the Repository

Navigate into the repository once the clone is successful

```shell
git clone https://github.com/Cloud-Schematics/hashicorp-provider-example
cd hashicorp-provider-example
```

#### 2. Initialize the Test Directory

The tfxjs command line tool `tfx` allows users to quickly setup test directories. Ensure that tfxjs is installed globally using the command:

```shell
npm i tfxjs -g
```

Once the command line tool is installed, create a test directory:

```shell
tfx init tests/
```

This command installs `mocha` globally if not already installed.

In your new test directory, you should see the following:
- `node_modules/` folder with needed packages installed
- An empty test file `tfxjs.test.js`
- `package.json` and `package-lock.json`

The automatically generated `package.json` is as follows:

```json
{
  "name": "tfxjs generated acceptance tests",
  "version": "0.0.1",
  "description": "acceptance tests for terraform directory",
  "main": "tfxjs.test.js",
  "scripts": {
    "test": "tfx .",
    "build": "npm i && npm i -g tfxjs mocha",
  },
  "author": "This file was automatically generated by tfxjs",
  "license": "ISC",
  "dependencies": {
    "tfxjs": "^1.2.2",
  },
}
```

#### 3. Generating an Acceptance Test File

Using the tfx CLI, we can automatically generate a test file from the `hashicorp-provider-example` directory.

```shell
cd tests/
tfx plan --in ../ --out ./tfxjs.test.js --type tfx
```

On a successful initialization, you should see the output for a terraform plan describing the resources in the default module configuration. Test resources will automatically be created each resource and each module. Each resource test created this way will have each value that is available at the time of terraform plan. Example resource test found in `tfxjs.test.js`:

```js
tfx.plan("tfx Generated Plan", () => {
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
  ...
```

#### 4. Running the Acceptance Test File

From your test directory, run the following command:

```shell
npm run test
```

On a successful run, we will see the terraform output followed by the following successful tests:

```stdout

    ✔ Successfully generates a terraform plan file

  Module Root Module
    ✔ Plan should contain the module root_module
    ✔ root_module should not contain additional resources
    Count Example 0
      ✔ Module root_module should contain resource null_resource.count_example[0]
      ✔ Count Example 0 should have the correct triggers value
    Count Example 1
      ✔ Module root_module should contain resource null_resource.count_example[1]
      ✔ Count Example 1 should have the correct triggers value
    Count Example 2
      ✔ Module root_module should contain resource null_resource.count_example[2]
      ✔ Count Example 2 should have the correct triggers value
    Map Example Example
      ✔ Module root_module should contain resource null_resource.map_example["example"]
      ✔ Map Example Example should have the correct triggers value
    Map Example Test
      ✔ Module root_module should contain resource null_resource.map_example["test"]
      ✔ Map Example Test should have the correct triggers value
    Map Example Value
      ✔ Module root_module should contain resource null_resource.map_example["value"]
      ✔ Map Example Value should have the correct triggers value
    Random Example
      ✔ Module root_module should contain resource random_pet.random_example
      ✔ Random Example should have the correct length value
      ✔ Random Example should have the correct prefix value
      ✔ Random Example should have the correct separator value
    Shuffle Example List 1
      ✔ Module root_module should contain resource random_shuffle.shuffle_example["list_1"]
      ✔ Shuffle Example List 1 should have the correct input value
      ✔ Shuffle Example List 1 should have the correct keepers value
      ✔ Shuffle Example List 1 should have the correct result_count value
    Shuffle Example List 2
      ✔ Module root_module should contain resource random_shuffle.shuffle_example["list_2"]
      ✔ Shuffle Example List 2 should have the correct input value
      ✔ Shuffle Example List 2 should have the correct keepers value
      ✔ Shuffle Example List 2 should have the correct result_count value

  Module Example Module
    ✔ Plan should contain the module module.example_module
    ✔ module.example_module should not contain additional resources
    Random Example
      ✔ Module module.example_module should contain resource random_pet.random_example
      ✔ Random Example should have the correct length value
      ✔ Random Example should have the correct prefix value
      ✔ Random Example should have the correct separator value

  Module Ping Module
    ✔ Plan should contain the module module.ping_module
    ✔ module.ping_module should not contain additional resources
    Ping Test
      ✔ Module module.ping_module should contain resource random_shuffle.ping_test
      ✔ Ping Test should have the correct input value
      ✔ Ping Test should have the correct keepers value
      ✔ Ping Test should have the correct result_count value
```

#### 5. Generating a State Test File

We can create an state test file using the `tfx state` command. A state file can only be automatically generated using a `terraform.tfstate` file.

##### Creating the Resources

In order to generate the terraform.tfstate file, we need to create resources using `terraform apply`. To create our resources, run the following commands from the the `hashicorp-provider-example` directory:

```shell
terraform init
echo "yes" | terraform apply
```

#### 6. Generating the Test File

From the `hashicorp-provider-example` directory, use `tfx init state-tests/` to initialize a new test directory.

Run the following commands to generate a test file:
```shell
tfx init state_tests
cd state_tests/
tfx state --in ../terraform.tfstate --out state.test.js
```

On a successful run, automated tests will be generated for terraform outputs as well as each resource. Example resource:
```js
tfx.apply("tfxjs generated tests", () => {
  tfx.state(
    "root_module",
    tfx.address("data.external.example", {
      id: "-",
      program: ["sh", "./test-output.sh", "example", "test"],
      query: null,
      result: {
        data: "example-test-value",
      },
      working_dir: null,
    }),
    tfx.address(
      "data.local_file.lists",
      {
        content: "ponder,consider,opt,preordain,brainstorm,portent",
        content_base64:
          "cG9uZGVyLGNvbnNpZGVyLG9wdCxwcmVvcmRhaW4sYnJhaW5zdG9ybSxwb3J0ZW50",
        filename: "./local-files/shuffle_list_1.txt",
        id: "a48eb33e75d9fddbd716a126fb3fb52f0ca07613",
        index_key: "list_1",
      },
      {
        content: "scout,slinger,warrior,builder,settler",
        content_base64: "c2NvdXQsc2xpbmdlcix3YXJyaW9yLGJ1aWxkZXIsc2V0dGxlcg==",
        filename: "./local-files/shuffle_list_2.txt",
        id: "a994e19704ace6b7540ce5a2ce8842cdcdd815dd",
        index_key: "list_2",
      }
    ),
```

#### 7. Running the Test File

To run your tests, use the command `tfx state.test.js`

A successful run will run 230 tests, including tests the logs will show similar text:
```
* tfxjs testing

##############################################################################
# 
#  Running `terraform apply`
#  Template File:
#     ../terraform.tfstate
# 
##############################################################################

  tfxjs generated tests
    ✔ Runs `terraform apply` in the target directory

  root_module
    data.external.example
      ✔ Resource data.external.example should be in tfstate
      ✔ Expected resource data.external.example[0] to have correct value for id.
      ✔ Expected resource data.external.example[0] to have correct value for program.
      ✔ Expected resource data.external.example[0] to have correct value for query.
      ✔ Expected resource data.external.example[0] to have correct value for result.
      ✔ Expected resource data.external.example[0] to have correct value for working_dir.
      ✔ Expected instance with key 0 to exist at data.external.example
  ...
  module.ping_module
    module.ping_module.random_shuffle.ping_test
      ✔ Resource module.ping_module.random_shuffle.ping_test should be in tfstate
      ✔ Expected resource module.ping_module.random_shuffle.ping_test[0] to have correct value for id.
      ✔ Expected resource module.ping_module.random_shuffle.ping_test[0] to have correct value for input.
      ✔ Expected resource module.ping_module.random_shuffle.ping_test[0] to have correct value for keepers.
      ✔ Expected resource module.ping_module.random_shuffle.ping_test[0] to have correct value for result.
      ✔ Expected resource module.ping_module.random_shuffle.ping_test[0] to have correct value for result_count.
      ✔ Expected resource module.ping_module.random_shuffle.ping_test[0] to have correct value for seed.
      ✔ Expected instance with key 0 to exist at module.ping_module.random_shuffle.ping_test


  76 passing (108ms)
```

#### 8. Clean Up

Clean up your resources by using the command `terraform destroy` from the `easy-multizone-vpc` directory to destroy your resources.

#### Congratulations!

You setup tfxjs acceptance and end-to-end tests using the HashiCorp provider!


## Advanced Usage

tfxjs offers advanced features to ensure your tests are as robust as possible. This section will cover the following tfxjs features:
- Implementing custom tests with `tfx.expect`
- Running tests against a copied workspace with `tfx.clone`
- Running end-to-end connectivity tests with `tfx.connectionTest`
- Creating easy to read test YAML files using the tfx CLI

### Implementing Custom Tests

When using Terraform there can often be results that have predictible patterns but will be different for each run. Let's take a look at this example using the HashiCorp `random_pet`

```terraform
resource "random_pet" "random_example" {
  length    = 3
  prefix    = "example-acceptance"
  separator = "-"
}
```

In this case, a resource will be generated with 3 random pets, prepended with the prefix `example-acceptance` and separated by `-` characters. This means that each time this resource is created, we can expect a total of 5 segments separated with hyphens.

`tfx.expect` can be used to implement a custom test against the resource ID. tfxjs allows users to implement custom tests by using `tfx.expect` and setting it to a resource value. `tfx.expect` accepts two arguments, a message and a function. The result of the function must evaluate to a boolean value.

In this test example we are testing the ID value to ensure that it will have a total of 5 segements separated with hypens:

```js
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
```

### Creating a Clone Workspace


- move to box note (personal, cse)
- get link for trello board (https://trello.com/c/1ncCmtOf/339-pitch-template-new-blog-posts)
   - open issue
   - add link to box note
   - give Ian Smalley access
- apache 2.0
