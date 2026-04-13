const Invoice = require("../models/Invoice");
const ErrorResponse = require("../utils/errorResponse");

const generateInvoiceNumber = () => {
  const suffix = Date.now().toString().slice(-6);
  return `INV-${suffix}`;
};

exports.listInvoices = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const invoices = await Invoice.find({
      $or: [
        { user: userId },
        { user: userId.toString() },
        { user: { $exists: false } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ invoices });
  } catch (error) {
    next(error);
  }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const {
      clientName,
      invoiceNumber,
      amount,
      issuedAt,
      dueAt,
      status,
      notes,
    } = req.body;

    const normalizedAmount = Number(amount);
    const issuedDate = new Date(issuedAt);
    const dueDate = new Date(dueAt);

    if (!clientName?.trim()) {
      throw new ErrorResponse("Client name is required", 400);
    }

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      throw new ErrorResponse("Amount must be a positive number", 400);
    }

    if (Number.isNaN(issuedDate.getTime())) {
      throw new ErrorResponse("Issued date is required", 400);
    }

    if (Number.isNaN(dueDate.getTime())) {
      throw new ErrorResponse("Due date is required", 400);
    }

    const invoice = await Invoice.create({
      user: req.user._id,
      clientName: clientName.trim(),
      invoiceNumber: invoiceNumber || generateInvoiceNumber(),
      amount: normalizedAmount,
      issuedAt: issuedDate,
      dueAt: dueDate,
      status,
      notes,
    });

    res.status(201).json({ invoice });
  } catch (error) {
    next(error);
  }
};
