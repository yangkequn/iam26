package logic

import (
	"context"
	"encoding/binary"
	"math/rand"
	"net/http"
	"strconv"
	"strings"

	"iam26/images"
	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/yangkequn/Tool"
	"github.com/zeromicro/go-zero/core/logx"
)

type UserSignUpPostLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserSignUpPostLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserSignUpPostLogic {
	return &UserSignUpPostLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UserSignUpPostLogic) UserSignUpPost(r *http.Request, w http.ResponseWriter, req *types.SignUpReq) (resp *types.ErrorRsb, err error) {
	var (
		uid     string
		smsCode string
	)
	req.Account = strings.ToLower(req.Account)
	CountryPhone := req.CountryCode + "|" + req.Phone
	for len(CountryPhone) > 1 && CountryPhone[0] == '0' {
		CountryPhone = CountryPhone[1:]
	}
	if uid, err = model.AccountToID(CountryPhone); err != nil {
		return &types.ErrorRsb{Error: err.Error()}, nil
	}
	//判断用户是否已经注册过了
	user, err := l.svcCtx.UserModel.FindOne(l.ctx, uid)
	if err == nil || user != nil {
		return &types.ErrorRsb{Error: "phone"}, nil
	}
	// 判断验证码是否有错误
	smsCode, err = l.svcCtx.RedisClient.Get(l.ctx, "sms:"+CountryPhone).Result()
	if smsCode != strconv.Itoa(req.SMSCode) {
		return &types.ErrorRsb{Error: "SMSCode"}, nil
	}

	//生成随机的password salt
	salt := rand.Int63()
	passMD5 := []byte(req.Password + Tool.Int64ToString(salt))
	password := int64(binary.LittleEndian.Uint64(passMD5))

	// New Generator: Rehuse
	image, imageErr := images.FS.ReadFile("images(" + strconv.Itoa(rand.Intn(488)+1) + ")")

	if imageErr != nil {
		l.Logger.Error("use embedding jpg err" + imageErr.Error())
	}
	var u model.User = model.User{Id: uid, Account: req.Account, CountryPhone: CountryPhone, Password: password, Salt: salt, Avatar: string(image)}

	//填写JWT
	cookie, err := u.ToJWTCookie(l.svcCtx.Config.Auth.AccessSecret)
	if err == nil {
		http.SetCookie(w, cookie)
	}
	l.svcCtx.UserModel.Insert(l.ctx, &u)

	if uid, err = model.AccountToID(u.Account); err != nil {
		return &types.ErrorRsb{Error: err.Error()}, nil
	}
	u = model.User{Id: uid, Account: req.Account, RootId: u.Id}
	l.svcCtx.UserModel.Insert(l.ctx, &u)

	if uidTemporary, err := GetUserIDFromCookie(r, l.svcCtx.Config.Auth.AccessSecret); err == nil {
		ConvertTemporaryAccountToFormalAccount(l.ctx, l.svcCtx, uidTemporary, u.Id)
	}
	return &types.ErrorRsb{Error: ""}, nil
}
