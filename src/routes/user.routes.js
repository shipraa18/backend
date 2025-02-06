import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {loginUser} from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import { logoutUser } from "../controllers/user.controller.js";
import {refreshToken} from "../controllers/user.controller.js";

const router=Router();


router.route('/register').post(
          upload.fields([
                    {
                              name: "avatar",
                              maxCount: 1
                    },
                    {
                              name: "coverImage",
                              maxCount: 2
                    }

          ]),
          registerUser
);

router.route('/login').post(loginUser)


// secured routes

router.route('/logout').post( verifyJWT, logoutUser )

router.route('/refresh-token').post(refreshToken)

export default router;