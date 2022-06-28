
export function CompressString(s: string): string {
  var r = []
  for (var i = 0; i < s.length; i++) {
    if (s[i] !== ",") {
      r.push(s[i])
      continue
    }
    var j = i + 1; while (j < s.length && s[j] === "," && (j - i) < 10000) j++;
    var l = j - i;
    if (l === 1) r.push(","); else if (l < 10) r.push("v" + l); else if (l < 100) r.push("w" + l); else if (l < 1000) r.push("x" + l); else if (l < 10000) r.push("y" + l);
    i = j - 1
  }
  return r.join("")
}