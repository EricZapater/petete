# Build stage
FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN GOPROXY=https://proxy.golang.org,direct go mod download
COPY . .
RUN GOPROXY=https://proxy.golang.org,direct CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/api

# Final minimal stage
FROM alpine:latest
WORKDIR /app
RUN apk --no-cache add ca-certificates tzdata
COPY --from=builder /server .
COPY migrations ./migrations
EXPOSE 8080
CMD ["./server"]
