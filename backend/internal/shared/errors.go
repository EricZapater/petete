package shared

import (
	"errors"
	"net/http"
)

var (
	ErrInvalidCredentials = errors.New("credencials incorrectes")
	ErrUserAlreadyExists  = errors.New("aquest correu electrònic ja està registrat")
	ErrUserNotFound       = errors.New("usuari no trobat")
	ErrUnauthorized       = errors.New("no autoritzat")
	ErrInvalidToken       = errors.New("token invàlid o expirat")
	ErrBadRequest         = errors.New("dades d'entrada invàlides")
)

type AppError struct {
	Code    string   `json:"code"`
	Message string   `json:"message"`
	Details []string `json:"details,omitempty"`
	Status  int      `json:"-"`
}

func (e *AppError) Error() string {
	return e.Message
}

func NewBadRequestError(msg string, details ...string) *AppError {
	return &AppError{
		Code:    "INVALID_REQUEST",
		Message: msg,
		Details: details,
		Status:  http.StatusBadRequest,
	}
}

func NewUnauthorizedError(msg string) *AppError {
	return &AppError{
		Code:    "UNAUTHORIZED",
		Message: msg,
		Status:  http.StatusUnauthorized,
	}
}

func NewConflictError(msg string) *AppError {
	return &AppError{
		Code:    "RESOURCE_CONFLICT",
		Message: msg,
		Status:  http.StatusConflict,
	}
}

func NewInternalError(msg string) *AppError {
	return &AppError{
		Code:    "INTERNAL_SERVER_ERROR",
		Message: msg,
		Status:  http.StatusInternalServerError,
	}
}
