package logic

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"iam26/internal/svc"
	"iam26/internal/types"
	"iam26/model"

	dysmsapi "github.com/aliyun/alibaba-cloud-sdk-go/services/dysmsapi"
	"github.com/zeromicro/go-zero/core/logx"
)

type UserSentSMSPostLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserSentSMSPostLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserSentSMSPostLogic {
	return &UserSentSMSPostLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

// SendSMS 发送短信
func SendSMS(mobile, Code string) (err error) {
	client, err := dysmsapi.NewClientWithAccessKey("cn-hangzhou", "LTAI4G9Smok1wNL64BKa99d1", "ykNaeN998OrQ00BGPvWyLCMNnrvBG3")
	request := dysmsapi.CreateSendSmsRequest()
	request.Scheme = "https"
	request.PhoneNumbers = mobile
	request.SignName = "阿里云短信测试"
	request.TemplateCode = "SMS_154950909"
	request.TemplateParam = fmt.Sprintf("{code:%s}", Code)
	response, err := client.SendSms(request)
	if err != nil {
		fmt.Print(err.Error())
	}
	fmt.Printf("ali sendmsg response code is %#v\n", response.BaseResponse.GetHttpStatus())
	if response.BaseResponse.GetHttpStatus() == 200 {
		return nil
	}
	return errors.New("fail")
}
func SendEmail(account string, Code string) (err error) {
	return nil
	// todo :fullfill code here
}
func (l *UserSentSMSPostLogic) UserSentSMSPost(req *types.SentCheckCodeReq) (resp *types.ErrorRsb, err error) {
	var (
		id string
	)

	// var errPhoneOccupied error = errors.New("phone")

	if id, err = model.AccountToID(req.CountryCode + "|" + req.Phone); err != nil {
		return &types.ErrorRsb{Error: err.Error()}, nil
	}
	u, err := l.svcCtx.UserModel.FindOne(l.ctx, id)
	//判断用户是否已经注册过了
	if u != nil && err == nil {
		return &types.ErrorRsb{Error: "phone"}, nil
	}
	//code:=120101
	mobile := req.Phone
	if req.CountryCode != "86" && req.CountryCode != "086" {
		mobile = req.CountryCode + req.Phone
	}
	code := strconv.Itoa(rand.Intn(900000) + 100000)
	l.svcCtx.RedisClient.Set(l.ctx, "sms:"+req.CountryCode+"|"+req.Phone, code, time.Minute*15)
	err = SendSMS(mobile, code)
	if err == nil {
		return &types.ErrorRsb{Error: "false"}, nil
	}
	return &types.ErrorRsb{Error: "true"}, nil
}
