package admin

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup, authMiddleware, adminOnlyMiddleware gin.HandlerFunc) {
	admin := rg.Group("/admin")
	admin.Use(authMiddleware, adminOnlyMiddleware)
	{
		admin.GET("/health", h.GetHealth)
		admin.GET("/metrics/usage", h.GetUsageMetrics)
		admin.GET("/metrics/api", h.GetApiPerformanceMetrics)
		admin.GET("/audit-logs", h.GetAuditLogs)
		admin.GET("/audit-logs/export", h.ExportAuditLogs)
	}
}

func (h *Handler) GetHealth(c *gin.Context) {
	health := h.service.GetSystemHealth(c.Request.Context())
	c.JSON(http.StatusOK, gin.H{"data": health})
}

func (h *Handler) GetUsageMetrics(c *gin.Context) {
	metrics, err := h.service.GetUsageMetrics(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "Error recuperant les mètriques d'ús: " + err.Error(),
			},
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": metrics})
}

func (h *Handler) GetApiPerformanceMetrics(c *gin.Context) {
	metrics, err := h.service.GetApiPerformanceMetrics(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "Error recuperant les mètriques d'API: " + err.Error(),
			},
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": metrics})
}

func (h *Handler) GetAuditLogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	search := c.Query("search")
	module := c.Query("module")

	var statusCode *int
	if codeStr := c.Query("statusCode"); codeStr != "" {
		if code, err := strconv.Atoi(codeStr); err == nil && code > 0 {
			statusCode = &code
		}
	}

	logs, err := h.service.GetAuditLogs(c.Request.Context(), page, pageSize, search, module, statusCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "Error recuperant el registre d'auditoria: " + err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": logs})
}

func (h *Handler) ExportAuditLogs(c *gin.Context) {
	search := c.Query("search")
	module := c.Query("module")

	var statusCode *int
	if codeStr := c.Query("statusCode"); codeStr != "" {
		if code, err := strconv.Atoi(codeStr); err == nil && code > 0 {
			statusCode = &code
		}
	}

	csvData, err := h.service.ExportAuditLogsCSV(c.Request.Context(), search, module, statusCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "Error generant l'exportació CSV d'auditoria: " + err.Error(),
			},
		})
		return
	}

	filename := fmt.Sprintf("petete-audit-logs-%s.csv", time.Now().Format("20060102-150405"))
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Data(http.StatusOK, "text/csv", csvData)
}
