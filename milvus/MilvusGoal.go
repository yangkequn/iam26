package milvus

import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus-sdk-go/v2/entity"
	"github.com/yangkequn/Tool"
	qmilvus "github.com/yangkequn/q-milvus-driver-for-go"
)

//version 1.0 concates all text together,query it's meaning vector as search vector
// a improved version will recalculate word embedding, and take the everage word embedding as search vector

type Goal struct {
	Id         int64     `schema:"in,out" primarykey:"true"`
	Name       string    `schema:""`
	Detail     string    `schema:""`
	Risk       string    `schema:""`
	Benifites  string    `schema:""`
	Popularity int64     `schema:""`
	Vector     []float32 `dim:"384" schema:"in"` //always required,this vector is automatically calculated by meaning vector from String()
	Score      float32   ``                      //Score is always required, to receive from search
}

func (v Goal) Index() (indexFieldName string, index entity.Index) {
	index, _ = entity.NewIndexIvfFlat(entity.IP, 256)
	return "Vector", index
}

//BuildSearchVector: If your SearchVector is precalculated, Just return the vector
func (v Goal) BuildSearchVector(ctx context.Context) (Vector []float32) {
	text := fmt.Sprintf("Name:%s Detail:%s Benifites:%s Risk:%s Polularity:%d", v.Name, v.Detail, v.Risk, v.Benifites, v.Popularity)
	Vector, _ = Tool.TextToMeaning(ctx, RedisClient, text)
	return Vector
}

var GoalCollection *qmilvus.Collection = qmilvus.Collection{}.Init(milvusAdress, Goal{}, "")
