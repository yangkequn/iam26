
//calculate mean squre root error
export const MSRE = (data: number[]) => {
    let sum = data.reduce((a, b) => a + b, 0) / data.length
    let squareSum = data.reduce((a, b) => a + (b - sum) * (b - sum), 0) / data.length
    return Math.sqrt(squareSum)
  }
  