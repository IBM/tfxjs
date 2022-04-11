# Run terraform plan and return JSON

#!/bin/bash
export "TF_VAR_$1"=$2
FILE_PATH=$3
cd $FILE_PATH
QUIET=$(terraform init)
QUIET=$(terraform plan -out=tfplan)
terraform show -json tfplan | jq
QUIET=$(rm -rf tfplan .terraform/ .terraform.lock.hcl)