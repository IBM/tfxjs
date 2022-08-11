# Example Tests

This module containsKeys an example Terraform template using HashiCorp providers and example acceptence and end to end tests for each of them.

## Table of Contents

1. [Providers](#providers)
2. [Getting Started](#getting-started)
3. [Running the Tests](#running-the-tests)

---

## Providers

This terraform template uses several different HashiCorp provider resources and data sources to ensure that some values will not be known until after an apply is finished. These resources also do not require any specific cloud provider.

- [External](https://registry.terraform.io/providers/hashicorp/external/latest/docs)
- [Local File](https://registry.terraform.io/providers/hashicorp/local/latest/docs)
- [Null](https://registry.terraform.io/providers/hashicorp/null/latest/docs)
- [Random](https://registry.terraform.io/providers/hashicorp/random/latest/docs)

---

## Getting Started

<<<<<<< HEAD
=======
Install `jq` using your preferred method [here](https://stedolan.github.io/jq/download/)

>>>>>>> intern-tfxjs/master
Install `tfxjs` in the [tests](./tests/) folder.

```shell
cd tests
npm i
```

Run the following command to make sure the latest version of tfxjs is installed globally

```shell
npm i tfxjs -g
```

---

## Running the Tests

To run the acceptance tests from the `./tests` directory

### Acceptance Tests

Acceptance tests can be found [here](./tests/example-acceptance-tests.test.js)

```shell
tfx example-acceptance-tests.test.js
```

### End to End Tests

End to end tests can be found [here](./tests/example-e2e-tests.test.js)

```shell
tfx example-e2e-tests.test.js
```