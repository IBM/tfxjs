#!bin/bash

EXTERNAL_VALUE="$1-$2-value"
jq -n --arg data "$EXTERNAL_VALUE" '{"data":$data}'