package iniciativa

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"petete/backend/internal/objectiu"
	"petete/backend/internal/shared"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(r *gin.RouterGroup, authMiddleware gin.HandlerFunc) {
	group := r.Group("/iniciatives", authMiddleware)
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

	var objectiuID *uuid.UUID
	if oidStr := c.Query("objectiu_id"); oidStr != "" {
		if id, err := uuid.Parse(oidStr); err == nil {
			objectiuID = &id
		}
	}

	var estat *objectiu.ItemStatus
	if stStr := c.Query("estat"); stStr != "" {
		st := objectiu.ItemStatus(stStr)
		estat = &st
	}

	iniciatives, err := h.service.List(c.Request.Context(), userID, objectiuID, estat)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusOK, iniciatives)
}

func (h *Handler) Create(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	var req CreateIniciativaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("Dades d'entrada invàlides", err.Error()))
		return
	}

	iniciativa, err := h.service.Create(c.Request.Context(), userID, req)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusCreated, iniciativa)
}

func (h *Handler) Update(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("ID d'iniciativa invàlid"))
		return
	}

	var req UpdateIniciativaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("Dades d'entrada invàlides", err.Error()))
		return
	}

	iniciativa, err := h.service.Update(c.Request.Context(), userID, id, req)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusOK, iniciativa)
}

func (h *Handler) Delete(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("ID d'iniciativa invàlid"))
		return
	}

	if err := h.service.Delete(c.Request.Context(), userID, id); err != nil {
		shared.RespondWithError(c, err)
		return
	}
	shared.RespondWithMessage(c, http.StatusOK, "Iniciativa esborrada correctament")
}
