export function generateRandomString(length: number): string {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = "";
  for (var i = 0; i <= length - 1; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    randomString += chars.substring(randomNumber, randomNumber + 1);
  }
  return randomString;
}
