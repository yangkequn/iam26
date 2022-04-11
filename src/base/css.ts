import CSS from "csstype"
export const cr1:CSS.Properties = {
    display: "flex", flexDirection: 'row', justifyContent: "flex-start",
    maxWidth: "100%", fontFamily: "Roboto, Arial, sans-serif", alignItems: "center"
}
export const cr0:CSS.Properties = { ...cr1, width: "100%" }
export const cv1:CSS.Properties = {
    display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center",
    maxWidth: "100%", fontFamily: "Roboto, Arial, sans-serif"
}
export const cv0:CSS.Properties = { ...cv1, width: "100%" }
export const mr = (r) => ({ marginRight: r + "em" })
export const mb = (b) => ({ marginBottom: b + "em" })


