package shared

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ErrorResponse struct {
	Code    string   `json:"code"`
	Message string   `json:"message"`
	Details []string `json:"details,omitempty"`
}

type MessageResponse struct {
	Message string `json:"message"`
}

func RespondWithError(c *gin.Context, err error) {
	var appErr *AppError
	if errorsAs(err, &appErr) {
		c.JSON(appErr.Status, ErrorResponse{
			Code:    appErr.Code,
			Message: appErr.Message,
			Details: appErr.Details,
		})
		return
	}

	switch err {
	case ErrInvalidCredentials:
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Code:    "INVALID_CREDENTIALS",
			Message: err.Error(),
		})
	case ErrUserAlreadyExists:
		c.JSON(http.StatusConflict, ErrorResponse{
			Code:    "USER_ALREADY_EXISTS",
			Message: err.Error(),
		})
	case ErrUnauthorized, ErrInvalidToken:
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Code:    "UNAUTHORIZED",
			Message: err.Error(),
		})
	case ErrUserNotFound:
		c.JSON(http.StatusNotFound, ErrorResponse{
			Code:    "USER_NOT_FOUND",
			Message: err.Error(),
		})
	case ErrBadRequest:
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Code:    "BAD_REQUEST",
			Message: err.Error(),
		})
	default:
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Code:    "INTERNAL_ERROR",
			Message: "S'ha produït un error intern al servidor",
		})
	}
}

func RespondWithMessage(c *gin.Context, status int, msg string) {
	c.JSON(status, MessageResponse{Message: msg})
}

func errorsAs(err error, target interface{}) bool {
	if appErr, ok := err.(*AppError); ok {
		if ptr, okPtr := target.(**AppError); okPtr {
			*ptr = appErr
			return true
		}
	}
	return false
}
