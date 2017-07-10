FROM alpine:latest

ADD dist/api /api

# add root certicates needed for go
RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*

EXPOSE 8090

VOLUME /var/hnapi

ENTRYPOINT ["/api"]
