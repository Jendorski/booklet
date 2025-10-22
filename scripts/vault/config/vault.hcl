storage "file" {
  path = "/vault/file"
}

listener "tcp" {
  tls_disable = 1
}

disable_mlock = true