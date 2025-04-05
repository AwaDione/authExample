const { hash, compare } = require("bcryptjs")
const {createHmac} = require("crypto")

//crypter une chaine
exports.doHash = (value,saltValue)=>{
    const result = hash(value,saltValue)
    return result
}
//valider une chaine crypté
exports.doHashValidation = (value, hashedValue) => {
    const result = compare(value,hashedValue)
    return result
}
//foction de hachage
exports.hmacProcess = (value, key) => {
    const result = createHmac('sha256',key).update(value).digest('hex')
    return result
}