const handleError = (res, message, code = 403) => {
    res.status(code).send(message)
}
module.exports = { handleError }