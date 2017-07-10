job "angularhn" {
  datacenters = ["dc1"]
  type = "service"

  update {
    stagger = "2s"
    max_parallel = 1
  }

  group "web" {
    count = 1

    restart {
      attempts = 10
      interval = "5m"
      delay = "10s"
      mode = "delay"
    }

    task "universal" {
      driver = "docker"

      config {
        image = "sebastianm/angular-hacker-news-universal:latest"
      }

      resources {
        cpu    = 500 # 500 MHz
        memory = 128
        network {
          mbits = 10
        }
      }
    }

    task "webserver" {
      driver = "docker"

      config {
        image = "sebastianm/angular-hacker-news-webserver:latest"
      }

      resources {
        cpu    = 500 # 500 MHz
        memory = 128
        network {
          mbits = 10
          port "webhttp" {
            static = "80"
          },
          port "webhttps" {
            static = "443"
          }
        }
      }

      service {
        name = "global-redis-check"
        tags = ["global", "cache"]
        port = "db"
        check {
          name     = "alive"
          type     = "tcp"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }
  }
}