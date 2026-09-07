package metrica

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"petete/backend/internal/shared"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(r *gin.RouterGroup, authMiddleware gin.HandlerFunc) {
	group := r.Group("/metriques", authMiddleware)
	{
		group.GET("", h.List)
		group.POST("", h.Create)
		group.PATCH("/:id", h.Update)
		group.DELETE("/:id", h.Delete)
	}
}

func (h *Handler) List(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	var iniciativaID *uuid.UUID
	if iidStr := c.Query("iniciativa_id"); iidStr != "" {
		if id, err := uuid.Parse(iidStr); err == nil {
			iniciativaID = &id
		}
	}

	metriques, err := h.service.List(c.Request.Context(), userID, iniciativaID)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusOK, metriques)
}

func (h *Handler) Create(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	var req CreateMetricaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("Dades d'entrada invàlides", err.Error()))
		return
	}

	metrica, err := h.service.Create(c.Request.Context(), userID, req)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusCreated, metrica)
}

func (h *Handler) Update(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("ID de mètrica invàlid"))
		return
	}

	var req UpdateMetricaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("Dades d'entrada invàlides", err.Error()))
		return
	}

	metrica, err := h.service.Update(c.Request.Context(), userID, id, req)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusOK, metrica)
}

func (h *Handler) Delete(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("ID de mètrica invàlid"))
		return
	}

	if err := h.service.Delete(c.Request.Context(), userID, id); err != nil {
		shared.RespondWithError(c, err)
		return
	}
	shared.RespondWithMessage(c, http.StatusOK, "Mètrica esborrada correctament")
}
