package nota

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
	group := r.Group("/notes", authMiddleware)
	{
		group.GET("", h.List)
		group.POST("", h.Create)
		group.GET("/:id", h.GetByID)
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

	var clientID *uuid.UUID
	if cidStr := c.Query("client_id"); cidStr != "" {
		if id, err := uuid.Parse(cidStr); err == nil {
			clientID = &id
		}
	}

	search := c.Query("search")

	notes, err := h.service.List(c.Request.Context(), userID, clientID, search)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusOK, notes)
}

func (h *Handler) GetByID(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("ID de nota invàlid"))
		return
	}

	nota, err := h.service.GetByID(c.Request.Context(), userID, id)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusOK, nota)
}

func (h *Handler) Create(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	var req CreateNotaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("Dades d'entrada invàlides", err.Error()))
		return
	}

	nota, err := h.service.Create(c.Request.Context(), userID, req)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusCreated, nota)
}

func (h *Handler) Update(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("ID de nota invàlid"))
		return
	}

	var req UpdateNotaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("Dades d'entrada invàlides", err.Error()))
		return
	}

	nota, err := h.service.Update(c.Request.Context(), userID, id, req)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusOK, nota)
}

func (h *Handler) Delete(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("ID de nota invàlid"))
		return
	}

	if err := h.service.Delete(c.Request.Context(), userID, id); err != nil {
		shared.RespondWithError(c, err)
		return
	}
	shared.RespondWithMessage(c, http.StatusOK, "Nota esborrada correctament")
}
