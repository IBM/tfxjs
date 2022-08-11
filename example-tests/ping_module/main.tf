resource "random_shuffle" "ping_test" {
  keepers = {
    shuffle_count = 1
  }
  input        = ["8.8.8.8"]
  result_count = 1
}