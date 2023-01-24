##############################################################################
# Get External Data
##############################################################################

data "external" "example" {
  program = ["sh", "${path.module}/test-output.sh", "example", "test"]
}

##############################################################################


##############################################################################
# Get data from local file
##############################################################################

locals {
  file_name_list = {
    list_1 = "shuffle_list_1"
    list_2 = "shuffle_list_2"
  }
}

data "local_file" "lists" {
  for_each = local.file_name_list
  filename = "${path.module}/local-files/${each.value}.txt"
}

##############################################################################


##############################################################################
# Null resource example
##############################################################################

resource "null_resource" "count_example" {
  triggers = {
    trigger_value = var.trigger_value
  }
  count = length(split("-", data.external.example.result.data))
}

resource "null_resource" "map_example" {
  triggers = {
    trigger_value = var.trigger_value
  }
  for_each = toset(split("-", data.external.example.result.data))
}

##############################################################################

##############################################################################
# Random resource examples
##############################################################################

resource "random_pet" "random_example" {
  length    = 3
  prefix    = "example-acceptance"
  separator = "-"
}

resource "random_shuffle" "shuffle_example" {
  for_each = data.local_file.lists
  keepers = {
    shuffle_count = var.shuffle_count
  }
  input        = split(",", each.value.content)
  result_count = var.shuffle_count
}

##############################################################################

##############################################################################
# Example Module
##############################################################################

module "example_module" {
  source = "./example-module"
}

module "ping_module" {
  source = "./ping_module"
}

##############################################################################