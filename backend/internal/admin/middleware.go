package admin

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"petete/backend/internal/shared"
)

const AdminEmail = "hola@ericzapater.cat"

func RequireAdminEmail() gin.HandlerFunc {
	return func(c *gin.Context) {
		val, exists := c.Get(shared.ContextEmailKey)
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"error": gin.H{
					"code":    "FORBIDDEN",
					"message": "Accés denegat: es requereixen permisos d'administrador",
				},
			})
			c.Abort()
			return
		}

		email, ok := val.(string)
		if !ok || email != AdminEmail {
			c.JSON(http.StatusForbidden, gin.H{
				"error": gin.H{
					"code":    "FORBIDDEN",
					"message": "Accés denegat: només l'administrador autoritzat pot accedir a aquest recurs",
				},
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func determineModuleAndAction(method, path string) (string, string) {
	cleanPath := strings.TrimPrefix(path, "/api/v1")

	switch {
	case strings.HasPrefix(cleanPath, "/auth"):
		return "auth", method + " " + cleanPath
	case strings.HasPrefix(cleanPath, "/clients"):
		return "masters", method + " Clients"
	case strings.HasPrefix(cleanPath, "/equips"):
		return "masters", method + " Equips"
	case strings.HasPrefix(cleanPath, "/objectius"):
		return "masters", method + " Objectius"
	case strings.HasPrefix(cleanPath, "/iniciatives"):
		return "masters", method + " Iniciatives"
	case strings.HasPrefix(cleanPath, "/metriques"):
		return "metriques", method + " Mètriques"
	case strings.HasPrefix(cleanPath, "/registres-diaris"):
		return "daily", method + " Registres Diaris"
	case strings.HasPrefix(cleanPath, "/accions"):
		return "daily", method + " Accions"
	case strings.HasPrefix(cleanPath, "/informes"):
		return "reports", method + " Informes"
	case strings.HasPrefix(cleanPath, "/notes"):
		return "notes", method + " Notes"
	case strings.HasPrefix(cleanPath, "/admin"):
		return "admin", method + " Admin"
	default:
		return "general", method + " " + cleanPath
	}
}

func AuditMiddleware(adminService Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Ignore OPTIONS and simple health checks from logging to avoid noise
		if c.Request.Method == http.MethodOptions || c.Request.URL.Path == "/health" {
			c.Next()
			return
		}

		start := time.Now()
		c.Next()
		duration := time.Since(start)

		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}

		module, action := determineModuleAndAction(c.Request.Method, path)

		var userIDStr *string
		if val, exists := c.Get(shared.ContextUserIDKey); exists {
			s := val.(interface{ String() string }).String()
			userIDStr = &s
		}

		var userEmailStr *string
		if val, exists := c.Get(shared.ContextEmailKey); exists {
			s := val.(string)
			userEmailStr = &s
		}

		clientIP := c.ClientIP()
		userAgent := c.Request.UserAgent()

		item := &AuditLogItem{
			UserID:     userIDStr,
			UserEmail:  userEmailStr,
			Action:     action,
			Module:     module,
			Endpoint:   c.Request.URL.Path,
			Method:     c.Request.Method,
			StatusCode: c.Writer.Status(),
			DurationMS: int(duration.Milliseconds()),
			IPAddress:  &clientIP,
			UserAgent:  &userAgent,
			CreatedAt:  time.Now(),
		}

		adminService.LogAuditItem(item)
	}
}
