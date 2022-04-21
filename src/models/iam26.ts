import * as components from "./MeasureIndex"
export * from "./MeasureIndex"

/**
 * @description 
 * @param req
 */
export function measureIndexItemPut(req: components.MeasureIndex) {
	return webapi.put<components.MeasureIndex>("/measureIndexItem", req)
}
