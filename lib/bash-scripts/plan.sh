# Run terraform plan and return JSON

#!/bin/bash
export "TF_VAR_$1"=$2 # Set TF environment to have variable with name $1 set to value $2
FILE_PATH=$3          # Terraform template filepath
cd $FILE_PATH         # Go into template filepath

##############################################################################
# Terraform commands
##############################################################################
QUIET=$(terraform init)                          # initialize template
QUIET=$(terraform plan -out=tfplan -input=false) # create tfplan
terraform show -json tfplan | jq                 # show plan as pretty json
##############################################################################
QUIET=$(rm -rf tfplan .terraform/ .terraform.lock.hcl) # Delete files created