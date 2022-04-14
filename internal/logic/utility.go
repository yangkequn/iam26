package logic

import (
	"context"
	"errors"
	"net/http"
	"reflect"
	"strings"

	"github.com/golang-jwt/jwt"
)

var ZeroUID error = errors.New("zero uid")

//get user id from jwt token
func UID(ctx context.Context) (uid string, err error) {
	var (
		uidInterface interface{}
		ok           bool
	)
	if uidInterface = ctx.Value("id"); uidInterface == nil {
		return "", ZeroUID
	}

	if uid, ok = ctx.Value("id").(string); ok == false {
		return "", ZeroUID
	}
	return uid, nil
}

func NoRowsInResultSet(err error) bool {
	return err != nil && strings.Index(err.Error(), "no rows in result set") > 0
}

var ErrInvalidToken = errors.New("invalid token")

//l.svcCtx.Config.Auth.
func GetUserIDFromCookie(r *http.Request, AccessSecret string) (string, error) {
	cookie, err := r.Cookie("Authorization")
	if err != nil || cookie == nil || cookie.Value == "" {
		return "", err
	}
	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
		return []byte(AccessSecret), nil
	})
	if err != nil {
		return "", err
	}
	if !token.Valid {
		return "", ErrInvalidToken
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", ErrInvalidToken
	}

	idInterface := claims["id"]
	if idInterface == nil || reflect.TypeOf(idInterface).Kind() != reflect.String {
		return "", ErrInvalidToken
	}
	return idInterface.(string), nil
}
