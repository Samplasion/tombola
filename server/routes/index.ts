import express from "express";
const router = express.Router();

router.get("/a", (req, res) => {
    res.send({ response: "I am alive" }).status(200);
});

export default router;