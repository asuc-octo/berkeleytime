export const AjvMiddleware = (validate) => (req, res, next) => {
  validate(req.body)
  if (validate.errors) {
    res.status(422).json({ errors: validate.errors })
  } else {
    next()
  }
}
