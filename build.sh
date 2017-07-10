yarn run build
GOOS=linux GOARCH=amd64 go build -o dist/api api.go
docker-compose build
