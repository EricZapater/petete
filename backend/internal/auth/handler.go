package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"petete/backend/internal/shared"
)

const RefreshCookieName = "refresh_token"

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(r *gin.RouterGroup, authMiddleware gin.HandlerFunc) {
	authGroup := r.Group("/auth")
	{
		authGroup.POST("/register", h.Register)
		authGroup.POST("/login", h.Login)
		authGroup.POST("/refresh", h.Refresh)
		authGroup.POST("/logout", authMiddleware, h.Logout)
		authGroup.GET("/me", authMiddleware, h.GetProfile)
		authGroup.PATCH("/me", authMiddleware, h.UpdateProfile)
	}
}

func (h *Handler) setRefreshCookie(c *gin.Context, refreshToken string) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		RefreshCookieName,
		refreshToken,
		7*24*3600, // 7 days
		"/api/v1/auth",
		"",
		false, // secure (true in prod)
		true,  // httpOnly
	)
}

func (h *Handler) clearRefreshCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		RefreshCookieName,
		"",
		-1,
		"/api/v1/auth",
		"",
		false,
		true,
	)
}

func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("Format de sol·licitud incorrecte", err.Error()))
		return
	}

	resp, refreshToken, err := h.service.Register(c.Request.Context(), req)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	h.setRefreshCookie(c, refreshToken)
	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("Format de sol·licitud incorrecte", err.Error()))
		return
	}

	resp, refreshToken, err := h.service.Login(c.Request.Context(), req)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	h.setRefreshCookie(c, refreshToken)
	c.JSON(http.StatusOK, resp)
}

func (h *Handler) Refresh(c *gin.Context) {
	cookieToken, err := c.Cookie(RefreshCookieName)
	if err != nil || cookieToken == "" {
		shared.RespondWithError(c, shared.ErrInvalidToken)
		return
	}

	resp, err := h.service.RefreshToken(c.Request.Context(), cookieToken)
	if err != nil {
		h.clearRefreshCookie(c)
		shared.RespondWithError(c, err)
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) Logout(c *gin.Context) {
	cookieToken, _ := c.Cookie(RefreshCookieName)
	_ = h.service.Logout(c.Request.Context(), cookieToken)
	h.clearRefreshCookie(c)
	shared.RespondWithMessage(c, http.StatusOK, "Sessió tancada correctament")
}

func (h *Handler) GetProfile(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	user, err := h.service.GetProfile(c.Request.Context(), userID)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	userID, err := shared.GetUserIDFromContext(c)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		shared.RespondWithError(c, shared.NewBadRequestError("Format de sol·licitud incorrecte", err.Error()))
		return
	}

	user, err := h.service.UpdateProfile(c.Request.Context(), userID, req)
	if err != nil {
		shared.RespondWithError(c, err)
		return
	}

	c.JSON(http.StatusOK, user)
}
