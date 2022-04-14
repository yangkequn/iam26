package logic

import (
	"context"
	"errors"
	"strings"

	"github.com/yangkequn/GoTools"
)

var ZeroUID error = errors.New("zero uid")

//get user id from jwt token
func UID(ctx context.Context) (uid int64, err error) {
	var (
		UId          string
		UidInterface interface{}
	)

	if UidInterface = ctx.Value("id"); UidInterface == nil {
		return 0, ZeroUID
	}

	if UId = UidInterface.(string); len(UId) == 0 {
		return 0, ZeroUID
	}
	return GoTools.StringToInt64(UId), nil
}
func UId(ctx context.Context) (uid string, ok bool) {
	uid, ok = ctx.Value("id").(string)
	return uid, ok
}

func NoRowsInResultSet(err error) bool {
	return err != nil && strings.Index(err.Error(), "no rows in result set") > 0
}
