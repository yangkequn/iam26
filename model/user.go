package model

import (
	"bytes"
	"encoding/binary"
	"errors"
	"hash/crc64"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/spaolacci/murmur3"
	"github.com/yangkequn/GoTools"
)

func (ua *UserAgent) IsMobile() bool {
	useragent, isMobile := ua.UserAgent, false

	// the list below is taken from
	// https://github.com/bcit-ci/CodeIgniter/blob/develop/system/libraries/User_agent.php

	mobiles := []string{"Mobile Explorer", "Palm", "Motorola", "Nokia", "Palm", "Apple iPhone", "iPad", "Apple iPod Touch",
		"Sony Ericsson", "Sony Ericsson", "BlackBerry", "O2 Cocoon", "Treo", "LG", "Amoi", "XDA", "MDA", "Vario", "HTC", "Samsung",
		"Sharp", "Siemens", "Alcatel", "BenQ", "HP iPaq", "Motorola", "PlayStation Portable", "PlayStation 3", "PlayStation Vita",
		"Danger Hiptop", "NEC", "Panasonic", "Philips", "Sagem", "Sanyo", "SPV", "ZTE", "Sendo", "Nintendo DSi", "NintendoDS",
		"Nintendo 3DS", "Nintendo Wii", "Open Web", "OpenWeb", "Android", "Symbian", "SymbianOS", "Palm", "Symbian S60",
		"Windows CE", "Obigo", "Netfront Browser", "Openwave Browser", "Mobile Explorer", "Opera Mini", "Opera Mobile", "Firefox Mobile",
		"Digital Paths", "AvantGo", "Xiino", "Novarra Transcoder", "Vodafone", "NTT DoCoMo", "O2", "mobile", "wireless",
		"j2me", "midp", "cldc", "up.link", "up.browser", "smartphone", "cellphone", "Generic Mobile"}

	for _, device := range mobiles {
		if strings.Index(useragent, device) > -1 {
			isMobile = true
			break
		}
	}
	return isMobile
}

type Client struct {
	ID        int64
	UserAgent uint32
	Screen    uint32
	WebZone   uint32
	IP        uint32
	LoginTM   int64
}

func (c *Client) UpdateClientID() {
	w := new(bytes.Buffer)
	binary.Write(w, binary.LittleEndian, c.UserAgent)
	binary.Write(w, binary.LittleEndian, c.Screen)
	binary.Write(w, binary.LittleEndian, c.IP)
	data := w.Bytes()
	c.ID = int64(murmur3.Sum64(data))
}

type UserAgent struct {
	ID        uint32 `gorm:"primaryKey"`
	UserAgent string
}

func (ua *UserAgent) UpdateUserAgentID() {
	ua.ID = murmur3.Sum32([]byte(ua.UserAgent))
}

func GetUint16ArrayID(arr []uint16) uint32 {
	value := uint64(arr[0]) | (uint64(arr[1]) << 16) | (uint64(arr[2]) << 32) | (uint64(arr[3]) << 48)
	buf := make([]byte, 8)
	binary.LittleEndian.PutUint64(buf, value)
	return murmur3.Sum32(buf)
}

func (wz *WebZone) UpdateWebZoneID() {
	wz.ID = GetUint16ArrayID([]uint16{wz.OuterWidth, wz.OuterHeight, wz.InnerWidth, wz.InnerHeight})
}

type WebZone struct {
	ID          uint32 `gorm:"primaryKey"`
	OuterWidth  uint16
	OuterHeight uint16
	InnerHeight uint16
	InnerWidth  uint16
}

func (sc *Screen) UpdateScreenID() {
	sc.ID = GetUint16ArrayID([]uint16{sc.Width, sc.Height, sc.AvailWidth, sc.AvailHeight})
}

type Screen struct {
	ID          uint32 `gorm:"primaryKey"`
	Width       uint16
	Height      uint16
	AvailWidth  uint16
	AvailHeight uint16
}

var Crc64ISOTable *crc64.Table = crc64.MakeTable(crc64.ISO)

var ErrBadAccountName = errors.New("bad account name")

func AccountToID(account string) (string, error) {
	//去除0打头的国家编号
	for len(account) > 8 && account[0] == '0' {
		account = account[1:]
	}
	if len(account) == 0 {
		return "", ErrBadAccountName
	}
	id := int64(crc64.Checksum([]byte(account), Crc64ISOTable))
	return GoTools.Int64ToString(id), nil
}

func (u *User) ToJWTCookie(secret string) (*http.Cookie, error) {
	iat := time.Now().Unix()
	expireHours := 24 * 60
	claims := make(jwt.MapClaims)
	claims["exp"] = iat + 3600*int64(expireHours)
	claims["iat"] = iat
	claims["id"] = u.Id
	claims["sub"] = u.Nick
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// SecretKey 用于对用户数据进行签名，不能暴露
	tk, err := token.SignedString([]byte(secret))
	cookie := http.Cookie{Name: "Authorization", Value: tk, Path: "/", Expires: time.Now().Add(time.Hour * 24 * 60), HttpOnly: true}
	return &cookie, err

}
