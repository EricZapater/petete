package accio

import (
	"net/http"
	"strconv"

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
	group := r.Group("/accions", authMiddleware)
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

	openOnly := true
	if openStr := c.Query("open_only"); openStr != "" {
		if val, err := strconv.ParseBool(openStr); err == nil {
			openOnly = val
		}
	}

	var clientID, iniciativaID *uuid.UUID
	if cidStr := c.Query("client_id"); cidStr != "" {
		if id, err := uuid.Parse(cidStr); err == nil {
			clientID = &id
		}
	}
	if iidStr := c.Query("iniciativa_id"); iidStr != "" {
		if id, err := uuid.Parse(iidStr); err == nil {
			iniciativaID = &id
		}
	}

	var executor *ExecutorType
	if execStr := c.Query("executor"); execStr != "" {
		ex := ExecutorType(execStr)
		executor = &ex
	}

	accions, err := h.service.List(c.Request.Context(), userID, openOnly, clientID, iniciativaID, executor)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusOK, accions)
}

func (h *Handler) GetByID(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("ID d'acció invàlid"))
		return
	}

	accio, err := h.service.GetByID(c.Request.Context(), userID, id)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusOK, accio)
}

func (h *Handler) Create(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	var req CreateAccioRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("Dades d'entrada invàlides", err.Error()))
		return
	}

	accio, err := h.service.Create(c.Request.Context(), userID, req)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusCreated, accio)
}

func (h *Handler) Update(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("ID d'acció invàlid"))
		return
	}

	var req UpdateAccioRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("Dades d'entrada invàlides", err.Error()))
		return
	}

	accio, err := h.service.Update(c.Request.Context(), userID, id, req)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}
	c.JSON(http.StatusOK, accio)
}

func (h *Handler) Delete(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("ID d'acció invàlid"))
		return
	}

	if err := h.service.Delete(c.Request.Context(), userID, id); err != nil {
		shared.RespondWithError(c, err)
		return
	}
	shared.RespondWithMessage(c, http.StatusOK, "Acció esborrada correctament")
}
