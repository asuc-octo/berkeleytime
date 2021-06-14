import { Course } from "#src/models/_index"
import { ExpressMiddleware } from "#src/types"

// TODO: Organize types, add validation

interface IController {}
export default new (class Controller implements IController {
  current: ExpressMiddleware<{}, {}> = async (req, res) => {}
})()
