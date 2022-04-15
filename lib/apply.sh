# Run terraform plan and return JSON

#!/bin/bash
export "TF_VAR_$1"=$2 # inside shell export a tfvar with name $1 to be value $2
FILE_PATH=$3          # filepath where template exists
cd $FILE_PATH         # cd into filepath

##############################################################################
# Terraform commands
##############################################################################
QUIET=$(terraform init)                          # Initialize terraform
QUIET=$(terraform plan -out=tfplan -input=false) # Create terraform plan
TRY=$(terraform show -json tfplan | jq)          # should exit out if plan incorrect
QUIET=$(echo "yes" | terraform apply)            # Run terraform plan
##############################################################################

cat terraform.tfstate # Print the tfstate
