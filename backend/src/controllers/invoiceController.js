const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const ErrorResponse = require("../utils/errorResponse");

const generateInvoiceNumber = () => {
  const suffix = Date.now().toString().slice(-6);
  return `INV-${suffix}`;
};

exports.listInvoices = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const invoices = await Invoice.find({ user: userId })
      .populate("client", "name email company")
      .sort({ createdAt: -1 });

    res.status(200).json({ invoices });
  } catch (error) {
    next(error);
  }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const {
      clientId,
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

    let resolvedClientName = clientName?.trim();
    let resolvedClientId;

    if (clientId) {
      const client = await Client.findOne({
        _id: clientId,
        user: req.user._id,
      });

      if (!client) {
        throw new ErrorResponse("Client not found", 404);
      }

      resolvedClientId = client._id;
      resolvedClientName = client.name;
    }

    if (!resolvedClientName) {
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
      client: resolvedClientId,
      clientName: resolvedClientName,
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
