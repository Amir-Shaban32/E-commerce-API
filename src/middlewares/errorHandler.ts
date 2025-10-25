import { Request , Response , NextFunction ,  } from "express"


export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (err instanceof Error) {
      console.error(err.stack);
      res.status(500).send(err.message);
    } else {
      console.error(err);
      res.status(500).send("An unknown error occurred");
    }
};
  