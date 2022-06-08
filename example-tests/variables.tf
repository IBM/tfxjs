##############################################################################
# Variables
##############################################################################

variable "trigger_value" {
  description = "Value used to trigger null resources"
  type        = string
  default     = "this-is-a-test"
}

variable "shuffle_count" {
  description = "Value used to determine how many shuffles to create"
  type        = number
  default     = 2

  validation {
    error_message = "Count must be at least one."
    condition     = var.shuffle_count > 0
  }
}

##############################################################################