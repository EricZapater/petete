package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"petete/backend/internal/accio"
	"petete/backend/internal/auth"
	"petete/backend/internal/client"
	"petete/backend/internal/db"
	"petete/backend/internal/equip"
	"petete/backend/internal/informe"
	"petete/backend/internal/iniciativa"
	"petete/backend/internal/metrica"
	"petete/backend/internal/objectiu"
	"petete/backend/internal/registre"
	"petete/backend/internal/shared"
)

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func main() {
	log.Println("Iniciant servidor API Petete...")

	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPass := getEnv("DB_PASSWORD", "postgres")
	dbName := getEnv("DB_NAME", "petete")
	sslMode := getEnv("DB_SSLMODE", "disable")
	jwtSecret := getEnv("JWT_SECRET", "super-secret-petete-token-signing-key-2026")
	port := getEnv("PORT", "8080")

	// DB connection
	database, err := db.Connect(db.Config{
		Host:     dbHost,
		Port:     dbPort,
		User:     dbUser,
		Password: dbPass,
		DBName:   dbName,
		SSLMode:  sslMode,
	})
	if err != nil {
		log.Printf("Avís: Connexió BD no disponible immediatament (%v). Els endpoints que requereixin BD fallaran fins que estigui activa.", err)
	} else {
		defer database.Close()

		// Run migrations
		migrationsPath := getEnv("MIGRATIONS_PATH", filepath.Join("migrations"))
		if err := db.RunMigrations(database, migrationsPath); err != nil {
			log.Printf("Avís executant migracions: %v", err)
		}
	}

	// JWT Manager & Middleware
	jwtManager := shared.NewJWTManager(jwtSecret, 15*time.Minute, 7*24*time.Hour)
	authMiddleware := shared.AuthMiddleware(jwtManager)

	// Router
	r := gin.Default()

	// CORS Configuration
	allowedOrigins := []string{"http://localhost:5173", "http://localhost:3000", "https://petete.ericzapater.cat"}
	if extraOrigin := os.Getenv("CORS_ORIGIN"); extraOrigin != "" {
		allowedOrigins = append(allowedOrigins, extraOrigin)
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
			"version":   "0.2.0",
		})
	})

	// API v1
	v1 := r.Group("/api/v1")
	if database != nil {
		// Auth
		authRepo := auth.NewRepository(database)
		authService := auth.NewService(authRepo, jwtManager)
		authHandler := auth.NewHandler(authService)
		authHandler.RegisterRoutes(v1, authMiddleware)

		// Clients
		clientRepo := client.NewRepository(database)
		clientService := client.NewService(clientRepo)
		clientHandler := client.NewHandler(clientService)
		clientHandler.RegisterRoutes(v1, authMiddleware)

		// Equips
		equipRepo := equip.NewRepository(database)
		equipService := equip.NewService(equipRepo)
		equipHandler := equip.NewHandler(equipService)
		equipHandler.RegisterRoutes(v1, authMiddleware)

		// Objectius
		objectiuRepo := objectiu.NewRepository(database)
		objectiuService := objectiu.NewService(objectiuRepo)
		objectiuHandler := objectiu.NewHandler(objectiuService)
		objectiuHandler.RegisterRoutes(v1, authMiddleware)

		// Iniciatives
		iniciativaRepo := iniciativa.NewRepository(database)
		iniciativaService := iniciativa.NewService(iniciativaRepo)
		iniciativaHandler := iniciativa.NewHandler(iniciativaService)
		iniciativaHandler.RegisterRoutes(v1, authMiddleware)

		// Mètriques
		metricaRepo := metrica.NewRepository(database)
		metricaService := metrica.NewService(metricaRepo)
		metricaHandler := metrica.NewHandler(metricaService)
		metricaHandler.RegisterRoutes(v1, authMiddleware)

		// Registres Diaris
		registreRepo := registre.NewRepository(database)
		registreService := registre.NewService(registreRepo)
		registreHandler := registre.NewHandler(registreService)
		registreHandler.RegisterRoutes(v1, authMiddleware)

		// Accions
		accioRepo := accio.NewRepository(database)
		accioService := accio.NewService(accioRepo, registreRepo)
		accioHandler := accio.NewHandler(accioService)
		accioHandler.RegisterRoutes(v1, authMiddleware)

		// Informes & Reports
		informeRepo := informe.NewRepository(database)
		informeService := informe.NewService(informeRepo)
		informeHandler := informe.NewHandler(informeService)
		informeHandler.RegisterRoutes(v1, authMiddleware)
	}

	log.Printf("Servidor Petete escoltant al port :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Error arrencant el servidor: %v", err)
	}
}
