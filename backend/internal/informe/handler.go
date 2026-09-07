package informe

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"petete/backend/internal/shared"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(r *gin.RouterGroup, authMiddleware gin.HandlerFunc) {
	group := r.Group("/reports", authMiddleware)
	{
		group.GET("/summary", h.GetSummary)
		group.GET("/logs", h.GetLogs)
		group.GET("/export", h.ExportExcel)
	}
}

func (h *Handler) parseFilter(c *gin.Context) (ReportFilter, error) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		return ReportFilter{}, err
	}

	filter := ReportFilter{
		UserID:   userID,
		Executor: c.Query("executor"),
	}

	if dataIniciStr := c.Query("data_inici"); dataIniciStr != "" {
		if t, err := time.Parse("2006-01-02", dataIniciStr); err == nil {
			filter.DataInici = &t
		}
	}

	if dataFiStr := c.Query("data_fi"); dataFiStr != "" {
		if t, err := time.Parse("2006-01-02", dataFiStr); err == nil {
			filter.DataFi = &t
		}
	}

	if clientIDStr := c.Query("client_id"); clientIDStr != "" {
		if id, err := uuid.Parse(clientIDStr); err == nil {
			filter.ClientID = &id
		}
	}

	if objIDStr := c.Query("objectiu_id"); objIDStr != "" {
		if id, err := uuid.Parse(objIDStr); err == nil {
			filter.ObjectiuID = &id
		}
	}

	if inicIDStr := c.Query("iniciativa_id"); inicIDStr != "" {
		if id, err := uuid.Parse(inicIDStr); err == nil {
			filter.IniciativaID = &id
		}
	}

	return filter, nil
}

func (h *Handler) GetSummary(c *gin.Context) {
	filter, err := h.parseFilter(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	summary, err := h.service.GetSummary(c.Request.Context(), filter)
	if err != nil {
		shared.RespondWithError(c, shared.NewInternalError("Error calculant el resum d'informes"))
		return
	}

	c.JSON(http.StatusOK, summary)
}

func (h *Handler) GetLogs(c *gin.Context) {
	filter, err := h.parseFilter(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	logs, err := h.service.GetLogs(c.Request.Context(), filter)
	if err != nil {
		shared.RespondWithError(c, shared.NewInternalError("Error obtenint els registres d'informes"))
		return
	}

	c.JSON(http.StatusOK, logs)
}

func (h *Handler) ExportExcel(c *gin.Context) {
	filter, err := h.parseFilter(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	fileBytes, err := h.service.ExportExcel(c.Request.Context(), filter)
	if err != nil {
		shared.RespondWithError(c, shared.NewInternalError("Error generant el fitxer Excel"))
		return
	}

	fileName := fmt.Sprintf("petete-informe-%s.xlsx", time.Now().Format("2006-01-02"))
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", fileName))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileBytes)
}
