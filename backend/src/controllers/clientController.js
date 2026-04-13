const Client = require("../models/Client");
const ErrorResponse = require("../utils/errorResponse");

exports.listClients = async (req, res, next) => {
  try {
    const clients = await Client.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ clients });
  } catch (error) {
    next(error);
  }
};

exports.createClient = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, notes, status } = req.body;

    if (!name || !name.trim()) {
      throw new ErrorResponse("Client name is required", 400);
    }

    const client = await Client.create({
      user: req.user._id,
      name: name.trim(),
      email: typeof email === "string" ? email.trim() : undefined,
      phone: typeof phone === "string" ? phone.trim() : undefined,
      company: typeof company === "string" ? company.trim() : undefined,
      address: typeof address === "string" ? address.trim() : undefined,
      notes: typeof notes === "string" ? notes.trim() : undefined,
      status: status || "active",
    });

    res.status(201).json({ client });
  } catch (error) {
    next(error);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, address, notes, status } = req.body;

    if (name !== undefined && !name.trim()) {
      throw new ErrorResponse("Client name cannot be empty", 400);
    }

    const updatedClient = await Client.findOneAndUpdate(
      { _id: id, user: req.user._id },
      {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(email !== undefined ? { email: email.trim() || undefined } : {}),
        ...(phone !== undefined ? { phone: phone.trim() || undefined } : {}),
        ...(company !== undefined ? { company: company.trim() || undefined } : {}),
        ...(address !== undefined ? { address: address.trim() || undefined } : {}),
        ...(notes !== undefined ? { notes: notes.trim() || undefined } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      throw new ErrorResponse("Client not found", 404);
    }

    res.status(200).json({ client: updatedClient });
  } catch (error) {
    next(error);
  }
};

exports.deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedClient = await Client.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deletedClient) {
      throw new ErrorResponse("Client not found", 404);
    }

    res.status(200).json({ message: "Client deleted" });
  } catch (error) {
    next(error);
  }
};
