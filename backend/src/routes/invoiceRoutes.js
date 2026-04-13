const express = require("express");
const {
  listInvoices,
  createInvoice,
} = require("../controllers/invoiceController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, listInvoices);
router.post("/", protect, createInvoice);

module.exports = router;
