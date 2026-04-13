const express = require("express");
const {
  listClients,
  createClient,
  updateClient,
  deleteClient,
} = require("../controllers/clientController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, listClients);
router.post("/", protect, createClient);
router.patch("/:id", protect, updateClient);
router.delete("/:id", protect, deleteClient);

module.exports = router;
