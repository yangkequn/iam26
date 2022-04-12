package logic

import (
	"context"
	"iam26/images"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	"github.com/golang-jwt/jwt"
	"github.com/yangkequn/GoTools"
	"github.com/zeromicro/go-zero/core/logx"
)

type UserJWTGetLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserJWTGetLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserJWTGetLogic {
	return &UserJWTGetLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func createTemporaryAccount() *model.User {
	rid := int64(rand.Uint64())

	image, imageErr := images.FS.ReadFile("images(" + strconv.Itoa(rand.Intn(488)+1) + ")")
	if imageErr != nil {
		return nil
	}
	u := model.User{
		Id:           rid,
		RootId:       0,
		Account:      "iam26_" + strconv.FormatInt(rid&0xFFFF, 16),
		Nick:         "iam26_" + strconv.FormatInt(rid&0xFFFF, 16),
		CountryPhone: "",
		Password:     0,
		Salt:         0,
		Introduction: "这是个临时账号，内容最长保留2个月，请及时登录以避免内容遗失",
		CreateTime:   time.Time{},
		UpdateTime:   time.Time{},
		Avatar:       string(image),
	}
	return &u
}
func (l *UserJWTGetLogic) UserJWTGet(req *types.JwtReq, r *http.Request, w http.ResponseWriter) (resp *types.JwtRsp, err error) {
	fail := types.JwtRsp{Jwt: "", Sub: ""}

	//todo 这段代码不能删除，后续需要恢复统计用户客户端分布等信息
	//wz := &model.WebZone{OuterWidth: req.OuterWidth, OuterHeight: req.OuterHeight, InnerHeight: req.InnerHeight, InnerWidth: req.InnerWidth}
	//wz.UpdateWebZoneID()
	//model.PQ.Model(&wz).Save(&wz)
	//
	//screen := model.Screen{Width: req.Width, Height: req.Height, AvailHeight: req.AvailHeight, AvailWidth: req.AvailWidth}
	//screen.UpdateScreenID()
	//model.PQ.Model(&screen).Save(&screen)
	//
	//ua := model.UserAgent{UserAgent: r.UserAgent()}
	//ua.UpdateUserAgentID()
	//model.PQ.Model(&ua).Save(&ua)
	//
	//ipStr := strings.Split(r.RemoteAddr, ":")[0]
	//ipv := binary.BigEndian.Uint32(net.ParseIP(ipStr).To4())
	//client := &model.Client{UserAgent: ua.ID, Screen: screen.ID, WebZone: wz.ID, IP: ipv, LoginTM: time.Now().Unix()}
	//client.UpdateClientID()
	//model.PQ.Model(&client).Save(&client)

	cookie, err := r.Cookie("Authorization")
	if err != nil || cookie == nil || cookie.Value == "" {
		//匿名临时账号
		u := createTemporaryAccount()

		//填写JWT
		cookie, err := u.ToJWTCookie(l.svcCtx.Config.Auth.AccessSecret)
		if err != nil {
			return nil, err
		}
		_, errInsert := l.svcCtx.UserModel.Insert(l.ctx, u)
		if errInsert != nil {
			return nil, errInsert
		}
		http.SetCookie(w, cookie)
		return &types.JwtRsp{Jwt: cookie.Value, Sub: u.Nick, Id: GoTools.Int64ToString(u.Id), TemporaryAccount: true}, nil
	}

	//Screen
	Jwt := cookie.Value
	token, err := jwt.Parse(Jwt, func(token *jwt.Token) (interface{}, error) {
		// since we only use the one private key to sign the tokens,
		// we also only use its public counter part to verify
		return []byte(l.svcCtx.Config.Auth.AccessSecret), nil
	})
	claims, ok := token.Claims.(jwt.MapClaims)
	if err != nil || !token.Valid || !ok {
		return &fail, nil
	}

	id := GoTools.StringToInt64(claims["id"].(string))
	if id == 0 {
		return &fail, nil
	}
	user, err := l.svcCtx.UserModel.FindOne(l.ctx, id)
	if err != nil || user == nil {
		//伪造或无效的cookie,清空
		cookie.Name = "Authorization"
		cookie.Value = ""
		cookie.Path = "/"
		cookie.Expires.Add(time.Duration(-time.Hour))
		http.SetCookie(w, cookie)
		return &fail, nil
	}
	//todo 记录客户端信息
	//if index(user.Clients, client.ID) < 0 {
	//	user.Clients = append(user.Clients, client.ID)
	//	model.PQ.Model(&user).Save(&user)
	//}
	isTemporaryAccount := len(user.CountryPhone) == 0
	return &types.JwtRsp{Jwt: Jwt, Sub: user.Nick, Id: GoTools.Int64ToString(user.Id), TemporaryAccount: isTemporaryAccount}, nil
}
