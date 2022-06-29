package handler

import (
	"errors"
	"io"
	"net/http"
	"reflect"
	"strings"

	"iam26/internal/logic"
	"iam26/internal/svc"
	"iam26/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func ParseMultipartForm(r *http.Request, outStruct interface{}) (err error) {
	var (
		ErrNoFile error = errors.New("no file")
	)
	if len(r.MultipartForm.File) == 0 {
		if err = r.ParseMultipartForm(1024 * 1024 * 10); err != nil {
			return
		}
	}
	if len(r.MultipartForm.File) == 0 {
		return ErrNoFile
	}
	out := reflect.ValueOf(outStruct)
	for out.Kind() == reflect.Ptr {
		out = out.Elem()
	}
	outType := out.Type()
	err = ErrNoFile
	for k, v := range r.MultipartForm.File {
		var field reflect.Value
		for i := 0; i < out.NumField(); i++ {
			tag := outType.Field(i).Tag.Get("form")
			if strings.Index(tag, k) != -1 {
				field = out.Field(i)
				break
			}
		}
		//skip if field is not exist
		if field.IsValid() == false {
			continue
		}
		err = nil
		//ensure data type of field is string
		if field.Kind() != reflect.String {
			return errors.New("field type is not string")
		}
		fh := v[0]
		f, ferr := fh.Open()
		if ferr != nil {
			return ferr
		}
		//copy content of audio to req.Audio
		var buffer []byte = make([]byte, fh.Size)
		if _, err = f.Read(buffer); err != nil && err != io.EOF {
			return err
		}
		data := string(buffer)
		field.SetString(data)
	}
	return err
}
func HeartbeatAudioPutHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.HeartbeatAudio
		if err := httpx.Parse(r, &req); err != nil {
			err = ParseMultipartForm(r, &req)
			if err != nil {
				httpx.Error(w, err)
				return
			}

			// if r.MultipartForm.File["audio"] == nil {
			// 	httpx.Error(w, err)
			// 	return
			// }
			// audio := r.MultipartForm.File["audio"][0]
			// f, err := audio.Open()
			// if err != nil {
			// 	httpx.Error(w, err)
			// 	return
			// }
			// //copy content of audio to req.Audio
			// var buffer []byte = make([]byte, audio.Size)
			// if _, err = f.Read(buffer); err != nil && err != io.EOF {
			// 	httpx.Error(w, err)
			// 	return
			// }
			// req.Audio = string(buffer)
		}

		l := logic.NewHeartbeatAudioPutLogic(r.Context(), svcCtx)
		err := l.HeartbeatAudioPut(&req)
		if err != nil {
			httpx.Error(w, err)
		} else {
			httpx.Ok(w)
		}
	}
}
