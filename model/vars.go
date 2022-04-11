package model

import (
	"errors"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var ErrNotFound = sqlx.ErrNotFound

var ErrUpdateFail error = errors.New("update corpus failed")

var ErrLoginFail error = errors.New("login failed")

var ErrLoginNeeded error = errors.New("loginNeeded")

var ErrCitedShouldNotEmpty = errors.New("cited should not empty")

var ErrNoCorpus error = errors.New("noSuchCorpus")

var ErrNoUserTheme error = errors.New("noSuchUserThemes")

var ErrActionNotAllow error = errors.New("actionNotAllow")

var ErrAccessNotAllowed error = errors.New("accessNotAllowed")

var ErrBadCorpusID error = errors.New("badCorpusID")
