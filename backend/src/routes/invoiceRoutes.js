const express = require("express");
const {
  listInvoices,
  createInvoice,
  updateInvoice,
} = require("../controllers/invoiceController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, listInvoices);
router.post("/", protect, createInvoice);
router.patch("/:id", protect, updateInvoice);

module.exports = router;
